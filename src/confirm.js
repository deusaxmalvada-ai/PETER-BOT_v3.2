'use strict'
const ui = require('./ui')
const cfg = require('./config')
const pending = new Map()
const key = c => c.from + ':' + c.senderNum

// pede confirmação; fn() corre se o mesmo usuário enviar .confirmar em 30s
async function ask(c, { action, target }, fn) {
  pending.set(key(c), { fn, exp: Date.now() + cfg.CONFIRM_MS })
  const mentions = target ? [target] : []
  const lines = [`⚡ ${ui.sc(action)} ${ui.T().arrow} ${target ? c.tag(target) : ''}`.trim(), `⏳ ${ui.sc('responde')} .confirmar ${ui.sc('em ' + cfg.CONFIRM_MS / 1000 + 's')}`]
  await c.reply(ui.panel(c.modo, '⚠️', 'CONFIRMAÇÃO', lines), mentions)
}
async function run(c) {
  const p = pending.get(key(c))
  if (!p) return c.reply(ui.warn(c.modo, 'Nada para confirmar.'))
  pending.delete(key(c))
  if (Date.now() > p.exp) return c.reply(ui.warn(c.modo, 'A confirmação expirou.'))
  return p.fn()
}
module.exports = { ask, run }
