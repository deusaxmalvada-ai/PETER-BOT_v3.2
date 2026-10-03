'use strict'

function panel(title, content, footer = '🕷️ PETER-BOT') {
  return `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃        ${title}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
${content}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ${footer}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
}

function request(user, command, media = 'Nenhuma') {
  return panel(
    '📥 𝙋𝙀𝘿𝙄𝘿𝙊 𝙍𝙀𝘾𝙀𝘽𝙄𝘿𝙊',
`┃
┃ 👤 Usuário: ${user}
┃ 🎯 Pedido: ${command}
┃ 📎 Mídia: ${media}
┃
┃ ⏳ Preparando...`
  )
}

function processing(command, step = 'Processando') {
  return panel(
    '⚙️ 𝙋𝙍𝙊𝘾𝙀𝙎𝙎𝘼𝙉𝘿𝙊',
`┃
┃ 📋 Pedido: ${command}
┃
┃ 📥 Entrada       ✅
┃ ⚙️ ${step}       ⏳
┃ 📤 Resultado     ⏳`
  )
}

function success(command) {
  return panel(
    '✅ 𝙋𝙀𝘿𝙄𝘿𝙊 𝙁𝙄𝙉𝘼𝙇𝙄𝙕𝘼𝘿𝙊',
`┃
┃ 🎯 Pedido: ${command}
┃
┃ 📤 Resultado enviado.
┃
┃ 🟢 Operação concluída.`
  )
}

function error(message = 'Não foi possível executar este pedido.') {
  return panel(
    '⚠️ 𝙋𝙀𝘿𝙄𝘿𝙊 𝙄𝙉𝙑Á𝙇𝙄𝘿𝙊',
`┃
┃ ❌ ${message}
┃
┃ 💡 Verifique o formato
┃ e tente novamente.`
  )
}

function denied() {
  return panel(
    '🔐 𝘼𝘾𝙀𝙎𝙎𝙊 𝙉𝙀𝙂𝘼𝘿𝙊',
`┃
┃ ❌ Você não possui
┃ permissão para executar
┃ este comando.`
  )
}

function validating(command) {
  return panel(
    '🔎 𝙑𝘼𝙇𝙄𝘿𝘼𝙉𝘿𝙊',
`┃
┃ 🎯 Pedido: ${command}
┃
┃ 🔍 Verificando entrada...
┃ 🔐 Verificando permissões...
┃ 📎 Verificando mídia...`
  )
}

function confirmed(command) {
  return panel(
    '✅ 𝙑𝘼𝙇𝙄𝘿𝘼ÇÃ𝙊 𝘾𝙊𝙉𝘾𝙇𝙐Í𝘿𝘼',
`┃
┃ 🎯 Pedido: ${command}
┃
┃ 🟢 Entrada válida
┃ 🟢 Permissão válida
┃ 🟢 Dados válidos`
  )
}

module.exports = {
  panel,
  request,
  validating,
  confirmed,
  processing,
  success,
  error,
  denied
}
