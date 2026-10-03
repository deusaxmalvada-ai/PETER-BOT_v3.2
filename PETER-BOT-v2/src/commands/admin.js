'use strict'
const ui = require('../ui')
const G = require('../guards')
const C = require('../ctx')
const db = require('../db')
const confirm = require('../confirm')
const img = require('../img')
const cfg = require('../config')

// valida alvo; devolve o participante ou null (já responde ao usuário)
async function alvo(c, { allowAdmin = false } = {}) {
  const t = C.target(c)
  if (!t) { await c.reply(ui.warn(c.modo, 'Marca ou responde à pessoa.')); return null }
  const p = C.participant(c, t)
  if (!p) { await c.reply(ui.err(c.modo, 'Essa pessoa não está no grupo.')); return null }
  const ids = C.pIds(p)
  if (ids.some(n => c.bots.includes(n))) { await c.reply(ui.err(c.modo, 'Não posso fazer isso comigo mesmo.')); return null }
  if (ids.some(n => cfg.OWNER_NUMBERS.includes(n))) { await c.reply(ui.err(c.modo, 'O proprietário é intocável.')); return null }
  if (!allowAdmin && !c.isOwner && p.admin) { await c.reply(ui.err(c.modo, 'O alvo é admin. Rebaixa primeiro.')); return null }
  return p
}
const done = (c, acao, p, extra = []) =>
  c.reply(ui.ok(c.modo, [`⚡ ${ui.sc(acao)} ${ui.T().arrow} ${c.tag(p.id)}`, `👮 ${ui.sc('por')} ${c.tag(c.sender)}`, ...extra]), [p.id, c.sender])

async function run(c) {
  const { cmd, args, sock, from } = c

  if (cmd === 'confirmar') { await confirm.run(c); return true }

  if (cmd === 'ban') {
    if (!(await G.admin(c)) || !(await G.botAdmin(c))) return true
    const p = await alvo(c); if (!p) return true
    const exec = async () => {
      try {
        await sock.groupParticipantsUpdate(from, [p.id], 'remove'); C.dropMeta(from)
        const banner = img.read(['banido', 'ban'])
        if (banner) {
          const text = ui.ok(c.modo, [`⚡ ${ui.sc('ban')} ${ui.T().arrow} ${c.tag(p.id)}`, `👮 ${ui.sc('por')} ${c.tag(c.sender)}`])
          try { await sock.sendMessage(from, { image: banner, caption: text, mentions: [p.id, c.sender] }, c.qo); return } catch {}
        }
        await done(c, 'BAN', p)
      } catch (e) { await c.reply(ui.err(c.modo, e.message)) }
    }
    // o dono manda: sem confirmação
    if (c.isOwner && cfg.OWNER_SKIPS_CONFIRM) { await exec(); return true }
    await confirm.ask(c, { action: 'BAN', target: p.id }, exec)
    return true
  }

  if (cmd === 'promover' || cmd === 'rebaixar') {
    if (!(await G.admin(c)) || !(await G.botAdmin(c))) return true
    const promo = cmd === 'promover'
    const p = await alvo(c, { allowAdmin: !promo }); if (!p) return true
    if (promo && p.admin) { await c.reply(ui.warn(c.modo, 'Já é admin.')); return true }
    if (!promo && !p.admin) { await c.reply(ui.warn(c.modo, 'Não é admin.')); return true }
    try {
      await sock.groupParticipantsUpdate(from, [p.id], promo ? 'promote' : 'demote'); C.dropMeta(from)
      await done(c, promo ? 'PROMOVER' : 'REBAIXAR', p)
    } catch (e) { await c.reply(ui.err(c.modo, e.message)) }
    return true
  }

  if (cmd === 'mute' || cmd === 'unmute') {
    if (!(await G.admin(c))) return true
    const p = await alvo(c); if (!p) return true
    const g = db.group(from), n = C.pIds(p)[0]
    if (cmd === 'mute') {
      g.muted[n] = true
      if (!c.isBotAdmin) { await c.reply(ui.warn(c.modo, 'Silenciado, mas só apago as mensagens se eu for admin.')); db.save(); return true }
    } else delete g.muted[n]
    db.save()
    await done(c, cmd === 'mute' ? 'MUTE' : 'UNMUTE', p)
    return true
  }

  if (cmd === 'warn') {
    if (!(await G.admin(c))) return true
    const p = await alvo(c); if (!p) return true
    const g = db.group(from), n = C.pIds(p)[0]
    g.warns[n] = (g.warns[n] || 0) + 1
    const total = g.warns[n]
    const motivo = args.filter(a => !a.startsWith('@') && !/^\d{8,}$/.test(a)).join(' ')
    db.save()
    await done(c, `WARN ${total}/3`, p, motivo ? [`📝 ${motivo}`] : [])
    if (total >= 3 && c.isBotAdmin) {
      g.warns[n] = 0; db.save()
      try { await sock.groupParticipantsUpdate(from, [p.id], 'remove'); C.dropMeta(from); await c.reply(ui.ok(c.modo, ['🚪 3/3 avisos: removido.']), []) } catch {}
    } else if (total >= 3) {
      await c.reply(ui.warn(c.modo, '3/3 avisos. Preciso ser admin para remover.'))
    }
    return true
  }

  if (cmd === 'warnings') {
    if (!(await G.group(c))) return true
    const t = C.target(c) || c.sender
    const n = C.num(t)
    const w = db.group(from).warns[n] || 0
    await c.reply(ui.panel(c.modo, '⚠️', 'AVISOS', [`👤 ${c.tag(t)} · ${w}/3`]), [t])
    return true
  }

  if (cmd === 'del') {
    if (!(await G.admin(c))) return true
    const id = c.ci.stanzaId
    if (!id) { await c.reply(ui.warn(c.modo, 'Responde à mensagem que queres apagar.')); return true }
    const own = c.ci.participant && c.bots.includes(C.num(c.ci.participant))
    if (!own && !(await G.botAdmin(c))) return true
    try {
      await sock.sendMessage(from, { delete: { remoteJid: from, id, participant: c.ci.participant, fromMe: !!own } })
    } catch (e) { await c.reply(ui.err(c.modo, e.message)) }
    return true
  }
  return false
}
module.exports = { run }
