'use strict'
// Downloads com yt-dlp (instalar: pkg install yt-dlp  ou  pip install -U yt-dlp)
//   .mp3 / .play  título ou link → áudio      .soundcloud título/link   .spotify título/link
//   .mp4 link/título → vídeo                  .tt link · .ig link · .fb link
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const ui = require('../ui')

const TMP = path.join(__dirname, '..', '..', 'data', 'tmp')
const AUDIO_MAX = '40M', VIDEO_MAX = '45M', MAX_MIN = 15
const isUrl = s => /^https?:\/\/\S+$/i.test(s)
let busy = 0
const lastUse = new Map()

function ytdlp(args) {
  return new Promise((resolve, reject) => {
    execFile('yt-dlp', args, { timeout: 240000, maxBuffer: 1 << 24 }, (e, so, se) => {
      if (e) { e.stderr = String(se || ''); return reject(e) }
      resolve(String(so || ''))
    })
  })
}
function explain(e) {
  const t = String((e && e.stderr) || '') + String((e && e.message) || '')
  if (e && e.code === 'ENOENT') return 'o yt-dlp não está instalado. No Termux: pkg install yt-dlp'
  if (/larger than max-filesize|File is larger/i.test(t)) return 'o ficheiro é grande demais para enviar'
  if (/does not pass filter|duration/i.test(t)) return `só aceito até ${MAX_MIN} minutos`
  if (/Unsupported URL/i.test(t)) return 'link não suportado'
  if (/Sign in to confirm|not a bot|HTTP Error 403|Forbidden/i.test(t)) return 'a plataforma bloqueou o pedido. Atualiza: pip install -U yt-dlp'
  if (/Private video|login|members-only|age/i.test(t)) return 'o conteúdo é privado ou restrito'
  if (/No video could be found|no results|Video unavailable/i.test(t)) return 'não encontrei nada com isso'
  if (/timed out|ETIMEDOUT|SIGTERM/i.test(t)) return 'demorou demais'
  return 'falha ao baixar'
}

async function spotifyTitle(url) {
  try {
    const r = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(url), { signal: AbortSignal.timeout(10000) })
    if (r.ok) { const j = await r.json(); return String(j.title || '') }
  } catch {}
  return ''
}

const KINDS = {
  mp3: { audio: true, doc: true }, play: { audio: true, cover: true }, soundcloud: { audio: true, sc: true }, spotify: { audio: true, sp: true, cover: true },
  mp4: { audio: false }, tt: { audio: false, url: true }, ig: { audio: false, url: true }, fb: { audio: false, url: true }
}

async function resolveTarget(k, q) {
  if (k.url && !isUrl(q)) return null
  if (isUrl(q)) {
    if (k.sp) { const t = await spotifyTitle(q); return t ? `ytsearch1:${t} audio` : null }
    return q
  }
  if (k.sp) return `ytsearch1:${q} audio`
  if (k.sc) return `scsearch1:${q}`
  return `ytsearch1:${q}`
}

