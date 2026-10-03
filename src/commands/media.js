'use strict'
// .s / .sticker  → foto, vídeo ou GIF viram sticker
// .toimg         → sticker vira imagem (animado vira vídeo/GIF)
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const ui = require('../ui')
const C = require('../ctx')
const cfg = require('../config')
const { addExif } = require('../webpmeta')

const TMP = path.join(__dirname, '..', '..', 'data', 'tmp')
const MAX_STICKER = 900 * 1024   // WhatsApp recusa stickers animados grandes

function run(bin, args) {
  return new Promise((resolve, reject) => {
    execFile(bin, args, { timeout: 90000, maxBuffer: 1 << 24 }, (e, so, se) => {
      if (e) { e.stderr = String(se || ''); return reject(e) }
      resolve(String(se || ''))
    })
  })
}
const outp = (bin, args) => new Promise((res, rej) => execFile(bin, args, { timeout: 90000, maxBuffer: 1 << 24 }, (e, so) => (e ? rej(e) : res(String(so)))))
const ff = (...a) => run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a])

function explain(e) {
  const t = String((e && e.stderr) || '') + String((e && e.message) || '')
  if (e && e.code === 'ENOENT') return 'ffmpeg não está instalado. No Termux: pkg install ffmpeg'
  if (/Unknown encoder 'libwebp|libwebp/i.test(t) && /unknown|not found|Unrecognized/i.test(t)) return 'o ffmpeg não tem suporte a WebP (libwebp). Reinstala: pkg install ffmpeg'
  if (/ANIM|unsupported chunk|animated/i.test(t)) return 'este ffmpeg não lê sticker animado'
  if (/timed out|ETIMEDOUT|SIGTERM/i.test(t)) return 'demorou demais (mídia muito grande)'
  if (/Invalid data|moov atom|could not find codec/i.test(t)) return 'ficheiro de mídia inválido ou corrompido'
  return 'falha ao converter a mídia'
}

// procura mídia: resposta primeiro, depois a própria mensagem
function findMedia(c) {
  const quoted = c.ci.quotedMessage ? C.unwrap(c.ci.quotedMessage) : null
  for (const x of [quoted, c.msg]) {
    if (!x) continue
    if (x.imageMessage) return { kind: 'image', node: x.imageMessage }
    if (x.videoMessage) return { kind: 'video', node: x.videoMessage }
    if (x.stickerMessage) return { kind: 'sticker', node: x.stickerMessage }
  }
  return null
}
async function download(media) {
  const stream = await downloadContentFromMessage(media.node, media.kind)
  let b = Buffer.alloc(0)
  for await (const ch of stream) b = Buffer.concat([b, ch])
  if (!b.length) throw new Error('download vazio')
  return b
}

const SQUARE = (fps) => `${fps ? `fps=${fps},` : ''}scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000`

const withMeta = (buf, meta) => { try { return meta ? addExif(buf, meta.pack, meta.author) : buf } catch { return buf } }

async function toSticker(buf, kind, ext, tag, meta) {
  const inp = path.join(TMP, `${tag}.${ext}`), out = path.join(TMP, `${tag}.webp`)
  fs.writeFileSync(inp, buf)
  try {
    if (kind === 'image') {
      await ff('-i', inp, '-vf', SQUARE(0), '-c:v', 'libwebp', '-lossless', '0', '-q:v', '75', '-frames:v', '1', out)
      return withMeta(fs.readFileSync(out), meta)
    }
    // vídeo/GIF → sticker animado, tenta qualidades até caber
    for (const [fps, q] of [[15, 60], [12, 40], [10, 25], [8, 15]]) {
      await ff('-i', inp, '-t', '8', '-vf', SQUARE(fps), '-c:v', 'libwebp', '-loop', '0', '-an', '-q:v', String(q), '-compression_level', '6', out)
      const r = fs.readFileSync(out)
      if (r.length <= MAX_STICKER) return withMeta(r, meta)
    }
    throw new Error('o sticker animado ficou grande demais; usa um vídeo mais curto')
  } finally { for (const f of [inp, out]) try { fs.unlinkSync(f) } catch {} }
}

// sticker animado: o ffmpeg não lê WebP animado, então tenta alternativas
const PY = `import sys, os
from PIL import Image
im = Image.open(sys.argv[1]); d = sys.argv[2]; n = 0; dur = []
try:
    while True:
        im.seek(n); f = im.convert('RGBA'); bg = Image.new('RGBA', f.size, (255, 255, 255, 255)); bg.alpha_composite(f)
        bg.convert('RGB').save(os.path.join(d, 'f_%04d.png' % n)); dur.append(im.info.get('duration', 70) or 70); n += 1
except EOFError:
    pass
print(max(1, round(1000.0 / (sum(dur) / len(dur)))) if dur else 12)
`
async function animatedToMp4(inp, mp4, tag) {
  try { // 1) ffmpeg direto (funciona em alguns builds)
    await ff('-i', inp, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', mp4)
    return
  } catch {}
  const dir = path.join(TMP, `${tag}_f`); fs.mkdirSync(dir, { recursive: true })
  const vf = 'scale=trunc(iw/2)*2:trunc(ih/2)*2'
  try {
    let fps = 12
    try { // 2) Python + Pillow
      const py = path.join(TMP, `${tag}.py`); fs.writeFileSync(py, PY)
      let so
      try { so = await outp('python3', [py, inp, dir]) } catch { so = await outp('python', [py, inp, dir]) }
      fps = Math.min(25, Math.max(5, parseInt(so, 10) || 12))
      fs.unlinkSync(py)
    } catch { // 3) anim_dump (pkg install libwebp)
      await run('anim_dump', ['-folder', dir, '-prefix', 'f_', inp])
    }
    await ff('-framerate', String(fps), '-i', path.join(dir, 'f_%04d.png'), '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', vf, mp4)
  } finally { try { fs.rmSync(dir, { recursive: true, force: true }) } catch {} }
}

async function fromSticker(buf, animated, tag) {
  const inp = path.join(TMP, `${tag}.webp`)
  fs.writeFileSync(inp, buf)
  const png = path.join(TMP, `${tag}.png`), mp4 = path.join(TMP, `${tag}.mp4`)
  try {
    if (!animated) {
      await ff('-i', inp, png)
      return { type: 'image', data: fs.readFileSync(png) }
    }
    try { await animatedToMp4(inp, mp4, tag) }
    catch (e) { const er = new Error('sticker animado: instala  pkg install libwebp python-pillow  e tenta de novo'); er.custom = true; throw er }
    return { type: 'video', data: fs.readFileSync(mp4) }
  } finally { for (const f of [inp, png, mp4]) try { fs.unlinkSync(f) } catch {} }
}

async function handle(c) {
  fs.mkdirSync(TMP, { recursive: true })
  const media = findMedia(c)
  const isToimg = c.cmd === 'toimg'

  if (!media || (isToimg && media.kind !== 'sticker') || (!isToimg && media.kind === 'sticker')) {
    const msg = isToimg ? 'Responde a um sticker com .toimg' : 'Envia ou responde a uma foto/vídeo com .s'
    await c.reply(ui.warn(c.modo, c.modo === 'aranha'
      ? (isToimg ? 'Responde a um sticker. Só isso.' : 'Sem mídia. Envia foto ou vídeo com .s 🌑')
      : msg))
    return
  }

  const prog = await c.reply(ui.panel(c.modo, '⏳', 'PROCESSANDO', [isToimg ? '🔄 sticker → imagem' : '🎨 a criar sticker...']))
  const tag = `${Date.now()}_${Math.floor(Math.random() * 1e4)}`
  try {
    const buf = await download(media)
    if (isToimg) {
      const r = await fromSticker(buf, !!media.node.isAnimated, tag)
      if (r.type === 'image') await c.sock.sendMessage(c.from, { image: r.data, caption: '' }, c.qo)
      else await c.sock.sendMessage(c.from, { video: r.data, gifPlayback: true, caption: '' }, c.qo)
    } else {
      const ext = media.kind === 'video' ? 'mp4' : 'jpg'
      const webp = await toSticker(buf, media.kind, ext, tag, { pack: cfg.BOT_NAME, author: c.pushName || cfg.OWNER_NAME })
      await c.sock.sendMessage(c.from, { sticker: webp }, c.qo)
    }
    try { await c.sock.sendMessage(c.from, { text: ui.ok(c.modo, [isToimg ? '🖼️ conversão concluída' : '🎨 sticker criado']), edit: prog.key }) } catch {}
  } catch (e) {
    console.log('❌ MÍDIA:', e && e.stderr ? e.stderr : e)
    const reason = (e && (e.custom || (e.message && !e.stderr && !e.code))) ? e.message : explain(e)
    try { await c.sock.sendMessage(c.from, { text: ui.err(c.modo, reason), edit: prog.key }) } catch { await c.reply(ui.err(c.modo, reason)) }
  }
}

// .take nome | autor  → renomeia o pack/autor de um sticker (responde ao sticker)
async function take(c) {
  const media = findMedia(c)
  if (!media || media.kind !== 'sticker') { await c.reply(ui.warn(c.modo, 'Responde a um sticker com .take nome | autor')); return }
  const raw = c.args.join(' ').trim()
  if (!raw) { await c.reply(ui.warn(c.modo, 'Uso: .take nome do pack | autor (o autor é opcional)')); return }
  const [pack, author] = raw.split('|').map(x => x.trim())
  try {
    const buf = await download(media)
    const out = addExif(buf, pack.slice(0, 40), (author || c.pushName || cfg.OWNER_NAME).slice(0, 40))
    await c.sock.sendMessage(c.from, { sticker: out }, c.qo)
  } catch (e) {
    console.log('❌ TAKE:', e)
    await c.reply(ui.err(c.modo, 'não consegui renomear este sticker'))
  }
}

async function runCmd(c) {
  if (c.cmd === 's' || c.cmd === 'toimg') { await handle(c); return true }
  if (c.cmd === 'take') { await take(c); return true }
  return false
}
module.exports = { run: runCmd }
