'use strict'

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers
} = require('@whiskeysockets/baileys')

const P = require('pino')
const handler = require('./bot')

const PAIRING_NUMBER = '244956885027'

async function startBot() {
  try {
    console.log('🕷️ Iniciando PETER-BOT...')

    const { state, saveCreds } = await useMultiFileAuthState('./auth')

const sock = makeWASocket({ logger: { level: "silent" },
  auth: state,
  logger: P({ level: 'silent' }),
  browser: Browsers.ubuntu('Chrome'),
  markOnlineOnConnect: false,
  syncFullHistory: false
})

    sock.ev.on('creds.update', saveCreds)

    /*
    ╔════════════════════════════════════╗
    ║          PAIRING CODE             ║
    ║       SEM QR CODE                 ║
    ╚════════════════════════════════════╝
    */

    if (!state.creds.registered) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(PAIRING_NUMBER)

          console.log('')
          console.log('╭━━━〔 🕷️ PETER-BOT 〕━━━╮')
          console.log('│')
          console.log('│ 🔐 CÓDIGO DE VINCULAÇÃO')
          console.log(`│ ${code}`)
          console.log('│')
          console.log('│ 📱 WhatsApp')
          console.log('│ → Dispositivos associados')
          console.log('│ → Associar dispositivo')
          console.log('│ → Associar com número de telefone')
          console.log('│ → Introduz o código acima')
          console.log('│')
          console.log('╰━━━━━━〔 🕸️ 〕━━━━━━╯')
          console.log('')
        } catch (e) {
          console.log('❌ Erro ao gerar código de vinculação:', e.message)
        }
      }, 3000)
    }

    /*
    ╔════════════════════════════════════╗
    ║       ESTADO DA CONEXÃO           ║
    ╚════════════════════════════════════╝
    */

    sock.ev.on('connection.update', async (update) => {
      const {
        connection,
        lastDisconnect
      } = update

      if (connection === 'connecting') {
        console.log('🔄 Conectando ao WhatsApp...')
      }

      if (connection === 'open') {
        console.log('')
        console.log('╭━━━〔 🕷️ PETER-BOT 〕━━━╮')
        console.log('│')
        console.log('│ 🟢 STATUS: CONECTADO')
        console.log('│ 🕸️ Sistema operacional')
        console.log('│ ⚡ Motor: Baileys')
        console.log('│ 🔐 Autenticação: ativa')
        console.log('│')
        console.log('╰━━━━━━〔 🕷️ 〕━━━━━━╯')
        console.log('')
      }

      if (connection === 'close') {
        const statusCode =
          lastDisconnect?.error?.output?.statusCode

        const loggedOut =
          statusCode === DisconnectReason.loggedOut

        console.log('')
        console.log('⚠️ Conexão encerrada.')
        console.log(`Código: ${statusCode || 'desconhecido'}`)

        if (loggedOut) {
          console.log(
            '❌ Sessão encerrada pelo WhatsApp. Será necessário vincular novamente.'
          )
          return
        }

        console.log('🔄 Tentando reconectar...')
        setTimeout(() => {
          startBot().catch(err => {
            console.log('❌ Erro na reconexão:', err.message)
          })
        }, 3000)
      }
    })

    /*
    ╔════════════════════════════════════╗
    ║          MENSAGENS                ║
    ╚════════════════════════════════════╝
    */

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        if (type !== 'notify') return
        if (!Array.isArray(messages) || !messages.length) return

        for (const m of messages) {
          if (!m?.message) continue
          if (m.key?.fromMe) continue

          const from = m.key?.remoteJid
          if (!from) continue

          const body =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            ''

          if (!body) continue

          const text = String(body).trim()

          if (!text) continue

          const parts = text.split(/\s+/)

          let cmd = parts.shift()?.toLowerCase() || ''

          const args = parts

          /*
          Alias é tratado dentro do bot.js.
          */

          const pushName =
            m.pushName ||
            'Usuário'

          await handler(
            sock,
            m,
            args,
            cmd,
            pushName,
            from
          )
        }
      } catch (e) {
        console.log('❌ Erro no processamento da mensagem:')
        console.log(e)
      }
    })

    /*
    ╔════════════════════════════════════╗
    ║        EVENTOS DE GRUPO           ║
    ╚════════════════════════════════════╝
    */

    sock.ev.on(
      'group-participants.update',
      async (update) => {
        try {
          if (!update?.id) return
          if (!Array.isArray(update.participants)) return

          /*
          ADIÇÃO DE MEMBROS
          */

          if (update.action === 'add') {
            if (typeof handler.sendWelcome !== 'function') return

            for (const participant of update.participants) {
              try {
                await handler.sendWelcome(
                  sock,
                  update.id,
                  participant
                )
              } catch (e) {
                console.log(
                  '❌ Erro no welcome:',
                  e.message
                )
              }
            }
          }

          /*
          REMOÇÃO DE MEMBROS
          */

          if (
            update.action === 'remove' ||
            update.action === 'leave'
          ) {
            if (typeof handler.sendBye !== 'function') return

            for (const participant of update.participants) {
              try {
                await handler.sendBye(
                  sock,
                  update.id,
                  participant
                )
              } catch (e) {
                console.log(
                  '❌ Erro no bye:',
                  e.message
                )
              }
            }
          }
        } catch (e) {
          console.log(
            '❌ Erro no evento do grupo:',
            e.message
          )
        }
      }
    )

    /*
    ╔════════════════════════════════════╗
    ║        ERROS GERAIS               ║
    ╚════════════════════════════════════╝
    */

    sock.ev.on('error', (err) => {
      console.log(
        '⚠️ Erro do socket:',
        err?.message || err
      )
    })

  } catch (e) {
    console.log('')
    console.log('❌ Falha crítica ao iniciar o PETER-BOT')
    console.log(e)

    setTimeout(() => {
      startBot().catch(err => {
        console.log(
          '❌ Falha na tentativa de reinício:',
          err.message
        )
      })
    }, 5000)
  }
}

startBot()
