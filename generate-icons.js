const fs = require('fs');
const path = require('path');

function createPNG(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  function crc32(buf) {
    let c = 0xffffffff;
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let v = n;
      for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
      table[n] = v;
    }
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length);
    const combined = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(combined));
    return Buffer.concat([lenBuf, combined, crcBuf]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    rawRows.push(0);
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      rawRows.push(pixels[idx], pixels[idx+1], pixels[idx+2], pixels[idx+3]);
    }
  }
  const raw = Buffer.from(rawRows);
  const blocks = [];
  let pos = 0;
  while (pos < raw.length) {
    const blockLen = Math.min(65535, raw.length - pos);
    const isLast = pos + blockLen >= raw.length;
    const header = Buffer.alloc(5);
    header[0] = isLast ? 0x01 : 0x00;
    header.writeUInt16LE(blockLen, 1);
    header.writeUInt16LE(blockLen ^ 0xffff, 3);
    blocks.push(header, raw.slice(pos, pos + blockLen));
    pos += blockLen;
  }
  let a = 1, b = 0;
  for (let i = 0; i < raw.length; i++) { a = (a + raw[i]) % 65521; b = (b + a) % 65521; }
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE((b << 16) | a);
  const zlibHeader = Buffer.from([0x78, 0x01]);
  const idatData = Buffer.concat([zlibHeader, ...blocks, adler]);
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idatData), iend]);
}

function generateIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const r = Math.floor(size * 0.22);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      let inside = true;
      const corners = [[r,r],[size-1-r,r],[r,size-1-r],[size-1-r,size-1-r]];
      for (const [cx, cy] of corners) {
        if ((x < r || x > size-1-r) && (y < r || y > size-1-r)) {
          const dx = x - cx, dy = y - cy;
          if (dx*dx + dy*dy > r*r) inside = false;
        }
      }
      if (inside) {
        const t = (x + y) / (size * 2);
        pixels[idx] = Math.round(108 + (162-108)*t);
        pixels[idx+1] = Math.round(92 + (155-92)*t);
        pixels[idx+2] = Math.round(231 + (254-231)*t);
        pixels[idx+3] = 255;
        const barY = Math.floor(size * 0.55);
        const barH = Math.floor(size * 0.12);
        const barX = Math.floor(size * 0.2);
        const barW = Math.floor(size * 0.6);
        const fillW = Math.floor(barW * 0.7);
        if (y >= barY && y < barY + barH && x >= barX && x < barX + barW) {
          pixels[idx] = 255; pixels[idx+1] = 255; pixels[idx+2] = 255; pixels[idx+3] = 80;
        }
        if (y >= barY && y < barY + barH && x >= barX && x < barX + fillW) {
          pixels[idx] = 255; pixels[idx+1] = 255; pixels[idx+2] = 255; pixels[idx+3] = 255;
        }
      } else {
        pixels[idx] = 0; pixels[idx+1] = 0; pixels[idx+2] = 0; pixels[idx+3] = 0;
      }
    }
  }
  return createPNG(size, size, pixels);
}

const wwwDir = path.join(__dirname, 'www');
[192, 512].forEach(size => {
  const buf = generateIcon(size);
  fs.writeFileSync(path.join(wwwDir, 'icon-' + size + '.png'), buf);
  console.log('Created icon-' + size + '.png');
});
