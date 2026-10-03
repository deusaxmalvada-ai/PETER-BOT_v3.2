'use strict'
// Menu em LISTA (botão "≡ ABRIR MENU" que abre as secções), como nos bots com menu interativo.
// ATENÇÃO: o WhatsApp restringe mensagens interativas; funciona em alguns aparelhos/versões e noutros não.
// Por isso o modo padrão é "texto"; testa com .testelista e, se aparecer o botão, usa .menumodo lista.
const B = require('@whiskeysockets/baileys')

// sections: [{ title, rows: [{ title, desc, id }] }]
async function sendList(sock, jid, o, quoted) {
  const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = B
  if (!generateWAMessageFromContent || !proto || !proto.Message || !proto.Message.InteractiveMessage || typeof sock.relayMessage !== 'function') {
    throw new Error('esta versão do Baileys não suporta mensagens interativas')
  }
  const IM = proto.Message.InteractiveMessage
  let header = IM.Header.create({ title: o.title || '', subtitle: '', hasMediaAttachment: false })
  if (o.image && prepareWAMessageMedia) {
    const media = await prepareWAMessageMedia({ image: o.image }, { upload: sock.waUploadToServer })
    header = IM.Header.create({ title: o.title || '', subtitle: '', hasMediaAttachment: true, ...media })
  }
  const sections = o.sections.map(s => ({
    title: s.title, highlight_label: '',
    rows: s.rows.slice(0, 10).map(r => ({ header: '', title: String(r.title).slice(0, 24), description: String(r.desc || '').slice(0, 72), id: String(r.id) }))
  }))
  const content = {
    viewOnceMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: IM.create({
          body: IM.Body.create({ text: o.text }),
          footer: IM.Footer.create({ text: o.footer || '' }),
          header,
          nativeFlowMessage: IM.NativeFlowMessage.create({
            buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: o.button || '≡ ABRIR MENU', sections }) }],
            messageParamsJson: ''
          })
        })
      }
    }
  }
  const msg = generateWAMessageFromContent(jid, content, { quoted, userJid: sock.user && sock.user.id })
  const nodes = [{ tag: 'biz', attrs: {}, content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }] }]
  if (!String(jid).endsWith('@g.us')) nodes.push({ tag: 'bot', attrs: { biz_bot: '1' } })
  await sock.relayMessage(jid, msg.message, { messageId: msg.key.id, additionalNodes: nodes })
}
module.exports = { sendList }
