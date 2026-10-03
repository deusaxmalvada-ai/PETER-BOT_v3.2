'use strict'
// Limpa os painéis do M2: remove a caixa dupla, o título repetido ("M2 • M2")
// e reaplica o estilo do PETER-BOT. Só mexe em textos que parecem painéis do M2.
const ui = require('./ui')

const acc = s => s
  .replace(/\bmidia\b/g, 'mídia').replace(/\bMidia\b/g, 'Mídia')
  .replace(/\bNao\b/g, 'Não').replace(/\bnao\b/g, 'não')
  .replace(/\bpossivel\b/g, 'possível').replace(/\bvideo\b/g, 'vídeo')

function clean(text, modo) {
  if (typeof text !== 'string' || !text.includes('M2') || !text.includes('〔')) return text
  const lines = text.split('\n')
  let h = -1
  for (let i = 0; i < lines.length; i++) if (/^[│\s]*╭.*〔.*〕.*╮\s*$/.test(lines[i])) h = i
  if (h < 0) return text
  const m = /〔\s*(.+?)\s*〕/.exec(lines[h])
  const parts = m[1].split('•').map(s => s.trim())
  let name = parts.length > 1 ? parts[parts.length - 1] : parts[0]
  if (!name || /^(.*\s)?M2$/.test(name)) name = 'MÍDIA'
  const body = []
  for (let i = h + 1; i < lines.length; i++) {
    if (/^[│\s]*╰.*╯\s*$/.test(lines[i])) break
    body.push(lines[i].replace(/^[│\s]?│?\s?/, '').replace(/\s+$/, ''))
  }
  const up = name.toUpperCase()
  const emoji = up === 'ERRO' ? '❌' : up === 'AVISO' ? '⚠️' : /PROCESS|AGUARD/.test(up) ? '⏳' : '🎨'
  return ui.panel(modo, emoji, name, body.map(acc))
}
module.exports = { clean }
