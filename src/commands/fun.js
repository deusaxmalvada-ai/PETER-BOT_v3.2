'use strict'
const ui = require('../ui')
const rnd = n => Math.floor(Math.random() * n)

async function run(c) {
  const { cmd, modo = c.modo } = c
  if (cmd === 'coin') {
    const cara = Math.random() < 0.5
    await c.reply(ui.panel(c.modo, '🪙', 'COIN', [`${c.tag(c.sender)} → ${cara ? '🟢 CARA' : '🔴 COROA'}`]), [c.sender])
    return true
  }
  if (cmd === 'dado') {
    await c.reply(ui.panel(c.modo, '🎲', 'DADO', [`Saiu ${rnd(6) + 1}`]))
    return true
  }
  if (cmd === 'ship') {
    let a = c.mentioned[0], b = c.mentioned[1]
    if (a && !b) { b = a; a = c.sender }
    if (!a || !b) { await c.reply(ui.warn(c.modo, 'Uso: .ship @pessoa1 @pessoa2')); return true }
    const p = rnd(101)
    const msg = p < 30 ? 'Hmm... difícil.' : p < 60 ? 'Interessante...' : p < 85 ? 'Tem potencial.' : 'Combinam bem!'
    await c.reply(ui.panel(c.modo, '❤️', 'SHIP', [`${c.tag(a)} ❤️ ${c.tag(b)}`, `💘 ${p}% · ${msg}`, '🎲 aleatório, só diversão']), [a, b])
    return true
  }
  return false
}
module.exports = { run }
