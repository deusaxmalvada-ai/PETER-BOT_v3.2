function painel(t, m){
 return `╭━━〔 🕷️ M2 • ${t} 〕━━╮
│
│ ${m}
│
╰━━━━━━━━━━━━━━━━━━━━━━╯`
}
module.exports = {
  noMedia: painel('M2', '⚠️ Nenhuma midia encontrada.\n│\n│ 📌 Envie ou responda a uma\n│ imagem, video ou sticker.'),
  invalid: painel('AVISO', '⚠️ Formato nao suportado.\n│\n│ 📁 Envie uma midia compativel.'),
  error: painel('ERRO', '❌ Nao foi possivel processar\n│ a midia.\n│\n│ 💡 Tente novamente.'),
  timeout: painel('TIMEOUT', '⏱️ O processamento demorou\n│ demasiado.\n│\n│ 🔄 Tente novamente.'),
  noPerm: painel('ACESSO', '🔒 Voce nao possui permissao\n│ para utilizar esta funcao.'),
  painel
}
