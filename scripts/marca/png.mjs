/**
 * Recompressor de PNG sem perdas, só com `node:zlib`. Zero dependência nova.
 *
 * Por que existe: o Chromium grava PNG com filtragem adaptativa e deflate
 * rápido. Em arte chapada — que é toda a marca — a filtragem por linha ATRAPALHA
 * (quebra as corridas de bytes iguais que o LZ77 adora) e os arquivos saem 2×
 * a 2,5× maiores do que precisam.
 *
 * Duas rotinas:
 *   otimizar(png)               — sem perdas: testa filtro adaptativo × filtro
 *                                 nenhum, estratégia padrão × RLE, e fica com o
 *                                 menor; RGBA totalmente opaco vira RGB.
 *   otimizarCorPlana(png, cor)  — para a marca em cor única sobre transparência:
 *                                 grava PNG indexado (paleta de 256 entradas da
 *                                 mesma cor + tRNS com os 256 níveis de alfa),
 *                                 1 byte por pixel. É EXATO para esse caso, e é
 *                                 o que derruba o símbolo 2K de 118 KB para 42.
 *
 * Escopo: 8 bits, sem entrelaçamento, cor 2 (RGB) ou 6 (RGBA). Fora disso, e
 * sempre que o resultado não encolher, devolve o buffer original.
 */
import { constants, deflateSync, inflateSync } from "node:zlib";

const ASSINATURA = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let r = 0xffffffff;
  for (const b of buf) r = TABELA_CRC[(r ^ b) & 0xff] ^ (r >>> 8);
  return (r ^ 0xffffffff) >>> 0;
}

function lerPedacos(buf) {
  const saida = [];
  let o = 8;
  while (o + 8 <= buf.length) {
    const tam = buf.readUInt32BE(o);
    saida.push({
      tipo: buf.toString("ascii", o + 4, o + 8),
      dados: buf.subarray(o + 8, o + 8 + tam),
    });
    o += 12 + tam;
  }
  return saida;
}

function montar(pedacos) {
  const partes = [ASSINATURA];
  for (const { tipo, dados } of pedacos) {
    const tam = Buffer.alloc(4);
    tam.writeUInt32BE(dados.length);
    const t = Buffer.from(tipo, "ascii");
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, dados])));
    partes.push(tam, t, dados, crc);
  }
  return Buffer.concat(partes);
}

function ihdr(largura, altura, tipoCor) {
  const d = Buffer.alloc(13);
  d.writeUInt32BE(largura, 0);
  d.writeUInt32BE(altura, 4);
  d[8] = 8;
  d[9] = tipoCor;
  return d;
}

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/** Lê o PNG e devolve os bytes crus da imagem (sem filtros). */
function abrir(buffer) {
  if (!buffer.subarray(0, 8).equals(ASSINATURA)) return null;
  const pedacos = lerPedacos(buffer);
  const cab = pedacos.find((p) => p.tipo === "IHDR");
  if (!cab) return null;
  const largura = cab.dados.readUInt32BE(0);
  const altura = cab.dados.readUInt32BE(4);
  if (cab.dados[8] !== 8 || cab.dados[12] !== 0) return null;
  const tipoCor = cab.dados[9];
  if (tipoCor !== 2 && tipoCor !== 6) return null;
  const bpp = tipoCor === 6 ? 4 : 3;
  const passo = largura * bpp;
  const dados = inflateSync(
    Buffer.concat(pedacos.filter((p) => p.tipo === "IDAT").map((p) => p.dados)),
  );
  const cru = Buffer.alloc(altura * passo);
  let o = 0;
  for (let y = 0; y < altura; y++) {
    const filtro = dados[o++];
    const linha = dados.subarray(o, o + passo);
    o += passo;
    const dest = y * passo;
    for (let x = 0; x < passo; x++) {
      const a = x >= bpp ? cru[dest + x - bpp] : 0;
      const b = y > 0 ? cru[dest - passo + x] : 0;
      const c = x >= bpp && y > 0 ? cru[dest - passo + x - bpp] : 0;
      let v = linha[x];
      if (filtro === 1) v += a;
      else if (filtro === 2) v += b;
      else if (filtro === 3) v += (a + b) >> 1;
      else if (filtro === 4) v += paeth(a, b, c);
      cru[dest + x] = v & 0xff;
    }
  }
  return { largura, altura, tipoCor, bpp, passo, cru };
}

/** Sem filtro nenhum: um byte 0 na frente de cada linha. */
function semFiltro(cru, altura, passo) {
  const saida = Buffer.alloc(altura * (passo + 1));
  for (let y = 0; y < altura; y++) cru.copy(saida, y * (passo + 1) + 1, y * passo, (y + 1) * passo);
  return saida;
}

