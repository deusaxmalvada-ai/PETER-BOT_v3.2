'use strict'
const fs = require('fs')
const path = require('path')
const ui = require('./ui')
const C = require('./ctx')
const db = require('./db')
const ROOT = path.join(__dirname, '..')

const pj = p => (typeof p === 'string' ? p : (p && (p.id || p.phoneNumber)))
const isBot = (sock, jid) => C.num(sock.user?.id) === C.num(jid) || C.num(sock.user?.lid) === C.num(jid)

async function groupName(sock, id) { try { return (await C.getMeta(sock, id)).subject } catch { return 'o grupo' } }

async function sendWelcome(sock, groupId, participant) {
  const jid = pj(participant); if (!jid || isBot(sock, jid)) return
  if (!db.group(groupId).welcome) return
  const modo = db.getModo(), tag = '@' + C.num(jid), name = await groupName(sock, groupId)
  const body = modo === 'aranha' ? [
    `💌 ${ui.sc('carta de entrada')}`,
    '🌑 Mais um atravessou a porta...',
    `Bem-vindo(a), ${tag}.`,
    'Observo em silêncio:',
    '🩸 respeita o grupo',
    '🩸 segue as regras',
    '🩸 não me desafies',
    'Não repito avisos.',
    'Fica. Ou parte. A escolha é tua.'
  ] : [
    `💌 ${ui.sc('carta de bem-vinda')}`,
    `🌀 Bem-vindo(a), ${tag}!`,
    `Você entrou em ${name},`,
    'onde amizades de verdade nascem.',
    '📜 Leia as regras',
    '🤝 Respeite os membros',
    '💥 Aproveite a estadia',
    '“Quem protege os outros',
    'ganha força de verdade.”'
  ]
  const text = ui.home(modo, body) + '\n' + ui.CRIADOR
  const buf = require('./img').read(require('./img').forMain(modo))
  if (buf) {
    try { return await sock.sendMessage(groupId, { image: buf, caption: text, mentions: [jid] }) } catch {}
  }
  return sock.sendMessage(groupId, { text, mentions: [jid] })
}

async function sendBye(sock, groupId, participant) {
  const jid = pj(participant); if (!jid || isBot(sock, jid)) return
  if (!db.group(groupId).bye) return
  const modo = db.getModo(), tag = '@' + C.num(jid)
  const lines = modo === 'aranha' ? [`👤 ${tag} partiu · 🌑 o silêncio ficou.`] : [`👤 ${tag} saiu · 🌀 até a próxima!`]
  return sock.sendMessage(groupId, { text: ui.panel(modo, '🚪', 'SAÍDA', lines), mentions: [jid] })
}
module.exports = { sendWelcome, sendBye }
