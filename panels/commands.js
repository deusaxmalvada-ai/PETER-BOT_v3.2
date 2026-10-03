'use strict'

const COMMANDS = {

  '4': {
    '1': { name: 'BAN', command: '.ban', status: 'EM CONSTRUÇÃO' },
    '2': { name: 'UNBAN', command: '.unban', status: 'EM CONSTRUÇÃO' },
    '3': { name: 'WARN', command: '.warn', status: 'EM CONSTRUÇÃO' },
    '4': { name: 'DELWARN', command: '.delwarn', status: 'EM CONSTRUÇÃO' },
    '5': { name: 'TAGALL', command: '.tagall', status: 'ATIVO' },
    '6': { name: 'HIDETAG', command: '.hidetag', status: 'EM CONSTRUÇÃO' },
    '7': { name: 'REGRAS', command: '.regras', status: 'ATIVO' }
  },

  '5': {
    '1': { name: 'M2', command: '.m2', status: 'ATIVO' },
    '2': { name: 'STICKER', command: '.sticker', status: 'ATIVO' },
    '3': { name: 'CONVERSOR', command: '.toimg', status: 'ATIVO' },
    '4': { name: 'VÍDEO', command: '.video', status: 'EM CONSTRUÇÃO' },
    '5': { name: 'MEME', command: '.meme', status: 'ATIVO' }
  },

  '6': {
    '1': { name: 'DADO', command: '.dado', status: 'ATIVO' },
    '2': { name: 'PEDRA / PAPEL / TESOURA', command: '.ppt', status: 'EM CONSTRUÇÃO' },
    '3': { name: 'REAÇÃO', command: '.react', status: 'ATIVO' },
    '4': { name: 'QUOTE', command: '.quote', status: 'ATIVO' }
  },

  '7': {
    '1': { name: 'PING', command: '.ping', status: 'ATIVO' },
    '2': { name: 'REINÍCIO', command: '.restart', status: 'EM CONSTRUÇÃO' },
    '3': { name: 'STATUS', command: '.status', status: 'EM CONSTRUÇÃO' },
    '4': { name: 'CONFIGURAÇÃO', command: '.config', status: 'EM CONSTRUÇÃO' }
  }
}

function get(panelId, subId) {
  return COMMANDS[String(panelId)]?.[String(subId)] || null
}

module.exports = {
  COMMANDS,
  get
}
