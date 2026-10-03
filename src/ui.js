'use strict'
const { OWNER_NAME, BOT_NAME, PERSONAS } = require('./config')
const db = require('./db')

// ───────── FONTES ─────────
// ᴍɪɴɪ ᴄᴀᴘs (acentos ficam colados: ᴀ́ ᴀ̃ ᴄ̧)
const SC = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' }
const sc = s => String(s).normalize('NFD').toLowerCase().replace(/[a-z]/g, c => SC[c])
// 𝙗𝙤𝙡𝙙 𝙞𝙩𝙖𝙡𝙞𝙘 (títulos)
const mapLetters = (s, up, lo) => [...String(s).normalize('NFD')].map(ch => {
  const c = ch.codePointAt(0)
  if (c >= 65 && c <= 90) return String.fromCodePoint(up + c - 65)
  if (c >= 97 && c <= 122) return String.fromCodePoint(lo + c - 97)
  return ch
}).join('')
const bi = s => mapLetters(s, 0x1D63C, 0x1D656)

// ───────── ESTILOS ─────────
const pad = (n, ch) => ch.repeat(Math.max(3, n))
const THEMES = {
  1: { name: 'Teia',
    top: h => `╭━━━〔 ${h} 〕━━━╮`,
    bottom: (h, d) => { const k = Math.round(([...h].length + 4) / 2); return `╰${pad(k, '━')}〔 ${d} 〕${pad(k, '━')}╯` },
    side: '┃ ', mid: '┣', last: '┗', arrow: '⟶', sec: '✦', hi: '𖤐' },
  2: { name: 'Cristal',
    top: h => `┏━━ ✦ ${h} ✦ ━━┓`,
    bottom: (h, d) => { const k = Math.round(([...h].length + 2) / 2); return `┗${pad(k, '━')} ⟡ ${d} ⟡ ${pad(k, '━')}┛` },
    side: '┃ ', mid: '❖', last: '❖', arrow: '➜', sec: '⟡', hi: '❀' },
  3: { name: 'Duplo',
    top: h => `╔═══〔 ${h} 〕═══╗`,
    bottom: (h, d) => { const k = Math.round(([...h].length + 4) / 2); return `╚${pad(k, '═')}〔 ${d} 〕${pad(k, '═')}╝` },
    side: '║ ', mid: '╠', last: '╚', arrow: '▸', sec: '◈', hi: '⌬' }
}
const T = () => THEMES[db.data.style] || THEMES[1]
const setStyle = n => { if (!THEMES[n]) return false; db.data.style = Number(n); db.save(); return true }

const MODES = {
  peter:  { icon: '🌀', deco: '🌀', title: bi(BOT_NAME), name: PERSONAS.peter },
  aranha: { icon: '🌑', deco: '🩸', title: bi(BOT_NAME), name: PERSONAS.aranha }
}
const M = modo => MODES[modo] || MODES.peter
const CRIADOR = `👑 ${sc('criador')}: ${OWNER_NAME}`

function box(head, lines, deco = '🌀') {
  const t = T()
  const arr = [].concat(lines).join('\n').split('\n').filter(l => l.trim() !== '')
  return `${t.top(head)}\n${arr.map(l => t.side + l).join('\n')}\n${t.bottom(head, deco)}`
}
// seção + lista de itens [emoji, comando, descrição]
const sec = text => `${T().sec} ${sc(text)}`
const list = items => items.map((it, k) => `${k === items.length - 1 ? T().last : T().mid} ${it[0]} ${it[1]} ${T().arrow} ${sc(it[2])}`)

const panel = (modo, emoji, title, lines) => box(`${emoji} ${bi(title)}`, lines, M(modo).deco)
const home  = (modo, lines) => box(`${M(modo).icon} ${M(modo).title}`, lines, M(modo).deco)

const ok = (modo, lines) => modo === 'aranha'
  ? panel(modo, '💢', 'FEITO', lines)
  : panel(modo, '✅', 'CONCLUÍDO', lines)
const err = (modo, motivo) => modo === 'aranha'
  ? panel(modo, '💢', 'NÃO DEU', [motivo])
  : panel(modo, '❌', 'ERRO', [`${M(modo).deco} ${motivo}`])
const warn = (modo, msg) => panel(modo, '⚠️', 'AVISO', [msg])
const denied = (modo, need) => modo === 'aranha'
  ? panel(modo, '🚫', 'NEGADO', [`${sc('precisas de')} ${need}. ${sc('sem permissão')} 🩸`])
  : panel(modo, '🚫', 'ACESSO NEGADO', [`${sc('necessário')}: ${need}`])

module.exports = { sc, bi, M, T, THEMES, setStyle, CRIADOR, box, sec, list, panel, home, ok, err, warn, denied }