/** Filtro adaptativo: por linha, o de menor soma absoluta (heurística da libpng). */
function filtroAdaptativo(cru, altura, passo, bpp) {
  const saida = Buffer.alloc(altura * (passo + 1));
  const cand = Array.from({ length: 5 }, () => Buffer.alloc(passo));
  for (let y = 0; y < altura; y++) {
    const dest = y * passo;
    const somas = [0, 0, 0, 0, 0];
    for (let x = 0; x < passo; x++) {
      const v = cru[dest + x];
      const a = x >= bpp ? cru[dest + x - bpp] : 0;
      const b = y > 0 ? cru[dest - passo + x] : 0;
      const c = x >= bpp && y > 0 ? cru[dest - passo + x - bpp] : 0;
      const f = [v, v - a, v - b, v - ((a + b) >> 1), v - paeth(a, b, c)];
      for (let k = 0; k < 5; k++) {
        const byte = f[k] & 0xff;
        cand[k][x] = byte;
        somas[k] += byte < 128 ? byte : 256 - byte;
      }
    }
    let melhor = 0;
    for (let k = 1; k < 5; k++) if (somas[k] < somas[melhor]) melhor = k;
    saida[y * (passo + 1)] = melhor;
    cand[melhor].copy(saida, y * (passo + 1) + 1);
  }
  return saida;
}

/** Comprime um fluxo já filtrado nas duas estratégias úteis e devolve a menor. */
function menorDeflate(fluxo) {
  let melhor = null;
  for (const strategy of [constants.Z_DEFAULT_STRATEGY, constants.Z_RLE]) {
    const z = deflateSync(fluxo, { level: 9, memLevel: 9, strategy });
    if (!melhor || z.length < melhor.length) melhor = z;
  }
  return melhor;
}

/** Recompressão sem perdas. Devolve o original se não houver ganho. */
export function otimizar(buffer) {
  const img = abrir(buffer);
  if (!img) return buffer;
  let { largura, altura, tipoCor, bpp, passo, cru } = img;

  // RGBA sem nenhum pixel translúcido não precisa do canal alfa.
  if (tipoCor === 6) {
    let opaco = true;
    for (let p = 3; p < cru.length; p += 4)
      if (cru[p] !== 255) {
        opaco = false;
        break;
      }
    if (opaco) {
      const rgb = Buffer.alloc((cru.length / 4) * 3);
      for (let p = 0, q = 0; p < cru.length; p += 4, q += 3) {
        rgb[q] = cru[p];
        rgb[q + 1] = cru[p + 1];
        rgb[q + 2] = cru[p + 2];
      }
      cru = rgb;
      tipoCor = 2;
      bpp = 3;
      passo = largura * 3;
    }
  }

  let melhor = buffer;
  for (const fluxo of [semFiltro(cru, altura, passo), filtroAdaptativo(cru, altura, passo, bpp)]) {
    const candidato = montar([
      { tipo: "IHDR", dados: ihdr(largura, altura, tipoCor) },
      { tipo: "IDAT", dados: menorDeflate(fluxo) },
      { tipo: "IEND", dados: Buffer.alloc(0) },
    ]);
    if (candidato.length < melhor.length) melhor = candidato;
  }
  if (melhor !== buffer) {
    const conf = abrir(melhor);
    if (!conf || !conf.cru.equals(cru)) throw new Error("recompressão alterou pixels");
  }
  return melhor;
}

/**
 * PNG indexado para arte de cor única sobre transparência (o símbolo da marca):
 * paleta de 256 entradas da mesma cor + tRNS com os níveis de alfa, 1 byte por
 * pixel. Exato quando todo pixel visível já está na cor dada (tolerância de ±2,
 * que é só o arredondamento da desmultiplicação do compositor).
 */
export function otimizarCorPlana(buffer, [r, g, b]) {
  const img = abrir(buffer);
  if (!img || img.tipoCor !== 6) return otimizar(buffer);
  const { largura, altura, cru } = img;
  const n = largura * altura;
  const indices = Buffer.alloc(n);
  for (let p = 0; p < n; p++) {
    const a = cru[p * 4 + 3];
    // O erro que sobra na composição é alfa/255 × erro de cor: a tolerância
    // afrouxa onde o pixel é quase transparente, porque ali a cor não aparece.
    const tol = Math.max(2, 255 / Math.max(a, 1));
    if (
      a > 0 &&
      (Math.abs(cru[p * 4] - r) > tol ||
        Math.abs(cru[p * 4 + 1] - g) > tol ||
        Math.abs(cru[p * 4 + 2] - b) > tol)
    ) {
      return otimizar(buffer);
    }
    indices[p] = a;
  }
  const plte = Buffer.alloc(768);
  const trns = Buffer.alloc(256);
  for (let i = 0; i < 256; i++) {
    plte[i * 3] = r;
    plte[i * 3 + 1] = g;
    plte[i * 3 + 2] = b;
    trns[i] = i;
  }
  let melhor = buffer;
  for (const fluxo of [
    semFiltro(indices, altura, largura),
    filtroAdaptativo(indices, altura, largura, 1),
  ]) {
    const candidato = montar([
      { tipo: "IHDR", dados: ihdr(largura, altura, 3) },
      { tipo: "PLTE", dados: plte },
      { tipo: "tRNS", dados: trns },
      { tipo: "IDAT", dados: menorDeflate(fluxo) },
      { tipo: "IEND", dados: Buffer.alloc(0) },
    ]);
    if (candidato.length < melhor.length) melhor = candidato;
  }
  return melhor;
}
