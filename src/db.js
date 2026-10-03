'use strict'
const fs = require('fs')
const path = require('path')
const DIR = path.join(__dirname, '..', 'data')
const FILE = path.join(DIR, 'db.json')
const MODO_FILE = path.join(__dirname, '..', 'modo.json')

const data = { groups: {}, irrit: {} }
try {
  fs.mkdirSync(DIR, { recursive: true })
  Object.assign(data, JSON.parse(fs.readFileSync(FILE, 'utf8')))
} catch {}

let timer = null
function flush() {
  clearTimeout(timer)
  try { fs.writeFileSync(FILE + '.tmp', JSON.stringify(data)); fs.renameSync(FILE + '.tmp', FILE) }
  catch (e) { console.log('DB:', e.message) }
}
function save() { clearTimeout(timer); timer = setTimeout(flush, 300) }

const DEFAULT_RULES = [
  '🤝 Respeite os membros.',
  '🚫 Evite spam.',
  '🔞 Conteúdo proibido não.',
  '🛡️ Respeite a administração.',
  '🌀 Divirta-se sem arrumar confusão.'
]
function group(id) {
  if (!data.groups[id]) data.groups[id] = { welcome: true, bye: true, rules: DEFAULT_RULES.slice(), warns: {}, muted: {} }
  return data.groups[id]
}

function getModo() {
  try {
    const v = JSON.parse(fs.readFileSync(MODO_FILE, 'utf8')).modo
    return String(v).toLowerCase() === 'aranha' ? 'aranha' : 'peter'
  } catch { return 'peter' }
}
function setModo(m) {
  const v = m === 'aranha' ? 'aranha' : 'peter'
  fs.writeFileSync(MODO_FILE, JSON.stringify({ modo: v === 'aranha' ? 'Aranha' : 'Peter' }))
  try {
    const p = require('../personality')
    for (const fn of ['setMode', 'setModo', 'set']) if (typeof p[fn] === 'function') { p[fn](v); break }
  } catch {}
}

module.exports = { data, group, save, flush, getModo, setModo }
