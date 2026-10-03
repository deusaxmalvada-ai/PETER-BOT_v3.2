const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const fs = require('fs')
const { execSync } = require('child_process')

function getModo(){
 try{ return JSON.parse(fs.readFileSync('modo.json')).modo }catch{ return 'peter' }
}
function setModo(m){
 fs.writeFileSync('modo.json', JSON.stringify({modo: m}))
}

module.exports = async (sock, m, args, cmd, pushName, from) => {
const reply = (t) => sock.sendMessage(from, {text: t}, {quoted: m})
const isGroup = from.endsWith('@g.us')
const modo = getModo()

// COMANDOS DE TROCA - SÓ ADM SABE, NÃO EXPLICA NADA NO GRUPO
if(cmd === '.peter'){
 setModo('peter')
 try{
   let img = fs.readFileSync('./peter.jpg')
   await sock.updateProfilePicture(sock.user.id, img)
 }catch{}
 return
}

if(cmd === '.aranha'){
 setModo('aranha')
 try{
   let img = fs.readFileSync('./aranha.jpg')
   await sock.updateProfilePicture(sock.user.id, img)
 }catch{}
 return
}

// MENU
if(cmd === '.menu'){
 return reply(`🕷️ PETER-BOT - ${modo.toUpperCase()} 🕷️\n\n.s\n.toimg\n.hidetag\n.linkgp\n.ban @\n.peter\n.aranha`)
}

// FIGURINHA
if(cmd === '.s'){
 try{
   let q = m.message.extendedTextMessage?.contextInfo?.quotedMessage
   let target = q ? {message: q} : m
   let buffer = await downloadMediaMessage(target, 'buffer', {}, {reuploadRequest: sock.updateMediaMessage})
   fs.writeFileSync('tmp.jpg', buffer)
   execSync('ffmpeg -y -i tmp.jpg -vcodec libwebp -vf scale=512:512 tmp.webp')
   let sticker = fs.readFileSync('tmp.webp')
   await sock.sendMessage(from, {sticker}, {quoted: m})
   fs.unlinkSync('tmp.jpg'); fs.unlinkSync('tmp.webp')
 }catch(e){ reply('marca uma foto') }
 return
}

if(cmd === '.hidetag' && isGroup){
 let metadata = await sock.groupMetadata(from)
 let members = metadata.participants.map(a=>a.id)
 let text = args.join(' ') || (modo==='aranha' ? 'Levanta bunda mole, geral marcado 🕸️' : 'Ola amigos, marquei todos 🕷️')
 await sock.sendMessage(from, {text: text, mentions: members}, {quoted: m})
 return
}

if(cmd === '.linkgp' && isGroup){
 let code = await sock.groupInviteCode(from)
 return reply('https://chat.whatsapp.com/'+code)
}

// RESPOSTA AUTOMATICA POR PERSONALIDADE
// Se alguem falar algo e não for comando
if(!cmd.startsWith('.')){
 let texto = m.message.conversation || m.message.extendedTextMessage?.text || ''
 if(texto.length < 2) return

 if(modo === 'aranha'){
   // ARANHA TOXICO - XINGA, MALTRATA
   let respostas = [
     "Cala boca seu lixo, ngm te perguntou",
     "Tu é burro pra krlh, some daqui",
     "Fica quieto verme, ta fedendo o grupo",
     "Vai se fuder seu merda",
     "Tu nao cansa de ser inutil nao?",
     "Para de falar merda caralho"
   ]
   let r = respostas[Math.floor(Math.random()*respostas.length)]
   if(texto.toLowerCase().includes('bot') || Math.random() > 0.7){
     await sock.sendMessage(from, {text: r}, {quoted: m})
   }
 } else {
   // PETER BONDOSO
   let respostas = [
     "Olá amigo! Como posso ajudar? 😊",
     "Com grandes poderes vêm grandes responsabilidades!",
     "Tamo junto! Precisa de alguma coisa?",
     "Que bom te ver por aqui! 🕷️",
     "Conta comigo, vizinho!"
   ]
   let r = respostas[Math.floor(Math.random()*respostas.length)]
   if(texto.toLowerCase().includes('bot') || texto.toLowerCase().includes('peter')){
     await sock.sendMessage(from, {text: r}, {quoted: m})
   }
 }
}

}
