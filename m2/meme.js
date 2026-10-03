const { painel } = require('./errors')
module.exports = {
 async handle(sock, m, from, args){
  const text = args.join(' ')
  const [top, bottom] = text.includes('|')? text.split('|') : [text, 'PETER BOT']
  const out = `╭━━〔 🕷️ M2 • MEMES 〕━━╮
│
│ 😂 CRIAR MEME
│ 📝 Top: ${top||'Quando o codigo'}
│ 📝 Bottom: ${bottom||'funciona de primeira'}
│
│ 💡 Use:.meme texto de cima | texto de baixo
│ 📸 Pode responder imagem com.meme
│
╰━━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(from, { text: out }, { quoted: m })
 }
}
