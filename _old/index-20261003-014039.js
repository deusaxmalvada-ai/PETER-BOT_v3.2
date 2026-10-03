'use strict'
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers
} = require('@whiskeysockets/baileys')
const P = require('pino')
const cfg = require('./src/config')
const handler = require('./bot')

async function startBot() {
  try {
    console.log('🕷️ Iniciando PETER-BOT...')
    const { state, saveCreds } = await useMultiFileAuthState('./auth')

    const sock = makeWASocket({
      auth: state,
      logger: P({ level: 'silent' }),
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: false,
      syncFullHistory: false
    })

    sock.ev.on('creds.update', saveCreds)

    // limpa o visual dos painéis do M2 (caixa dupla) antes de enviar
    const _send = sock.sendMessage.bind(sock)
    sock.sendMessage = (jid, content, opts) => {
      try {
        const modo = require('./src/db').getModo()
        const fix = require('./src/m2fix').clean
        if (content && typeof content.text === 'string') content = { ...content, text: fix(content.text, modo) }
        else if (content && typeof content.caption === 'string') content = { ...content, caption: fix(content.caption, modo) }
      } catch {}
      return _send(jid, content, opts)
    }

    // vincular por código (sem QR)
    if (!state.creds.registered) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(cfg.PAIRING_NUMBER)
          console.log('\n╭━━━〔 🕷️ PETER-BOT 〕━━━╮')
          console.log('│ 🔐 CÓDIGO DE VINCULAÇÃO')
          console.log(`│ ${code}`)
          console.log('│ WhatsApp → Dispositivos associados')
          console.log('│ → Associar com número de telefone')
          console.log('╰━━━━━━━━━━━━━━╯\n')
        } catch (e) { console.log('❌ Erro ao gerar código:', e.message) }
      }, 3000)
    }

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'connecting') console.log('🔄 Conectando ao WhatsApp...')
      if (connection === 'open') {
        console.log('\n╭━━━〔 🕷️ PETER-BOT 〕━━━╮')
        console.log('│ 🟢 STATUS: CONECTADO')
        console.log('╰━━━━━━━━━━━━━━╯\n')
      }
      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode
        console.log(`⚠️ Conexão encerrada. Código: ${code || 'desconhecido'}`)
        if (code === DisconnectReason.loggedOut) {
          console.log('❌ Sessão encerrada pelo WhatsApp. Apaga a pasta ./auth e inicia de novo para vincular.')
          return
        }
        console.log('🔄 Tentando reconectar...')
        setTimeout(() => startBot().catch(e => console.log('❌ Erro na reconexão:', e.message)), 3000)
      }
    })

    // recebe mensagens (notify = tempo real; append = também chega assim quando vem do teu próprio telemóvel)
    const seen = new Set()
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (!Array.isArray(messages)) return
      for (const m of messages) {
        try {
          if (!m || !m.message || !m.key) continue
          const id = (m.key.remoteJid || '') + m.key.id
          if (seen.has(id)) continue
          seen.add(id); if (seen.size > 600) seen.delete(seen.values().next().value)

          const msg = m.message.ephemeralMessage ? m.message.ephemeralMessage.message || {} : m.message
          const t = String(msg.conversation || (msg.extendedTextMessage && msg.extendedTextMessage.text) || (msg.imageMessage && msg.imageMessage.caption) || (msg.videoMessage && msg.videoMessage.caption) || '').trim()
          const where = String(m.key.remoteJid || '').endsWith('@g.us') ? 'grupo' : 'privado'
          console.log(`📩 ${type} · ${m.key.fromMe ? 'eu' : 'outro'} · ${where}: ${t.slice(0, 30) || '(mídia)'}`)

          // 'append' só vale se for recente (evita reprocessar histórico)
          const age = Date.now() / 1000 - Number(m.messageTimestamp && m.messageTimestamp.low != null ? m.messageTimestamp.low : m.messageTimestamp || 0)
          if (type !== 'notify' && !(type === 'append' && age >= 0 && age < 60)) continue

          // mensagens enviadas pelo próprio número do bot: só aceita comandos (começam por ".")
          // (as respostas do bot nunca começam por ".", por isso não há ciclo)
          if (m.key.fromMe && !t.startsWith('.')) continue

          await handler(sock, m)
        } catch (e) { console.log('❌ Erro ao processar mensagem:', e) }
      }
    })

    sock.ev.on('group-participants.update', async (u) => {
      try {
        if (!u || !u.id || !Array.isArray(u.participants)) return
        for (const p of u.participants) {
          try {
            if (u.action === 'add') await handler.sendWelcome(sock, u.id, p)
            else if (u.action === 'remove' || u.action === 'leave') await handler.sendBye(sock, u.id, p)
          } catch (e) { console.log('❌ Erro boas-vindas/saída:', e.message) }
        }
      } catch (e) { console.log('❌ Erro no evento de grupo:', e.message) }
    })
  } catch (e) {
    console.log('❌ Falha crítica ao iniciar o PETER-BOT:', e)
    setTimeout(() => startBot().catch(() => {}), 5000)
  }
}

process.on('unhandledRejection', e => console.log('⚠️ unhandledRejection:', e && e.message ? e.message : e))
process.on('uncaughtException', e => console.log('⚠️ uncaughtException:', e && e.message ? e.message : e))

startBot()
