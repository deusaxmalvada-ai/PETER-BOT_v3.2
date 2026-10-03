'use strict'
const fs = require('fs')
const path = require('path')
const { jidNormalizedUser } = require('@whiskeysockets/baileys')
const ui = require('../ui')
const G = require('../guards')
const C = require('../ctx')
const db = require('../db')
const confirm = require('../confirm')
const STOP = path.join(__dirname, '..', '..', 'data', 'stop')

const fmt = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return `${h}h ${m}m` }

async function setModo(c, v) {
  db.setModo(v)
  const msg = v === 'aranha' ? [`🌑 ${ui.M(v).name} ativo.`, 'Silêncio.'] : [`🌀 ${ui.M(v).name} ativo.`]
  await c.reply(ui.ok(v, msg))
}

async function run(c) {
  const { cmd, args, sock } = c

  if (cmd === 'ping') {
    const t = Date.now()
    await c.reply(ui.panel(c.modo, '🏓', 'PING', [`Online ✅ · modo ${ui.M(c.modo).name}`]))
    return true
  }

  if (cmd === 'modo' || cmd === 'peter' || cmd === 'aranha') {
    if (!(await G.owner(c))) return true
    const MAP = { peter: 'peter', yuji: 'peter', aranha: 'aranha', yujim: 'aranha', modulo: 'aranha', 'módulo': 'aranha' }
    const v = MAP[cmd === 'modo' ? (args[0] || '').toLowerCase() : cmd]
    if (v !== 'peter' && v !== 'aranha') {
      await c.reply(ui.panel(c.modo, '🧠', 'MODO', [`Atual: ${ui.M(c.modo).name}`, 'Uso: .modo yuji | modulo']))
      return true
    }
    await setModo(c, v)
    return true
  }

  if (cmd === 'ia') {
    if (!(await G.owner(c))) return true
    const ai = require('../ai'), a = (args[0] || '').toLowerCase()
    if (a === 'on' || a === 'off') { db.data.aiOn = a === 'on'; db.save() }
    if (a === 'limpar') ai.clear(c.from)
    if (a === 'reload') ai.reload()
    const s = ai.status()
    await c.reply(ui.panel(c.modo, '🧠', 'IA', [
      `${s.on && s.configured ? '🟢' : '🔴'} ${s.configured ? (s.on ? 'ligada' : 'desligada') : 'sem chave (usa banco local)'}`,
      `🔌 ${s.provider} · ${s.model}`,
      `📊 ${s.hoje}/${s.limite} hoje`,
      `${ui.sc('uso')}: .ia on | off | limpar | reload`
    ]))
    return true
  }

  if (cmd === 'estilo') {
    if (!(await G.owner(c))) return true
    const n = Number(args[0])
    if (!ui.setStyle(n)) {
      const lista = Object.entries(ui.THEMES).map(([k, t]) => `${k} ${ui.T().arrow} ${t.name}`)
      await c.reply(ui.panel(c.modo, '🎨', 'ESTILO', [...lista, `${ui.sc('uso')}: .estilo 1 | 2 | 3`]))
      return true
    }
    await c.reply(ui.ok(c.modo, [`🎨 ${ui.sc('estilo')} ${n} · ${ui.THEMES[n].name}`]))
    return true
  }

  if (cmd === 'status') {
    if (!(await G.owner(c))) return true
    await c.reply(ui.panel(c.modo, '⚙️', 'STATUS', [
      `🟢 Online · 🧠 ${c.modo}`, `⏱️ ${fmt(process.uptime())} · 💾 ${Math.round(process.memoryUsage().rss / 1048576)} MB`
    ]))
    return true
  }

  if (cmd === 'setbio') {
    if (!(await G.owner(c))) return true
    const t = args.join(' ')
    if (!t) { await c.reply(ui.warn(c.modo, 'Uso: .setbio texto')); return true }
    try { await sock.updateProfileStatus(t); await c.reply(ui.ok(c.modo, ['📝 Bio atualizada.'])) }
    catch (e) { await c.reply(ui.err(c.modo, e.message)) }
    return true
  }

  if (cmd === 'setpp') {
    if (!(await G.owner(c))) return true
    const buf = (await C.imageBuffer(c)) || require('../img').read(['perfilbot', 'perfil'])
    if (!buf) { await c.reply(ui.warn(c.modo, 'Responde a uma imagem com .setpp (ou coloca perfilbot.jpg em ~/PETER-BOT/img)')); return true }
    try { await sock.updateProfilePicture(jidNormalizedUser(sock.user.id), buf); await c.reply(ui.ok(c.modo, ['🖼️ Foto atualizada.'])) }
    catch (e) { await c.reply(ui.err(c.modo, e.message)) }
    return true
  }

  if (cmd === 'setnome') {
    if (!(await G.owner(c))) return true
    const cfg = require('../config')
    const n = Number(args[0])
    if (!args.length) {
      await c.reply(ui.panel(c.modo, '🏷️', 'NOME DO BOT', [...cfg.NICKS.map((x, i) => `${i + 1} ${ui.T().arrow} ${x}`), `${ui.sc('uso')}: .setnome 1..${cfg.NICKS.length} ou .setnome texto`]))
      return true
    }
    const name = (Number.isInteger(n) && n >= 1 && n <= cfg.NICKS.length ? cfg.NICKS[n - 1] : args.join(' ')).slice(0, 25)
    try { await sock.updateProfileName(name); await c.reply(ui.ok(c.modo, [`🏷️ ${name}`])) }
    catch (e) { await c.reply(ui.err(c.modo, e.message)) }
    return true
  }

  if (cmd === 'restart') {
    if (!(await G.owner(c))) return true
    await confirm.ask(c, { action: 'RESTART' }, async () => {
      await c.reply(ui.panel(c.modo, '🔄', 'RESTART', ['Reiniciando ITADØRI...', '⏳ Aguarda a reconexão.']))
      db.flush(); setTimeout(() => process.exit(0), 800)
    })
    return true
  }

  if (cmd === 'shutdown') {
    if (!(await G.owner(c))) return true
    await confirm.ask(c, { action: 'SHUTDOWN' }, async () => {
      await c.reply(ui.panel(c.modo, '🔌', 'SHUTDOWN', ['Desligando.']))
      try { fs.writeFileSync(STOP, '1') } catch {}
      db.flush(); setTimeout(() => process.exit(0), 800)
    })
    return true
  }
  return false
}
module.exports = { run }
