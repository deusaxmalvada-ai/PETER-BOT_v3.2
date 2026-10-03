'use strict'

module.exports = {
  name: 'MODO ARANHA',
  enabled: false,

  format(text) {
    if (!this.enabled) return text

    return `🕷️ ${text}`
  }
}
