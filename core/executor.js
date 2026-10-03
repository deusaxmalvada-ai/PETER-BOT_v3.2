'use strict'

const messages = require('./messages')

async function execute(sock, m, from, options = {}) {

  const {
    command = 'COMANDO',
    user = 'Usuário',
    media = 'Nenhuma',
    action
  } = options

  if (typeof action !== 'function') {
    await sock.sendMessage(
      from,
      { text: messages.error('Ação não definida.') },
      { quoted: m }
    )
    return false
  }

  try {

    // 1 — PEDIDO RECEBIDO
    await sock.sendMessage(
      from,
      { text: messages.request(user, command, media) },
      { quoted: m }
    )

    // 2 — VALIDAÇÃO
    await sock.sendMessage(
      from,
      { text: messages.validating(command) },
      { quoted: m }
    )

    // 3 — VALIDAÇÃO CONCLUÍDA
    await sock.sendMessage(
      from,
      { text: messages.confirmed(command) },
      { quoted: m }
    )

    // 4 — PROCESSAMENTO
    await sock.sendMessage(
      from,
      { text: messages.processing(command) },
      { quoted: m }
    )

    // 5 — EXECUÇÃO REAL
    const result = await action()

    // 6 — RESULTADO
    if (result !== false) {
      await sock.sendMessage(
        from,
        { text: messages.success(command) },
        { quoted: m }
      )
    }

    return result

  } catch (error) {

    console.log(`EXECUTOR ERROR [${command}]:`, error.message)

    await sock.sendMessage(
      from,
      {
        text: messages.error(
          error.message || 'Erro durante a execução.'
        )
      },
      { quoted: m }
    )

    return false
  }
}

module.exports = {
  execute
}
