'use strict'

const ALIASES = { ht: 'hidetag', lg: 'linkgp', ta: 'tagall', todos: 'tagall' }
const CMDS = ['hidetag', 'linkgp', 'tagall']

const num = (jid) => String(jid || '').split('@')[0].split(':')[0]

function panel(title, text) {
  const body = String(text).split('\n').join('\n│ ')
  return `╭━〔 ${title} 〕━╮\n│ ${body}\n╰━━━━━━━━━╯`
}

function isAdmin(meta, jids) {
  const ids = jids.filter(Boolean).map(num)
  return meta.participants.some(
    (p) =>
      (p.admin === 'admin' || p.admin === 'superadmin') &&
      [p.id, p.lid, p.phoneNumber].some((x) => x && ids.includes(num(x)))
  )
}

module.exports = async function group(sock, m, from, cmd, args) {
  const c = ALIASES[cmd] || cmd
  if (!CMDS.includes(c)) return false

  const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: m })

  if (!from.endsWith('@g.us')) {
    await reply(panel('⚠️ AVISO', 'Só funciona em grupo.'))
    return true
  }

  const meta = await sock.groupMetadata(from)
  const sender = m.key.participant || m.participant

  if (!isAdmin(meta, [sender])) {
    await reply(panel('🚫 NEGADO', 'Só administradores.'))
    return true
  }

  const mentions = meta.participants.map((p) => p.id)
  const text = args.join(' ')

  if (c === 'linkgp') {
    if (!isAdmin(meta, [sock.user?.id, sock.user?.lid])) {
      await reply(panel('⚠️ AVISO', 'Preciso ser admin para isso.'))
      return true
    }
    const code = await sock.groupInviteCode(from)
    await reply(panel('🔗 LINK', `https://chat.whatsapp.com/${code}`))
    return true
  }

  if (c === 'hidetag') {
    await sock.sendMessage(from, { text: text || '📢', mentions }, { quoted: m })
    return true
  }

  // tagall
  const lista = mentions.map((j) => `@${num(j)}`).join(' ')
  await sock.sendMessage(
    from,
    { text: `${panel('📣 TAGALL', text || 'Atenção, pessoal!')}\n\n${lista}`, mentions },
    { quoted: m }
  )
  return true
}
