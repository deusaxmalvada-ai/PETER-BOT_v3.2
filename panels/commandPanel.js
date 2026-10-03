'use strict'

const { get } = require('./commands')

function build(panelId, subId) {
  const item = get(panelId, subId)

  if (!item) return null

  return `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃        🕷️ 𝙋𝙀𝙏𝙀𝙍-𝘽𝙊𝙏        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                ┃
┃  🎯 𝙁𝙐𝙉ÇÃ𝙊                     ┃
┃                                ┃
┃  ${item.name}
┃                                ┃
┃  🧩 Comando: ${item.command}
┃  📊 Status: ${item.status}
┃                                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🕷️ .menu ${panelId}            ┃
┃  ↩️ .menu → principal           ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
}

async function show(sock, m, from, panelId, subId) {
  const text = build(panelId, subId)

  if (!text) return false

  await sock.sendMessage(
    from,
    { text },
    { quoted: m }
  )

  return true
}

module.exports = {
  build,
  show
}
