'use strict'
const ui = require('../ui')
const G = require('../guards')
const db = require('../db')
const CIRC = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩']

async function run(c) {
  const { cmd, args } = c

  if (cmd === 'grupo') {
    if (!(await G.group(c))) return true
    const m = c.meta
    const adm = m.participants.filter(p => p.admin).length
    const lines = [`🏠 ${m.subject}`, `👤 ${m.participants.length} membros · 👮 ${adm} admins`]
    if (m.creation) lines.push(`📅 Criado em ${new Date(m.creation * 1000).toLocaleDateString('pt-PT')}`)
    await c.reply(ui.panel(c.modo, '👥', 'GRUPO', lines))
    return true
  }

  if (cmd === 'regras') {
    if (!(await G.group(c))) return true
    const r = db.group(c.from).rules
    await c.reply(ui.panel(c.modo, '📜', 'REGRAS', r.map((t, i) => `${CIRC[i] || (i + 1) + '.'} ${t}`)))
    return true
  }

  if (cmd === 'setregras') {
    if (!(await G.admin(c))) return true
    const list = args.join(' ').split('|').map(s => s.trim()).filter(Boolean).slice(0, 10)
    if (!list.length) { await c.reply(ui.warn(c.modo, 'Uso: .setregras regra 1 | regra 2 | regra 3')); return true }
    db.group(c.from).rules = list; db.save()
    await c.reply(ui.ok(c.modo, [`📜 ${list.length} regras guardadas.`]))
    return true
  }

  if (cmd === 'admins') {
    if (!(await G.group(c))) return true
    const adm = c.meta.participants.filter(p => p.admin)
    await c.reply(ui.panel(c.modo, '👮', 'ADMINISTRADORES', adm.map(p => `${p.admin === 'superadmin' ? '👑' : '🛡️'} ${c.tag(p.id)}`)), adm.map(p => p.id))
    return true
  }

  if (cmd === 'linkgp') {
    if (!(await G.admin(c)) || !(await G.botAdmin(c))) return true
    const code = await c.sock.groupInviteCode(c.from)
    await c.reply(ui.panel(c.modo, '🔗', 'LINK DO GRUPO', [`🏠 ${c.meta.subject}`, `🔗 https://chat.whatsapp.com/${code}`]))
    return true
  }

  if (cmd === 'tagall') {
    if (!(await G.admin(c))) return true
    const ids = c.meta.participants.map(p => p.id)
    const txt = args.join(' ') || '📣 Atenção, pessoal!'
    await c.reply(`📣 ${txt}\n\n${ids.map(i => c.tag(i)).join(' ')}`, ids)
    return true
  }

  if (cmd === 'hidetag') {
    if (!(await G.admin(c))) return true
    const ids = c.meta.participants.map(p => p.id)
    const quoted = c.ci.quotedMessage && (c.ci.quotedMessage.conversation || c.ci.quotedMessage.extendedTextMessage?.text)
    await c.reply(args.join(' ') || quoted || '📢 Aviso do grupo.', ids)
    return true
  }

  if (cmd === 'welcome' || cmd === 'bye') {
    if (!(await G.admin(c))) return true
    const v = (args[0] || '').toLowerCase()
    if (v !== 'on' && v !== 'off') { await c.reply(ui.warn(c.modo, `Uso: .${cmd} on | off`)); return true }
    db.group(c.from)[cmd] = v === 'on'; db.save()
    await c.reply(ui.ok(c.modo, [`${cmd === 'welcome' ? '💌 Boas-vindas' : '🚪 Despedida'}: ${v === 'on' ? 'ligada' : 'desligada'}`]))
    return true
  }
  return false
}
module.exports = { run }
