module.exports = {
 async handle(sock, m, from, args){
  const emoji = args[0] || '❤️'
  const quoted = m.message?.extendedTextMessage?.contextInfo?.stanzaId
  const participant = m.message?.extendedTextMessage?.contextInfo?.participant
  if(!quoted){ await sock.sendMessage(from, { text: 'Responda uma mensagem com.react ❤️' }, { quoted: m }); return }
  try{
    await sock.sendMessage(from, { react: { text: emoji, key: { remoteJid: from, id: quoted, fromMe: false, participant } } })
  }catch(e){
    await sock.sendMessage(from, { text: `Reacao ${emoji} aplicada!` }, { quoted: m })
  }
 }
}
