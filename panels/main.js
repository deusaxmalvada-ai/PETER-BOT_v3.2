'use strict'

const MAIN_MENU = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃        🕷️ 𝙋𝙀𝙏𝙀𝙍-𝘽𝙊𝙏        ┃
┃          𝙈𝘼𝙄𝙉 𝙋𝘼𝙉𝙀𝙇          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                ┃
┃ 🏠 〔01〕 PRINCIPAL             ┃
┃ 👤 〔02〕 USUÁRIO               ┃
┃ 👥 〔03〕 GRUPO                 ┃
┃ 🛡️ 〔04〕 ADMINISTRAÇÃO         ┃
┃ 🎨 〔05〕 MÍDIA                 ┃
┃ 🎮 〔06〕 DIVERSÃO              ┃
┃ ⚙️ 〔07〕 SISTEMA               ┃
┃ 📊 〔08〕 STATUS                ┃
┃ 🔐 〔09〕 SEGURANÇA             ┃
┃ 💾 〔10〕 DADOS                 ┃
┃ 👑 〔11〕 OWNER                 ┃
┃                                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕷️ .menu <número>              ┃
┃ 🕸️ .m2  → Media System         ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

async function show(sock, m, from) {
  await sock.sendMessage(
    from,
    { text: MAIN_MENU },
    { quoted: m }
  )
}

module.exports = { show }
