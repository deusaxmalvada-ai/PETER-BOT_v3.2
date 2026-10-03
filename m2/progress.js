const { painel } = require('./errors')
let lastKey = {}
async function sendProgress(sock, from, m, text, title='PROCESSANDO'){
  const txt = `╭━━〔 🕷️ M2 • ${title} 〕━━╮\n│\n│ ${text}\n│\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
  try{
    const sent = await sock.sendMessage(from, { text: txt }, { quoted: m })
    lastKey[from] = sent.key
    return sent.key
  }catch(e){ return null }
}
async function editProgress(sock, from, key, text, title='PROCESSANDO'){
  const txt = `╭━━〔 🕷️ M2 • ${title} 〕━━╮\n│\n│ ${text}\n│\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
  try{
    if(key) await sock.sendMessage(from, { text: txt, edit: key })
    else await sock.sendMessage(from, { text: txt })
  }catch{}
}
async function finalize(sock, from, key){
  try{ await editProgress(sock, from, key, '✅ Processo concluido!\n│\n│ 📁 Arquivo pronto.\n│\n│ 🕷️ PETER-BOT', 'FINALIZADO') }catch{}
}
module.exports = { sendProgress, editProgress, finalize }
