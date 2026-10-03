'use strict'
const ui = require('./ui')
async function group(c) { if (c.isGroup) return true; await c.reply(ui.warn(c.modo, 'Só funciona em grupo.')); return false }
async function admin(c) {
  if (!(await group(c))) return false
  if (c.isAdmin || c.isOwner) return true
  await c.reply(ui.denied(c.modo, 'ADMINISTRADOR')); return false
}
async function owner(c) { if (c.isOwner) return true; await c.reply(ui.denied(c.modo, 'PROPRIETÁRIO')); return false }
async function botAdmin(c) {
  if (c.isBotAdmin) return true
  await c.reply(ui.err(c.modo, 'O bot precisa ser administrador do grupo.')); return false
}
module.exports = { group, admin, owner, botAdmin }
