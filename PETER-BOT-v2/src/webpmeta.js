'use strict'
// Escreve nome do pack e autor (EXIF) num sticker WebP, sem recodificar (mantém animação e qualidade).
function exifBuf(pack, author) {
  const json = { 'sticker-pack-id': 'itadori-' + Date.now().toString(36), 'sticker-pack-name': pack, 'sticker-pack-publisher': author, emojis: ['🌀'] }
  const head = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
  const j = Buffer.from(JSON.stringify(json), 'utf8')
  const e = Buffer.concat([head, j]); e.writeUIntLE(j.length, 14, 4)
  return e
}
function addExif(webp, pack, author) {
  if (webp.length < 20 || webp.toString('ascii', 0, 4) !== 'RIFF' || webp.toString('ascii', 8, 12) !== 'WEBP') throw new Error('WebP inválido')
  const list = []
  let o = 12
  while (o + 8 <= webp.length) {
    const id = webp.toString('ascii', o, o + 4), sz = webp.readUInt32LE(o + 4)
    list.push({ id, data: Buffer.from(webp.slice(o + 8, o + 8 + sz)) })
    o += 8 + sz + (sz & 1)
  }
  const chunks = list.filter(c => c.id !== 'EXIF')
  let vp8x = chunks.find(c => c.id === 'VP8X')
  if (!vp8x) {
    const img = chunks.find(c => c.id === 'VP8 ' || c.id === 'VP8L')
    let w = 512, h = 512
    if (img && img.id === 'VP8 ' && img.data.length >= 10) { w = img.data.readUInt16LE(6) & 0x3fff; h = img.data.readUInt16LE(8) & 0x3fff }
    else if (img && img.id === 'VP8L' && img.data.length >= 5) { const b = img.data.readUInt32LE(1); w = (b & 0x3fff) + 1; h = ((b >> 14) & 0x3fff) + 1 }
    const d = Buffer.alloc(10); d.writeUIntLE(w - 1, 4, 3); d.writeUIntLE(h - 1, 7, 3)
    vp8x = { id: 'VP8X', data: d }; chunks.unshift(vp8x)
  }
  vp8x.data[0] |= 0x08
  chunks.push({ id: 'EXIF', data: exifBuf(pack, author) })
  const parts = [Buffer.from('WEBP')]
  for (const c of chunks) {
    const h = Buffer.alloc(8); h.write(c.id, 0, 'ascii'); h.writeUInt32LE(c.data.length, 4)
    parts.push(h, c.data); if (c.data.length & 1) parts.push(Buffer.alloc(1))
  }
  const body = Buffer.concat(parts), hd = Buffer.alloc(8)
  hd.write('RIFF', 0, 'ascii'); hd.writeUInt32LE(body.length, 4)
  return Buffer.concat([hd, body])
}
module.exports = { addExif }
