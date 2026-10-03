const menuPrincipal = `╭━━━━━━━━━━━━━━━━━━━━━━━━╮
│ 🕷️ PETER-BOT │
│ 「 M2 」 │
├━━━━━━━━━━━━━━━━━━━━━━━━┤
│ │
│ 🎨 1. STICKER (.m2 1)
│ 🎬 2. MIDIA (.m2 2)
│ 😂 3. MEMES (.m2 3)
│ ❤️ 4. REACOES (.m2 4)
│ 💬 5. QUOTE (.m2 5)
│ 🤖 6. AUTO-STICKER (.m2 6)
│ 📖 7. COMANDOS (.m2 7)
│ ⚙️ 8. CONFIG (.m2 8)
│ │
│ ↩️ VOLTAR (.menu)
╰━━━━━━━━━━━━━━━━━━━━━━━━╯`

const submenus = {
 '1': `╭━━━〔 🕷️ M2 • STICKER 〕━━━╮
│
│ 🖼️ 1. IMAGEM (.s)
│ 🎥 2. VIDEO (.s + video)
│ 🎞️ 3. GIF (.s + gif)
│ 🔄 4. CONVERSAO (.toimg)
│ 🔎 5. INFORMACOES (.stickerinfo)
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━━╯`,
 '2': `╭━━━〔 🕷️ M2 • MIDIA 〕━━━╮
│
│ 📥 1. DOWNLOAD
│ 🔄 2. CONVERSOR (.toimg)
│ 💾 3. SAVE (.save)
│ 🔁 4. REPOST (.repost)
│ 📁 5. ARQUIVO (.stickerinfo)
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━╯`,
 '3': `╭━━━〔 🕷️ M2 • MEMES 〕━━━╮
│
│ 😂 1. CRIAR MEME (.meme)
│ 📝 2. TEXTO SUPERIOR
│ 📝 3. TEXTO INFERIOR
│ ✏️ 4. TEXTO PERSONALIZADO
│ 📸 5. USAR MIDIA (responda img)
│ 🎲 6. ALEATORIO
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━╯`,
 '4': `╭━━━〔 🕷️ M2 • REACOES 〕━━━╮
│
│ ❤️ Love (.react ❤️)
│ 😂 Laugh (.react 😂)
│ 😭 Cry (.react 😭)
│ 😡 Angry (.react 😡)
│ 🔥 Fire (.react 🔥)
│ 💀 Dead (.react 💀)
│ 👑 Crown (.react 👑)
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━━╯`,
 '5': `╭━━━〔 🕷️ M2 • QUOTE 〕━━━╮
│
│ 💬 1. QUOTE (.quote)
│ 🖼️ 2. QUOTE COM IMAGEM
│ 👤 3. MOSTRAR AUTOR
│ 🎨 4. PERSONALIZAR
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━╯`,
 '6': `╭━━〔 🕷️ M2 • AUTO-STICKER 〕━━╮
│
│ 🤖 STATUS: veja.autosticker
│
│ 🖼️ IMAGENS
│ 🎥 VIDEOS
│ 🎞️ GIFS
│
│ 🟢 ATIVAR (.autosticker on)
│ 🔴 DESATIVAR (.autosticker off)
│ ⚙️ CONFIGURAR (.autosticker)
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
 '7': `╭━━〔 🕷️ M2 • COMANDOS 〕━━╮
│
│.s /.sticker
│.toimg
│.stickerinfo /.stickerid
│.save /.repost
│.meme texto | texto
│.react emoji
│.quote
│.autosticker on/off
│.m2 (este menu)
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━━╯`,
 '8': `╭━━〔 🕷️ M2 • CONFIG 〕━━╮
│
│ 🔐 1. PERMISSOES
│ 🤖 2. AUTO-STICKER
│ 📦 3. LIMITES (15s / 16MB)
│ 📝 4. MENSAGENS (paineis)
│ 🎨 5. APARENCIA
│ 🔄 6. RESETAR M2 (.m2 reset)
│
│ ↩️ VOLTAR (.m2)
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
}
module.exports = {
 async show(sock, m, from, arg){
  if(!arg) { await sock.sendMessage(from, { text: menuPrincipal }, { quoted: m }); return }
  if(arg==='reset'){
    await sock.sendMessage(from, { text: '╭━━〔 🕷️ M2 • RESET 〕━━╮\n│\n│ ✅ Configuracoes M2 resetadas\n│\n╰━━━━━━━━━━━━━━━━━━━━━━╯' }, { quoted: m })
    return
  }
  const txt = submenus[arg] || menuPrincipal
  await sock.sendMessage(from, { text: txt }, { quoted: m })
 }
}
