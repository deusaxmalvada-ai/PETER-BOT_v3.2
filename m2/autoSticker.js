const config = require('./config')
const fs = require('fs')
const path = './m2/config.js'
function save(){ fs.writeFileSync(path, `module.exports = ${JSON.stringify(config, null, 2)}`) }
module.exports = {
 getConfig: (gid) => config.autoSticker.groups[gid] || { on:false, imagens:true, videos:false },
 async handle(sock, m, from, args){
  const sub = (args[0]||'').toLowerCase()
  const gid = from
  if(sub==='on' || sub==='ativar'){
    config.autoSticker.groups[gid] = { on:true, imagens:true, videos:true }
    save()
    await sock.sendMessage(from, { text: '╭━━〔 🕷️ M2 • AUTO-STICKER 〕━━╮\n│\n│ 🤖 STATUS: ON\n│ 🟢 Ativado neste grupo\n│\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯' }, { quoted: m })
  } else if(sub==='off' || sub==='desativar'){
    config.autoSticker.groups[gid] = { on:false }
    save()
    await sock.sendMessage(from, { text: '╭━━〔 🕷️ M2 • AUTO-STICKER 〕━━╮\n│\n│ 🤖 STATUS: OFF\n│ 🔴 Desativado\n│\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯' }, { quoted: m })
  } else {
    const cur = config.autoSticker.groups[gid]?.on? 'ON' : 'OFF'
    await sock.sendMessage(from, { text: `╭━━〔 🕷️ M2 • AUTO-STICKER 〕━━╮
│
│ 🤖 STATUS: ${cur}
│
│ 🖼️ IMAGENS
│ 🎥 VIDEOS
│ 🎞️ GIFS
│
│ 🟢.autosticker on
│ 🔴.autosticker off
│ ⚙️.autosticker config
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯` }, { quoted: m })
  }
 },
 async checkAndRun(sock, m, from){
  const cfg = config.autoSticker.groups[from]
  if(!cfg?.on) return false
  const hasImage =!!m.message?.imageMessage
  const hasVideo =!!m.message?.videoMessage
  if((hasImage && cfg.imagens!==false) || (hasVideo && cfg.videos!==false)){
    const stickerMod = require('./sticker')
    await stickerMod.handle(sock, m, from)
    return true
  }
  return false
 }
}
