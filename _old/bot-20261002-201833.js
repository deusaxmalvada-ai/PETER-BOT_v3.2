'use strict'
const cfg = require('./src/config')
const C = require('./src/ctx')
const db = require('./src/db')
const ui = require('./src/ui')
const aliases = require('./src/aliases')
const welcome = require('./src/welcome')
const dialog = require('./src/dialog/engine')
const ai = require('./src/ai')

// ordem dos módulos de comando
const modules = [
  require('./src/commands/menus'),
  require('./src/commands/media'),
  require('./src/commands/system'),
  require('./src/commands/fun'),
  require('./src/commands/group'),
  require('./src/commands/admin')
]

// M2 (mídia) continua exatamente como estava
let M2 = null
try { M2 = require('./m2') } catch (e) { console.log('⚠️ M2 não carregou:', e.message) }

async function handle(sock, m) {
  const from = m.key && m.key.remoteJid
  if (!from || from === 'status@broadcast' || !m.message) return

  const c = await C.build(sock, m)
  c.modo = db.getModo()

  // membro silenciado: apaga a mensagem (se o bot for admin)
  if (c.isGroup && c.isBotAdmin && !c.isAdmin && !c.isOwner) {
    if (db.group(from).muted[c.senderNum]) {
      try { await sock.sendMessage(from, { delete: m.key }) } catch {}
      return
    }
  }

  // M2: auto-sticker
  if (M2 && M2.autoSticker && M2.autoSticker.checkAndRun) {
    try { if (await M2.autoSticker.checkAndRun(sock, m, from)) return } catch (e) { console.log('M2 auto ERR', e.message) }
  }

  const text = c.text
  if (!text) return

  // COMANDOS
  if (text.startsWith(cfg.PREFIX)) {
    const parts = text.slice(cfg.PREFIX.length).trim().split(/\s+/)
    let cmd = (parts.shift() || '').toLowerCase()
    if (!cmd) return
    cmd = aliases[cmd] || cmd
    c.cmd = cmd; c.args = parts

    for (const mod of modules) {
      try { if (await mod.run(c)) return }
      catch (e) {
        console.log('❌ Erro no comando', cmd, e)
        try { await c.reply(ui.err(c.modo, 'Falha interna. Tenta de novo.')) } catch {}
        return
      }
    }
    if (M2 && M2.handleCommand) {
      try { await M2.handleCommand(sock, m, from, cmd, parts) } catch (e) { console.log('M2 ERR', e.message) }
    }
    return
  }

  // DIÁLOGO: menção ao bot, resposta a mensagem do bot, ou chamar pelo nome
  if (c.mentionsBot || c.repliesBot || /\b(peter|aranha)\b/i.test(text)) {
    let r = null
    const cat = dialog.detect(text)
    if (ai.enabled() && !dialog.LOCAL_ONLY.has(cat)) {
      try {
        const lvl = c.modo === 'aranha' && !c.isOwner ? dialog.level(from, cat) : 1
        try { await sock.sendPresenceUpdate('composing', from) } catch {}
        r = await ai.reply({ c, lvl })
        if (r) await new Promise(res => setTimeout(res, ai.typingMs(r.text)))
        try { await sock.sendPresenceUpdate('paused', from) } catch {}
      } catch (e) { console.log('⚠️ IA:', e.message) }
    }
    if (!r) r = dialog.respond(c)
    if (r) await sock.sendMessage(from, { text: r.text, mentions: r.mentions }, { quoted: m })
  }
}

module.exports = handle
module.exports.sendWelcome = welcome.sendWelcome
module.exports.sendBye = welcome.sendBye
