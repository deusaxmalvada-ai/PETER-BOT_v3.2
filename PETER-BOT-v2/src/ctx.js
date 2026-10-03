'use strict'
const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const cfg = require('./config')

const num = j => String(j || '').split('@')[0].split(':')[0]

function unwrap(msg) {
  let m = msg
  for (let i = 0; i < 6 && m; i++) {
    if (m.ephemeralMessage) m = m.ephemeralMessage.message
    else if (m.viewOnceMessage) m = m.viewOnceMessage.message
    else if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message
    else if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message
    else break
  }
  return m || {}
}
function interactiveId(msg) {
  const nf = msg.interactiveResponseMessage && msg.interactiveResponseMessage.nativeFlowResponseMessage
  if (nf && nf.paramsJson) { try { const j = JSON.parse(nf.paramsJson); return String(j.id || j.selectedId || j.rowId || '') } catch {} }
  const l = msg.listResponseMessage && msg.listResponseMessage.singleSelectReply && msg.listResponseMessage.singleSelectReply.selectedRowId
  if (l) return String(l)
  const b = msg.buttonsResponseMessage && msg.buttonsResponseMessage.selectedButtonId
  if (b) return String(b)
  const t = msg.templateButtonReplyMessage && msg.templateButtonReplyMessage.selectedId
  if (t) return String(t)
  return null
}
const textOf = msg => { const id = interactiveId(msg); return id !== null ? (id === 'noop' ? '' : id) : (msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || '') }
function ctxInfo(msg) {
  for (const k of Object.keys(msg)) { const ci = msg[k] && msg[k].contextInfo; if (ci) return ci }
  return {}
}

const cache = new Map()
async function getMeta(sock, id) {
  const c = cache.get(id)
  if (c && Date.now() - c.t < 30000) return c.v
  const v = await sock.groupMetadata(id)
  cache.set(id, { v, t: Date.now() })
  return v
}
const dropMeta = id => cache.delete(id)

const pIds = p => [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean).map(num)
const botNums = sock => [sock.user?.id, sock.user?.lid, sock.user?.jid].filter(Boolean).map(num)

async function build(sock, m) {
  const from = m.key.remoteJid
  const isGroup = from.endsWith('@g.us')
  const msg = unwrap(m.message)
  const text = textOf(msg).trim()
  const ci = ctxInfo(msg)

  const senderJids = [m.key.participant, m.key.participantAlt, m.key.participantPn, m.participant, isGroup ? null : from, m.key.remoteJidAlt].filter(Boolean)
  // mensagem enviada pelo próprio número do bot: o remetente é o próprio bot (dono)
  if (m.key.fromMe && sock.user && sock.user.id) senderJids.unshift(String(sock.user.id).replace(/:\d+@/, '@'))
  const sender = senderJids[0] || from
  const senderNums = senderJids.map(num)
  const isOwner = senderNums.some(n => cfg.OWNER_NUMBERS.includes(n))

  let meta = null
  const adminNums = new Set()
  let isAdmin = false, isBotAdmin = false
  const bots = botNums(sock)
  if (isGroup) {
    try {
      meta = await getMeta(sock, from)
      for (const p of meta.participants) if (p.admin) pIds(p).forEach(n => adminNums.add(n))
      isAdmin = senderNums.some(n => adminNums.has(n))
      isBotAdmin = bots.some(n => adminNums.has(n))
    } catch {}
  }

  const fromButton = interactiveId(msg) !== null
  const qo = fromButton ? {} : { quoted: m }
  const mentioned = ci.mentionedJid || []
  const c = {
    sock, m, msg, from, isGroup, text, ci, meta,
    sender, senderNum: num(sender), pushName: m.pushName || '',
    isOwner, isAdmin, isBotAdmin, adminNums, bots,
    mentioned,
    mentionsBot: mentioned.some(j => bots.includes(num(j))),
    repliesBot: !!ci.participant && bots.includes(num(ci.participant)),
    cmd: '', args: [], modo: 'peter',
    tag: j => '@' + num(j),
    fromButton, qo,
    reply: (t, mentions = []) => sock.sendMessage(from, { text: t, mentions }, qo)
  }
  return c
}

// alvo: menção > reply > número digitado
function target(c) {
  if (c.mentioned[0]) return c.mentioned[0]
  if (c.ci.participant) return c.ci.participant
  const d = c.args.join('').replace(/\D/g, '')
  if (d.length >= 8) return d + '@s.whatsapp.net'
  return null
}
// participante real do grupo (id certo para groupParticipantsUpdate)
function participant(c, jid) {
  const n = num(jid)
  return (c.meta?.participants || []).find(p => pIds(p).includes(n)) || null
}

async function imageBuffer(c) {
  const quoted = c.ci.quotedMessage ? unwrap(c.ci.quotedMessage) : null
  for (const x of [quoted, c.msg]) {
    if (x && x.imageMessage) {
      const s = await downloadContentFromMessage(x.imageMessage, 'image')
      let b = Buffer.alloc(0)
      for await (const ch of s) b = Buffer.concat([b, ch])
      return b
    }
  }
  return null
}

module.exports = { textOf, interactiveId, num, unwrap, getMeta, dropMeta, pIds, build, target, participant, imageBuffer }
