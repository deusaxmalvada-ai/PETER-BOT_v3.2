const { sendProgress, editProgress, finalize } = require('./progress')
const stickerMod = require('./sticker')
const errs = require('./errors')
module.exports = {
 async toImg(sock, m, from){
  let prog = await sendProgress(sock, from, m, '⏳ Recebendo sua midia...', 'PROCESSANDO')
  const buf = await stickerMod.getMediaBuffer(m)
  if(!buf){ await editProgress(sock, from, prog, errs.noMedia); return }
  await editProgress(sock, from, prog, '📥 Baixando sticker...', 'DOWNLOAD')
  await editProgress(sock, from, prog, '🔄 Convertendo para imagem...', 'CONVERSAO')
  try{
   await editProgress(sock, from, prog, '📤 Enviando resultado...', 'ENVIO')
   await sock.sendMessage(from, { image: buf, caption: '╭━━〔 🕷️ M2 • FINALIZADO 〕━━╮\n│\n│ ✅ Sticker -> Imagem\n│\n╰━━━━━━━━━━━━━━━━━━━━━━╯' }, { quoted: m })
   await finalize(sock, from, prog)
  }catch{ await editProgress(sock, from, prog, errs.error) }
 },
 async info(sock, m, from){
  const q=m.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const stk=q?.stickerMessage || m.message?.stickerMessage
  if(!stk){ await sock.sendMessage(from, { text: errs.noMedia }, { quoted: m }); return }
  const info = `╭━━〔 🕷️ M2 • STICKER INFO 〕━━╮\n│\n│ 📦 Pack: ${stk.packname||'N/A'}\n│ 👤 Autor: ${stk.author||'N/A'}\n│ 🎨 Tipo: ${stk.isAnimated?'Animado':'Estatico'}\n│\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(from, { text: info }, { quoted: m })
 }
}
