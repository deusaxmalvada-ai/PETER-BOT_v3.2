const { painel } = require('./errors')
module.exports = {
 async handle(sock, m, from){
  const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if(!q){ await sock.sendMessage(from, { text: painel('QUOTE', '💬 Responda uma mensagem com.quote') }, { quoted: m }); return }
  const txt = q.conversation || q.extendedTextMessage?.text || '[midia]'
  const author = m.message?.extendedTextMessage?.contextInfo?.participant || 'Desconhecido'
  const quote = `╭━━〔 🕷️ M2 • QUOTE 〕━━╮\n│\n│ 💬 "${txt}"\n│ 👤 ${author}\n│\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(from, { text: quote }, { quoted: m })
 }
}
