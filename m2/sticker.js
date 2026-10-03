const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const { exec } = require('child_process')
const fs = require('fs')
const { sendProgress, editProgress, finalize } = require('./progress')
const errs = require('./errors')

async function getBuf(msgObj){
 try{
  let m=msgObj
  for(let i=0;i<6;i++){ if(!m) break; if(m.viewOnceMessageV2) m=m.viewOnceMessageV2.message; else if(m.viewOnceMessage) m=m.viewOnceMessage.message; else if(m.ephemeralMessage) m=m.ephemeralMessage.message; else if(m.documentWithCaptionMessage) m=m.documentWithCaptionMessage.message; else break }
  if(!m) return null
  const type=Object.keys(m)[0]; const media=m[type]; if(!media) return null
  const stream=await downloadContentFromMessage(media, type.replace('Message',''))
  let buf=Buffer.from([]); for await(const c of stream) buf=Buffer.concat([buf,c]); return buf.length?buf:null
 }catch{ return null }
}
async function getMediaBuffer(m){
 const q=m.message?.extendedTextMessage?.contextInfo?.quotedMessage
 if(q){ let b=await getBuf(q); if(b) return b }
 return await getBuf(m.message)
}
function toWebp(input, isVideo=false){
 return new Promise((res,rej)=>{
  const tmpIn='/data/data/com.termux/files/usr/tmp/m2_'+Date.now()+(isVideo?'.mp4':'.jpg')
  const tmpOut='/data/data/com.termux/files/usr/tmp/m2_'+Date.now()+'.webp'
  fs.writeFileSync(tmpIn, input)
  const filter = isVideo? 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000' : 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=transparent'
  exec(`ffmpeg -y -i "${tmpIn}" -vf "${filter}" -vcodec libwebp -lossless 0 -qscale 75 -preset default -loop 0 -an -vsync 0 "${tmpOut}" -loglevel quiet`, ()=>{
   try{ const out=fs.readFileSync(tmpOut); fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); res(out) }catch(e){ try{fs.unlinkSync(tmpIn)}catch{}; rej(e) }
  })
 })
}
module.exports = {
  async handle(sock, m, from){
    let prog = await sendProgress(sock, from, m, '⏳ Recebendo sua midia...', 'PROCESSANDO')
    const buf = await getMediaBuffer(m)
    if(!buf){ await editProgress(sock, from, prog, errs.noMedia, 'M2'); return }
    await editProgress(sock, from, prog, '📥 Baixando midia...', 'DOWNLOAD')
    const isVideo = m.message?.videoMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage
    await editProgress(sock, from, prog, '⚙️ Processando arquivo...\n│\n│ 🕷️ Aguarde...', 'PROCESSANDO')
    try{
      await editProgress(sock, from, prog, '🔄 Convertendo midia...', 'CONVERSAO')
      const webp = await toWebp(buf,!!isVideo)
      await editProgress(sock, from, prog, '📤 Enviando resultado...', 'ENVIO')
      await sock.sendMessage(from, { sticker: webp }, { quoted: m })
      await finalize(sock, from, prog)
    }catch(e){
      await editProgress(sock, from, prog, errs.error, 'ERRO')
    }
  },
  getMediaBuffer
}
