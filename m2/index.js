const menu = require('./menu')
const sticker = require('./sticker')
const converter = require('./converter')
const media = require('./media')
const meme = require('./meme')
const react = require('./react')
const quote = require('./quote')
const autoSticker = require('./autoSticker')

module.exports = {
 menu, sticker, converter, media, meme, react, quote, autoSticker,
 async handleCommand(sock, m, from, cmd, args){
  // cmd ja vem sem ponto
  switch(cmd){
    case 'm2': await menu.show(sock, m, from, args[0]); return true
    case 's': case 'sticker': case 'st': case 'fig': await sticker.handle(sock, m, from); return true
    case 'toimg': case 'ti': await converter.toImg(sock, m, from); return true
    case 'stickerinfo': case 'stickerid': case 'stickerpack': await converter.info(sock, m, from); return true
    case 'meme': await meme.handle(sock, m, from, args); return true
    case 'react': await react.handle(sock, m, from, args); return true
    case 'quote': await quote.handle(sock, m, from); return true
    case 'autosticker': await autoSticker.handle(sock, m, from, args); return true
    case 'save': await sock.sendMessage(from, { text: '╭━━〔 🕷️ M2 • SAVE 〕━━╮\n│\n│ 💾 Funcao SAVE em desenvolvimento\n│ Use.toimg por enquanto\n│\n╰━━━━━━━━━━━━━━━━━━━━━━╯' }, { quoted: m }); return true
    case 'repost': await sock.sendMessage(from, { text: '╭━━〔 🕷️ M2 • REPOST 〕━━╮\n│\n│ 🔁 Responda midia com.repost\n│\n╰━━━━━━━━━━━━━━━━━━━━━━╯' }, { quoted: m }); return true
    default: return false
  }
 }
}
