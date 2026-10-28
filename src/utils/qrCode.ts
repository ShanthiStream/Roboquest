/**
 * Self-contained QR Code Generator (ISO/IEC 18004 compliant)
 * Generates pure QR Code matrices and draws them directly to HTML5 Canvas.
 */

// Galois Field GF(256) tables
const expTable = new Uint8Array(512);
const logTable = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    expTable[i] = x;
    expTable[i + 255] = x;
    logTable[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return expTable[logTable[a] + logTable[b]];
}

function rsGenPoly(n: number): number[] {
  let poly = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], expTable[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: number[], nEc: number): number[] {
  const gen = rsGenPoly(nEc);
  const res = [...data, ...new Array(nEc).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

/**
 * Generate a 2D boolean matrix representing a QR code.
 * true = dark module, false = light module.
 */
export function generateQRCodeMatrix(text: string, version: 3 | 4 = 4): boolean[][] {
  const isV4 = version === 4;
  const size = isV4 ? 33 : 29;
  const nData = isV4 ? 80 : 55;
  const nEc = isV4 ? 20 : 15;
  const alignPos = isV4 ? [6, 26] : [6, 22];

  // UTF-8 encode input string
  const encoder = new TextEncoder();
  const rawBytes = Array.from(encoder.encode(text));

  // Bitstream: Byte mode (0100) + 8-bit character count + data bytes
  const bits: number[] = [0, 1, 0, 0];
  const len = rawBytes.length;
  for (let i = 7; i >= 0; i--) {
    bits.push((len >> i) & 1);
  }
  for (const b of rawBytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((b >> i) & 1);
    }
  }

  // Terminator (up to 4 zeros)
  const termLen = Math.min(4, nData * 8 - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);

  // Pad to multiple of 8 bits
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Assemble data codewords
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    codewords.push(byte);
  }

  // Pad bytes (0xEC, 0x11)
  const pads = [0xec, 0x11];
  let pIdx = 0;
  while (codewords.length < nData) {
    codewords.push(pads[pIdx]);
    pIdx ^= 1;
  }

  // Error correction calculation (Reed-Solomon)
  const ecCodewords = rsEncode(codewords, nEc);
  const finalCodewords = [...codewords, ...ecCodewords];

  // Build grid
  const matrix: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  const setFn = (r: number, c: number, val: boolean) => {
    matrix[r][c] = val;
    isFunction[r][c] = true;
  };

  // 1. Finder patterns (7x7) + separators
  const addFinder = (startR: number, startC: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = startR + r;
        const mc = startC + c;
        if (mr >= 0 && mr < size && mc >= 0 && mc < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
              setFn(mr, mc, true);
            } else {
              setFn(mr, mc, false);
            }
          } else {
            setFn(mr, mc, false);
          }
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // 2. Alignment patterns
  for (const r of alignPos) {
    for (const c of alignPos) {
      if (isFunction[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const mr = r + dr;
          const mc = c + dc;
          const val = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
          setFn(mr, mc, val);
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 0; i < size; i++) {
    if (!isFunction[6][i]) setFn(6, i, i % 2 === 0);
    if (!isFunction[i][6]) setFn(i, 6, i % 2 === 0);
  }

  // 4. Dark module
  setFn(4 * version + 9, 8, true);

  // 5. Reserve format info areas
  for (let c = 0; c < 9; c++) {
    if (!isFunction[8][c]) setFn(8, c, false);
    if (!isFunction[c][8]) setFn(c, 8, false);
  }
  for (let c = size - 8; c < size; c++) {
    setFn(8, c, false);
  }
  for (let r = size - 7; r < size; r++) {
    setFn(r, 8, false);
  }

  // 6. Place data bits using Mask 0 ((r + c) % 2 === 0)
  const finalBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      finalBits.push((cw >> i) & 1);
    }
  }

  let bitIdx = 0;
  let col = size - 1;
  let goingUp = true;

  while (col > 0) {
    if (col === 6) col -= 1; // Skip vertical timing column

    const rowStart = goingUp ? size - 1 : 0;
    const rowEnd = goingUp ? -1 : size;
    const rowStep = goingUp ? -1 : 1;

    for (let r = rowStart; r !== rowEnd; r += rowStep) {
      for (const c of [col, col - 1]) {
        if (!isFunction[r][c]) {
          const b = bitIdx < finalBits.length ? finalBits[bitIdx] : 0;
          bitIdx++;
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = (b ^ (mask ? 1 : 0)) === 1;
        }
      }
    }

    goingUp = !goingUp;
    col -= 2;
  }

  // 7. Format Information (Level L = 01, Mask 0 = 000 -> 0b01000 = 8)
  let fmt = 8 << 10;
  for (let i = 14; i >= 10; i--) {
    if (fmt & (1 << i)) {
      fmt ^= 0x537 << (i - 10);
    }
  }
  const fmtBits = ((8 << 10) | fmt) ^ 0x5412;

  const fmtList: boolean[] = [];
  for (let i = 14; i >= 0; i--) {
    fmtList.push(((fmtBits >> i) & 1) === 1);
  }

  const coords1 = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  const coords2 = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]
  ];

  for (let i = 0; i < 15; i++) {
    const [r1, c1] = coords1[i];
    matrix[r1][c1] = fmtList[i];
    const [r2, c2] = coords2[i];
    matrix[r2][c2] = fmtList[i];
  }

  return matrix;
}

/**
 * Draw QR Code directly to an HTML5 Canvas context with styling & quiet zone.
 */
export function drawQRCode(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  options?: {
    darkColor?: string;
    lightColor?: string;
    quietZone?: number;
    borderRadius?: number;
  }
): void {
  const darkColor = options?.darkColor || '#070b19';
  const lightColor = options?.lightColor || '#ffffff';
  const quietZone = options?.quietZone ?? 3;
  const borderRadius = options?.borderRadius ?? 8;

  const matrix = generateQRCodeMatrix(text, 4);
  const matrixSize = matrix.length;
  const totalModules = matrixSize + quietZone * 2;
  const moduleSize = size / totalModules;

  ctx.save();

  // Background plate with rounded corners
  ctx.fillStyle = lightColor;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, size, size, borderRadius);
  } else {
    ctx.rect(x, y, size, size);
  }
  ctx.fill();

  // Draw dark modules
  ctx.fillStyle = darkColor;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const mx = x + (c + quietZone) * moduleSize;
        const my = y + (r + quietZone) * moduleSize;
        ctx.fillRect(Math.round(mx), Math.round(my), Math.ceil(moduleSize), Math.ceil(moduleSize));
      }
    }
  }

  ctx.restore();
}
