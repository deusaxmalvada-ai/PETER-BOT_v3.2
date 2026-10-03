'use strict'

const messages = require('../core/messages')
const subpanels = require('./subpanels')
const commandPanel = require('./commandPanel')

const panels = {

  '1': {
    title: '🏠 𝙋𝙍𝙄𝙉𝘾𝙄𝙋𝘼𝙇',
    content: `│
│ 〔01〕 📋 VISÃO GERAL
│ 〔02〕 📖 COMANDOS
│ 〔03〕 🧭 NAVEGAÇÃO
│
│ ─────────────────────────
│ 🕷️ Sistema principal
│ ↩️ .menu`
  },

  '2': {
    title: '👤 𝙐𝙎𝙐Á𝙍𝙄𝙊',
    content: `│
│ 〔01〕 👤 MEU PERFIL
│ 〔02〕 🏷️ INFORMAÇÕES
│ 〔03〕 📊 MEU STATUS
│
│ ─────────────────────────
│ 👤 Área do usuário
│ ↩️ .menu`
  },

  '3': {
    title: '👥 𝙂𝙍𝙐𝙋𝙊',
    content: `│
│ 〔01〕 📋 INFORMAÇÕES
│ 〔02〕 👋 WELCOME
│ 〔03〕 🚪 BYE
│ 〔04〕 📜 REGRAS
│ 〔05〕 ⚙️ CONFIGURAÇÃO
│
│ ─────────────────────────
│ 👥 Sistema de grupo
│ ↩️ .menu`
  },

  '4': {
    title: '🛡️ 𝘼𝘿𝙈𝙄𝙉𝙄𝙎𝙏𝙍𝘼ÇÃ𝙊',
    content: `│
│ 〔01〕 🔨 BAN
│ 〔02〕 🔓 UNBAN
│ 〔03〕 ⚠️ WARN
│ 〔04〕 🗑️ DELWARN
│
│ 〔05〕 📢 TAGALL
│ 〔06〕 👻 HIDETAG
│ 〔07〕 📜 REGRAS
│
│ ─────────────────────────
│ 🛡️ Ferramentas administrativas
│ ↩️ .menu`
  },

  '5': {
    title: '🎨 𝙈Í𝘿𝙄𝘼',
    content: `│
│ 〔01〕 🕷️ M2
│ 〔02〕 🖼️ STICKER
│ 〔03〕 🔄 CONVERSOR
│ 〔04〕 🎬 VÍDEO
│ 〔05〕 😂 MEME
│
│ ─────────────────────────
│ 🎨 Media System
│ ↩️ .menu`
  },

  '6': {
    title: '🎮 𝘿𝙄𝙑𝙀𝙍𝙎Ã𝙊',
    content: `│
│ 〔01〕 🎲 DADO
│ 〔02〕 ✊ PEDRA / PAPEL / TESOURA
│ 〔03〕 ❤️ REAÇÃO
│ 〔04〕 💬 QUOTE
│
│ ─────────────────────────
│ 🎮 Fun System
│ ↩️ .menu`
  },

  '7': {
    title: '⚙️ 𝙎𝙄𝙎𝙏𝙀𝙈𝘼',
    content: `│
│ 〔01〕 📡 PING
│ 〔02〕 🔄 REINÍCIO
│ 〔03〕 📊 STATUS
│ 〔04〕 ⚙️ CONFIGURAÇÃO
│
│ ─────────────────────────
│ ⚙️ Controle do sistema
│ ↩️ .menu`
  },

  '8': {
    title: '📊 𝙎𝙏𝘼𝙏𝙐𝙎',
    content: `│
│ 〔01〕 🟢 BOT ONLINE
│ 〔02〕 ⏱️ UPTIME
│ 〔03〕 💾 MEMÓRIA
│ 〔04〕 📦 SISTEMA
│
│ ─────────────────────────
│ 📊 Monitoramento
│ ↩️ .menu`
  },

  '9': {
    title: '🔐 𝙎𝙀𝙂𝙐𝙍𝘼𝙉Ç𝘼',
    content: `│
│ 〔01〕 🔑 PERMISSÕES
│ 〔02〕 🛡️ PROTEÇÕES
│ 〔03〕 🚫 BLOQUEIOS
│ 〔04〕 📋 LOGS
│
│ ─────────────────────────
│ 🔐 Security System
│ ↩️ .menu`
  },

  '10': {
    title: '💾 𝘿𝘼𝘿𝙊𝙎',
    content: `│
│ 〔01〕 💾 DADOS DO USUÁRIO
│ 〔02〕 👥 DADOS DO GRUPO
│ 〔03〕 ⚙️ CONFIGURAÇÕES
│ 〔04〕 🗃️ BANCO DE DADOS
│
│ ─────────────────────────
│ 💾 Data System
│ ↩️ .menu`
  },

  '11': {
    title: '👑 𝙊𝙒𝙉𝙀𝙍',
    content: `│
│ 〔01〕 👑 COMANDOS EXCLUSIVOS
│ 〔02〕 ⚙️ CONFIGURAÇÃO GLOBAL
│ 〔03〕 🔐 SEGURANÇA
│ 〔04〕 📊 STATUS AVANÇADO
│
│ ─────────────────────────
│ 👑 Owner Control
│ ↩️ .menu`
  }
}

async function show(sock, m, from, id, subId) {
  if (subId) return commandPanel.show(sock, m, from, id, subId)

  const panel = panels[String(id)]

  if (!panel) return false

  await sock.sendMessage(
    from,
    {
      text: messages.panel(panel.title, panel.content)
    },
    { quoted: m }
  )

  return true
}

module.exports = {
  panels,
  subpanels,
  commandPanel,
  show
}
