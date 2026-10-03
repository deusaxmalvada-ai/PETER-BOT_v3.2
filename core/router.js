'use strict'

const main = require('../panels/main')
const panels = require('../panels')

async function route(sock, m, from, cmd, args) {

  if (cmd !== 'menu' && cmd !== 'help' && cmd !== 'comandos') {
    return false
  }

  // .menu
  if (!args.length) {
    await main.show(sock, m, from)
    return true
  }

  const panelId = String(args[0])
  const subId = args[1] ? String(args[1]) : null

  // .menu 4 1
  if (subId) {
    if (await panels.show(sock, m, from, panelId, subId)) {
      return true
    }

    await panels.show(sock, m, from, panelId)
    return true
  }

  // .menu 4
  if (await panels.show(sock, m, from, panelId)) {
    return true
  }

  // Número inexistente → volta ao principal
  await main.show(sock, m, from)
  return true
}

module.exports = route
