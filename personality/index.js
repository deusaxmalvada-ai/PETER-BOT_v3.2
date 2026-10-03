'use strict'

const peter = require('./peter')
const aranha = require('./aranha')

let mode = 'peter'

function setMode(newMode) {
  if (newMode === 'aranha') mode = 'aranha'
  else mode = 'peter'
}

function getMode() {
  return mode
}

function format(text) {
  if (mode === 'aranha') {
    aranha.enabled = true
    return aranha.format(text)
  }

  return peter.format(text)
}

module.exports = {
  peter,
  aranha,
  setMode,
  getMode,
  format
}
