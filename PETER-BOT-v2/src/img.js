'use strict'
// Procura imagens em ~/PETER-BOT/img (ou na raiz), sem ligar a maiúsculas/minúsculas nem à extensão.
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')
const DIRS = [path.join(ROOT, 'img'), ROOT]
const cache = new Map()

function find(names) {
  for (const dir of DIRS) {
    let files
    try { files = fs.readdirSync(dir) } catch { continue }
    for (const n of names.filter(Boolean)) {
      const f = files.find(x => /\.(jpe?g|png)$/i.test(x) && x.replace(/\.(jpe?g|png)$/i, '').toLowerCase() === n.toLowerCase())
      if (f) return path.join(dir, f)
    }
  }
  return null
}
function read(names) {
  const p = find(names)
  if (!p) return null
  try {
    const m = fs.statSync(p).mtimeMs, c = cache.get(p)
    if (c && c.m === m) return c.buf
    const buf = fs.readFileSync(p); cache.set(p, { m, buf }); return buf
  } catch { return null }
}
// nomes de imagem por persona / menu
const PERSONA = { peter: ['yuji', 'yujujj', 'yujijj', 'peter'], aranha: ['yujim', 'yujimodulo', 'modulo', 'aranha'] }
const forMain = modo => [...(PERSONA[modo] || PERSONA.peter), 'menu']
const forMenu = (n, modo) => [`menu${n}`, n === '1' || n === 1 ? 'mneu1' : null, 'menu', ...(PERSONA[modo] || PERSONA.peter)]
const forOwner = modo => ['ownermenu', 'dono.om', 'dono', 'om', ...forMain(modo)]
module.exports = { find, read, forMain, forMenu, forOwner }
