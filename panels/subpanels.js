'use strict'

const SUBPANELS = {

  '4': {
    title: '🛡️ 𝘼𝘿𝙈𝙄𝙉𝙄𝙎𝙏𝙍𝘼ÇÃ𝙊',
    items: [
      '🔨 〔01〕 BAN',
      '🔓 〔02〕 UNBAN',
      '⚠️ 〔03〕 WARN',
      '🗑️ 〔04〕 DELWARN',
      '📢 〔05〕 TAGALL',
      '👻 〔06〕 HIDETAG',
      '📜 〔07〕 REGRAS'
    ]
  },

  '5': {
    title: '🎨 𝙈Í𝘿𝙄𝘼',
    items: [
      '🕷️ 〔01〕 M2',
      '🖼️ 〔02〕 STICKER',
      '🔄 〔03〕 CONVERSOR',
      '🎬 〔04〕 VÍDEO',
      '😂 〔05〕 MEME'
    ]
  },

  '6': {
    title: '🎮 𝘿𝙄𝙑𝙀𝙍𝙎Ã𝙊',
    items: [
      '🎲 〔01〕 DADO',
      '✊ 〔02〕 PEDRA / PAPEL / TESOURA',
      '❤️ 〔03〕 REAÇÃO',
      '💬 〔04〕 QUOTE'
    ]
  },

  '7': {
    title: '⚙️ 𝙎𝙄𝙎𝙏𝙀𝙈𝘼',
    items: [
      '📡 〔01〕 PING',
      '🔄 〔02〕 REINÍCIO',
      '📊 〔03〕 STATUS',
      '⚙️ 〔04〕 CONFIGURAÇÃO'
    ]
  },

  '8': {
    title: '📊 𝙎𝙏𝘼𝙏𝙐𝙎',
    items: [
      '🟢 〔01〕 BOT ONLINE',
      '⏱️ 〔02〕 UPTIME',
      '💾 〔03〕 MEMÓRIA',
      '📦 〔04〕 SISTEMA'
    ]
  },

  '9': {
    title: '🔐 𝙎𝙀𝙂𝙐𝙍𝘼𝙉Ç𝘼',
    items: [
      '🔑 〔01〕 PERMISSÕES',
      '🛡️ 〔02〕 PROTEÇÕES',
      '🚫 〔03〕 BLOQUEIOS',
      '📋 〔04〕 LOGS'
    ]
  },

  '10': {
    title: '💾 𝘿𝘼𝘿𝙊𝙎',
    items: [
      '💾 〔01〕 DADOS DO USUÁRIO',
      '👥 〔02〕 DADOS DO GRUPO',
      '⚙️ 〔03〕 CONFIGURAÇÕES',
      '🗃️ 〔04〕 BANCO DE DADOS'
    ]
  },

  '11': {
    title: '👑 𝙊𝙒𝙉𝙀𝙍',
    items: [
      '👑 〔01〕 COMANDOS EXCLUSIVOS',
      '⚙️ 〔02〕 CONFIGURAÇÃO GLOBAL',
      '🔐 〔03〕 SEGURANÇA',
      '📊 〔04〕 STATUS AVANÇADO'
    ]
  }
}

function build(panelId) {
  const panel = SUBPANELS[String(panelId)]
  if (!panel) return null

  return `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃        ${panel.title}        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                ┃
${panel.items.map(x => `┃  ${x}`).join('\n')}
┃                                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕷️ .menu ${panelId} <número>       ┃
┃ ↩️ .menu  → painel principal    ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
}

async function show(sock, m, from, panelId) {
  const text = build(panelId)
  if (!text) return false

  await sock.sendMessage(
    from,
    { text },
    { quoted: m }
  )

  return true
}

module.exports = {
  SUBPANELS,
  build,
  show
}
