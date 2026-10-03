'use strict'
const { jidNormalizedUser, downloadContentFromMessage } = require('@whiskeysockets/baileys')
const { exec } = require('child_process')
const fs = require('fs')
const BOT_NAME = 'PETER-BOT'
const OWNER_NAME = 'LORD SUKUNA'
const OWNER_NUMBER = '244948179380'
const M2 = require('./m2')
const coreRouter = require('./core/router')
const personality = require('./personality')

function painel(titulo, conteudo){
 return `╭━━━[ ${titulo} ]━━━╮
┃
┃ ${conteudo}
┃
╰━━━[ PETER BOT ]━━━╯`
}

async function getBufferFromMsg(msgObj){
 try{
  let m=msgObj
  for(let i=0;i<6;i++){
   if(!m) break
   if(m.viewOnceMessageV2) m=m.viewOnceMessageV2.message
   else if(m.viewOnceMessage) m=m.viewOnceMessage.message
   else if(m.ephemeralMessage) m=m.ephemeralMessage.message
   else if(m.documentWithCaptionMessage) m=m.documentWithCaptionMessage.message
   else break
  }
  if(!m) return null
  const type=Object.keys(m)[0]
  const media=m[type]
  if(!media) return null
  const stream=await downloadContentFromMessage(media, type.replace('Message',''))
  let buf=Buffer.from([])
  for await(const chunk of stream) buf=Buffer.concat([buf,chunk])
  return buf.length?buf:null
 }catch(e){ return null }
}
async function getMediaBuffer(m){
 const q=m.message?.extendedTextMessage?.contextInfo?.quotedMessage
 if(q){ let b=await getBufferFromMsg(q); if(b) return b }
 return await getBufferFromMsg(m.message)
}
async function imageToWebpSticker(imgBuffer){
 return new Promise((res)=>{
  const tmpIn='/data/data/com.termux/files/usr/tmp/in_'+Date.now()+'.jpg'
  const tmpOut='/data/data/com.termux/files/usr/tmp/out_'+Date.now()+'.webp'
  try{ fs.writeFileSync(tmpIn, imgBuffer) }catch{ res(imgBuffer); return }
  exec(`ffmpeg -y -i "${tmpIn}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=transparent" "${tmpOut}" -loglevel quiet`, ()=>{
   try{ res(fs.readFileSync(tmpOut)) }catch{ res(imgBuffer) }
  })
 })
}

const MENU_COMPLETO = `╭━━━━━━━━〔 🕷️ 𝙋𝙀𝙏𝙀𝙍-𝘽𝙊𝙏 〕━━━━━━━━╮
│
│                 𝙋𝘼𝙄𝙉𝙀𝙇
│
├─ 🏠 1. PRINCIPAL
├─ 👤 2. USUÁRIO
├─ 👥 3. GRUPO
├─ 🛡️ 4. ADMINISTRAÇÃO
├─ 🎨 5. MÍDIA
├─ 🎮 6. DIVERSÃO
├─ ⚙️ 7. SISTEMA
├─ 📊 8. STATUS
├─ 🔐 9. SEGURANÇA
├─ 💾 10. DADOS
├─ 👑 11. OWNER
│
├─ 🕷️ M2
│   └─ .m2
│
╰━━━━━━━━━━〔 🕸️ 〕━━━━━━━━━━╯
🤖 ${BOT_NAME}
👑 ${OWNER_NAME}`

module.exports = async (sock, m, fromParam) => {
 const from = m.key.remoteJid || fromParam || m.key?.remoteJid
 if(!from) return
 const body = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || ''
 const cmdRaw = body.trim().split(' ')[0].toLowerCase()
 const cmd = cmdRaw.replace('.','')
 const args = body.trim().split(' ').slice(1)
 const sender = m.key.participant || m.key.remoteJid
 const isGroup = from.endsWith('@g.us')

 // M2 AUTO-STICKER
 try{ if(await M2.autoSticker.checkAndRun(sock, m, from)) return }catch{}

 // CORE ROUTER - PAINÉIS PRINCIPAIS
try {
  if (await coreRouter(sock, m, from, cmd, args)) return
} catch (e) {
  console.log('CORE ROUTER ERR:', e.message)
}

// M2 ROUTER - se for comando M2, trata e sai
 try{ if(await M2.handleCommand(sock, m, from, cmd, args)) return }catch(e){ console.log('M2 ERR', e.message) }

 // COMANDOS ORIGINAIS - NÃO APAGADOS
 if(cmd === 'menu' || cmd === 'help' || cmd === 'comandos'){
   await sock.sendMessage(from, { text: MENU_COMPLETO }, { quoted: m })
   return
 }
 if(cmd === 'ping'){
   await sock.sendMessage(from, { text: painel('PING', '✅ Pong! Bot online\n🕷️ PETER-BOT') }, { quoted: m })
   return
 }
 if(cmd === 'regras' || cmd === 'rules'){
   await sock.sendMessage(from, { text: painel('REGRAS', '1 Respeite os membros\n2 Sem spam\n3 Sem conteudo proibido\n4 Respeite adm') }, { quoted: m })
   return
 }
 if(cmd === 'tagall' || cmd === 'todos'){
   if(!isGroup){ await sock.sendMessage(from, { text: 'So em grupo' }, { quoted: m }); return }
   try{
     const meta = await sock.groupMetadata(from)
     const participants = meta.participants.map(p=>p.id)
     const txt = args.join(' ') || 'Marcando todos'
     await sock.sendMessage(from, { text: `📢 ${txt}\n\n${participants.map(p=>`@${p.split('@')[0]}`).join(' ')}`, mentions: participants }, { quoted: m })
   }catch(e){ await sock.sendMessage(from, { text: 'Erro tagall' }, { quoted: m }) }
   return
 }
 if(cmd === 'dado'){
   const n = Math.floor(Math.random()*6)+1
   await sock.sendMessage(from, { text: painel('DADO', `🎲 Saiu: ${n}`) }, { quoted: m })
   return
 }
 // FALLBACK - se nao for nenhum comando conhecido, nao faz nada (nao apaga outros modulos)
}