async function run(c) {
  const k = KINDS[c.cmd]
  if (!k) return false
  const q = c.args.join(' ').trim().slice(0, 200)
  if (!q) {
    await c.reply(ui.warn(c.modo, k.url ? `Uso: .${c.cmd} link` : `Uso: .${c.cmd} ${k.audio ? 'título ou link' : 'link ou título'}`))
    return true
  }
  const now = Date.now()
  if (now - (lastUse.get(c.senderNum) || 0) < 8000) { await c.reply(ui.warn(c.modo, 'Calma, um pedido de cada vez.')); return true }
  if (busy >= 2) { await c.reply(ui.warn(c.modo, 'Estou ocupado com outros downloads. Tenta daqui a pouco.')); return true }
  if (k.url && !isUrl(q)) { await c.reply(ui.warn(c.modo, `Uso: .${c.cmd} link (começa por http)`)); return true }
  lastUse.set(c.senderNum, now)

  fs.mkdirSync(TMP, { recursive: true })
  const prog = await c.reply(ui.panel(c.modo, '⏳', 'PROCESSANDO', [k.audio ? '🎵 a procurar e baixar áudio...' : '🎬 a baixar vídeo...']))
  const edit = async (text) => { try { await c.sock.sendMessage(c.from, { text, edit: prog.key }) } catch { await c.reply(text) } }
  const tag = `dl_${now}_${Math.floor(Math.random() * 1e4)}`
  busy++
  try {
    const target = await resolveTarget(k, q)
    if (!target) { await edit(ui.err(c.modo, k.url ? 'manda um link válido' : 'não consegui ler esse link')); return true }
    const out = path.join(TMP, tag + '.%(ext)s')
    const base = ['--no-playlist', '--no-warnings', '--no-simulate', '--print', 'after_move:%(title)s¦%(uploader)s¦%(duration_string)s¦%(webpage_url)s', '-o', out]
    if (k.cover) base.push('--write-thumbnail', '--convert-thumbnails', 'jpg')
    const args = k.audio
      ? [...base, '-x', '--audio-format', 'mp3', '--audio-quality', '5', '--max-filesize', AUDIO_MAX, '--match-filter', `duration<=${MAX_MIN * 60}`]
      : [...base, '-f', 'bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b', '--merge-output-format', 'mp4', '--max-filesize', VIDEO_MAX, '--match-filter', `duration<=${MAX_MIN * 60}`]
    const so = await ytdlp([...args, '--', target])
    const line = so.split('\n').map(s => s.trim()).filter(Boolean).pop() || ''
    const [t0, artist, dur, link] = line.split('¦')
    const title = (t0 || 'ITADØRI').slice(0, 80), safe = title.replace(/[\\/:*?"<>|]/g, ' ').trim() || 'musica'
    const files = fs.readdirSync(TMP).filter(f => f.startsWith(tag + '.'))
    const file = files.find(f => /\.(mp3|m4a|opus|ogg|mp4|webm|mkv)$/i.test(f))
    if (!file) { await edit(ui.err(c.modo, 'não encontrei nada com isso')); return true }
    const buf = fs.readFileSync(path.join(TMP, file))
    const q0 = c.qo
    if (!k.audio) {
      await c.sock.sendMessage(c.from, { video: buf, mimetype: 'video/mp4', caption: title }, q0)
    } else if (k.doc) {            // .mp3 → documento (ficheiro)
      await c.sock.sendMessage(c.from, { document: buf, mimetype: 'audio/mpeg', fileName: safe + '.mp3', caption: `🎵 ${title}` }, q0)
    } else {
      if (k.cover) {                // .play / .spotify → capa + informações, depois o áudio
        const th = files.find(f => /\.(jpe?g|png|webp)$/i.test(f))
        if (th) {
          let cover = fs.readFileSync(path.join(TMP, th))
          try { const sq = path.join(TMP, tag + '_sq.jpg'); await new Promise((res, rej) => execFile('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(TMP, th), '-vf', "crop='min(iw,ih)':'min(iw,ih)'", sq], e => e ? rej(e) : res())); cover = fs.readFileSync(sq) } catch {}
          const info = [`🎶 ${title}`, artist && artist !== 'NA' ? `👤 ${artist}` : '', dur && dur !== 'NA' ? `⏱️ ${dur}` : '', link && link !== 'NA' ? `🔗 ${link}` : ''].filter(Boolean)
          await c.sock.sendMessage(c.from, { image: cover, caption: ui.panel(c.modo, '🎵', 'MÚSICA', info) }, q0)
        }
      }
      await c.sock.sendMessage(c.from, { audio: buf, mimetype: 'audio/mpeg', fileName: safe + '.mp3' }, q0)
    }
    await edit(ui.ok(c.modo, [`${k.audio ? '🎵' : '🎬'} ${title}`]))
  } catch (e) {
    console.log('❌ DOWNLOAD:', e && e.stderr ? e.stderr.slice(-400) : e)
    await edit(ui.err(c.modo, explain(e)))
  } finally {
    busy--
    for (const f of fs.readdirSync(TMP)) if (f.startsWith(tag + '.')) try { fs.unlinkSync(path.join(TMP, f)) } catch {}
  }
  return true
}
module.exports = { run }
