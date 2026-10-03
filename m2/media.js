module.exports = {
 async handle(sock, m, from, args){
  const menu = `╭━━━〔 🕷️ M2 • MIDIA 〕━━━╮
│
│ 📥 1. DOWNLOAD
│ 🔄 2. CONVERSOR (.toimg)
│ 💾 3. SAVE (.save)
│ 🔁 4. REPOST (.repost)
│ 📁 5. ARQUIVO (.stickerinfo)
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(from, { text: menu }, { quoted: m })
 }
}
