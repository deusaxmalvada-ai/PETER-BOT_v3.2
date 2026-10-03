'use strict'
const ui = require('../ui')
const G = require('../guards')
const db = require('../db')
const img = require('../img')
const cfg = require('../config')
const { sendList } = require('../interactive')

// item: [emoji, comando, descrição, dica de argumentos?]
const MENUS = {
  1: { e: '🎮', t: 'JOGOS', run: true, cats: [
    { k: 'jogos', t: 'JOGOS', items: [['🪙', '.coin', 'cara ou coroa'], ['🎲', '.dado', 'dado de 6'], ['❤️', '.ship', 'compatibilidade', '@a @b']] },
    { k: 'conversa', t: 'CONVERSA', items: [['🌀', '@' + cfg.BOT_NAME, 'menciona e fala']] } ] },
  2: { e: '🎨', t: 'MÍDIA', cats: [
    { k: 'stickers', t: 'STICKERS', items: [['⚡', '.s', 'foto/vídeo → sticker'], ['🏷️', '.take', 'renomear sticker', 'nome | autor'], ['🔄', '.toimg', 'sticker → imagem']] },
    { k: 'downloads', t: 'DOWNLOADS', items: [['🎵', '.mp3', 'áudio', 'título|link'], ['🎧', '.play', 'música', 'título'], ['☁️', '.soundcloud', 'SoundCloud', 'título'], ['🟢', '.spotify', 'via Spotify', 'título|link'], ['🎬', '.mp4', 'vídeo', 'link'], ['🎞️', '.tt', 'TikTok', 'link'], ['📸', '.ig', 'Instagram', 'link'], ['📘', '.fb', 'Facebook', 'link']] },
    { k: 'extras', t: 'EXTRAS', items: [['💾', '.save', 'guardar mídia'], ['😂', '.meme', 'criar meme'], ['❤️', '.react', 'reagir'], ['💬', '.quote', 'criar quote']] } ] },
  3: { e: '👥', t: 'GRUPO', cats: [
    { k: 'info', t: 'INFO', items: [['🏠', '.grupo', 'dados'], ['📜', '.regras', 'regras'], ['👮', '.admins', 'admins'], ['🔗', '.linkgp', 'link']] },
    { k: 'mencoes', t: 'MENÇÕES', items: [['📣', '.tagall', 'marcar todos'], ['👻', '.hidetag', 'marcar oculto']] } ] },
  4: { e: '🛡️', t: 'ADMIN', cats: [
    { k: 'moderacao', t: 'MODERAÇÃO', items: [['🚫', '.ban', 'remover'], ['⚠️', '.warn', 'avisar'], ['📊', '.warnings', 'avisos'], ['🔇', '.mute', 'silenciar'], ['🔊', '.unmute', 'liberar'], ['🗑️', '.del', 'apagar msg']] },
    { k: 'cargos', t: 'CARGOS', items: [['⬆️', '.promover', 'dar admin'], ['⬇️', '.rebaixar', 'tirar admin'], ['✅', '.confirmar', 'confirmar ação']] } ] },
  5: { e: '⚙️', t: 'SISTEMA', cats: [
    { k: 'bot', t: 'BOT', items: [['🏓', '.ping', 'online?']] },
    { k: 'grupo', t: 'GRUPO', items: [['💌', '.welcome', 'on/off'], ['🚪', '.bye', 'on/off'], ['📜', '.setregras', 'definir']] } ] }
}
MENUS[6] = { e: '🍥', t: 'RPG NINJA', cats: [
  { k: 'personagem', t: 'PERSONAGEM', items: [['🥷', '.criar', 'criar personagem', 'Nome'], ['📜', '.ficha', 'ver ficha'], ['🏯', '.clas', 'lista de clãs'], ['🌀', '.jutsus', 'teus jutsus'], ['📖', '.aprender', 'comprar jutsu', 'rasengan']] },
  { k: 'aventura', t: 'AVENTURA', items: [['💪', '.treinar', 'treinar e subir'], ['🎯', '.missao', 'missões D a S', 'D'], ['🐾', '.cacar', 'caçar inimigos'], ['⚔️', '.duelo', 'desafiar', '@alvo aposta'], ['🎁', '.diario', 'prémio diário'], ['🏥', '.curar', 'hospital']] },
  { k: 'loja', t: 'LOJA', items: [['🛒', '.loja', 'itens à venda'], ['💰', '.comprar', 'comprar', 'item qtd'], ['🎒', '.inventario', 'mochila'], ['🗡️', '.equipar', 'equipar', 'item'], ['🧪', '.usar', 'usar item', 'item']] },
  { k: 'social', t: 'SOCIAL', items: [['🏆', '.rankrpg', 'ranking'], ['🗑️', '.excluirchar', 'apagar personagem']] } ] }
MENUS[7] = { e: '💹', t: 'VIP INVEST', cats: [
  { k: 'mercado', t: 'MERCADO', items: [['📊', '.inv mercado', 'preços e risco'], ['💼', '.inv carteira', 'tua carteira'], ['🛒', '.inv comprar', 'comprar', 'ATIVO valor'], ['💰', '.inv vender', 'vender', 'ATIVO valor'], ['📰', '.inv noticias', 'eventos'], ['🏆', '.inv rank', 'ranking VIP']] },
  { k: 'calc', t: 'CALCULADORAS', items: [['🧮', '.inv calc juros', 'juros compostos'], ['⚖️', '.inv calc risco', 'tamanho da posição'], ['🎯', '.inv calc meta', 'tempo até a meta']] },
  { k: 'vip', t: 'ACESSO', items: [['💎', '.vip', 'ver teu acesso']] } ] }
const OWNER = { e: '👑', t: 'OWNER', cats: [
  { k: 'persona', t: 'PERSONA', items: [['🔀', '.modo', 'yuji | modulo'], ['🎨', '.estilo', '1 | 2 | 3'], ['🧠', '.ia', 'on | off | limpar'], ['📋', '.menumodo', 'lista | texto'], ['🧪', '.testelista', 'testar menu lista']] },
  { k: 'sistema', t: 'SISTEMA', items: [['📊', '.status', 'estado'], ['🔄', '.restart', 'reiniciar'], ['🔌', '.shutdown', 'desligar']] },
  { k: 'perfil', t: 'PERFIL', items: [['📝', '.setbio', 'bio'], ['🖼️', '.setpp', 'foto'], ['🏷️', '.setnome', 'nome do bot']] },
  { k: 'vip', t: 'VIP', items: [['💎', '.vip add', 'dar VIP', '@pessoa'], ['❌', '.vip del', 'tirar VIP', '@pessoa'], ['📜', '.vips', 'listar VIP']] } ] }

let lastListError = ''
const listMode = () => db.data.menuMode === 'lista'
const cargo = c => (c.isOwner ? '👑 Criador' : c.isAdmin ? '🛡️ Admin' : '👤 Membro')
const hora = () => { try { return new Date().toLocaleTimeString('pt-PT', { hour12: false, timeZone: cfg.TZ }) } catch { return new Date().toTimeString().slice(0, 8) } }
const itemLine = i => [i[0], i[3] ? `${i[1]} ${i[3]}` : i[1], i[2]]
const runnable = (menu, i) => !!(menu.run && !i[3] && i[1].startsWith('.'))

async function sendText(c, text, mentions, names) {
  const buf = img.read(names)
  if (buf) { try { return await c.sock.sendMessage(c.from, { image: buf, caption: text, mentions }, c.qo) } catch {} }
  return c.reply(text, mentions)
}
async function trySendList(c, o, names) {
  try { await sendList(c.sock, c.from, { ...o, image: img.read(names) || undefined, footer: `${cfg.BOT_NAME} · ${cfg.OWNER_NAME}` }, c.fromButton ? undefined : c.m); lastListError = ''; return true }
  catch (e) { lastListError = String(e && e.message || e).slice(0, 120); console.log('⚠️ Menu em lista falhou, uso texto:', e && e.stack || e); return false }
}
const info = c => [`👤 ${ui.sc('usuário')}: ${c.pushName || c.tag(c.sender)}`, `🎖️ ${ui.sc('cargo')}: ${cargo(c)}`, `🕐 ${ui.sc('hora')}: ${hora()}`, `🧠 ${ui.sc('modo')}: ${ui.M(c.modo).name}`]

async function main(c) {
  const names = img.forMain(c.modo)
  const rows = Object.entries(MENUS).map(([n, m]) => ({ title: 'MENU-' + m.t, desc: m.e + ' .menu' + n, id: '.menu' + n }))
  if (c.isOwner) rows.push({ title: 'MENU-DONO', desc: '👑 .ownermenu', id: '.ownermenu' })
  if (listMode() && await trySendList(c, { text: info(c).join('\n'), button: '≡ ABRIR MENU', sections: [{ title: 'MENUS', rows }] }, names)) return
  const list = ui.list([...Object.entries(MENUS).map(([n, m]) => [m.e, '.menu' + n, m.t.toLowerCase()]), ...(c.isOwner ? [['👑', '.ownermenu', 'dono']] : [])])
  await sendText(c, ui.home(c.modo, [...info(c), ui.sec('menus'), ...list]) + '\n' + ui.CRIADOR, [], names)
}

const catText = (m, cat) => [ui.sec(cat.t.toLowerCase()), ...ui.list(cat.items.map(itemLine))]

// mostra um menu (todas as secções) ou só uma categoria (cat = chave)
async function show(c, def, key, names, catKey) {
  const cats = catKey ? def.cats.filter(x => x.k === catKey) : def.cats
  if (listMode()) {
    if (!catKey && def.cats.length > 1) {          // 1º nível: escolher a secção
      const rows = def.cats.map(x => ({ title: x.t, desc: `${x.items.length} comandos`, id: `.menu${key} ${x.k}` }))
      rows.push({ title: 'Voltar ao menu', desc: '↩️ .menu', id: '.menu' })
      if (await trySendList(c, { text: `${def.e} ${ui.sc(def.t)}\n\nToca em ≡ COMANDOS para ver as secções 👇`, button: '≡ COMANDOS', sections: [{ title: 'SECÇÕES', rows }] }, names)) return
    } else {                                        // 2º nível: lista de comandos
      const rows = cats.flatMap(x => x.items.map(i => ({ title: itemLine(i)[1], desc: i[2], id: runnable(def, i) ? i[1] : 'noop' })))
      rows.push({ title: 'Voltar ao menu', desc: '↩️ .menu', id: '.menu' })
      const nota = def.run ? 'Aqui os botões funcionam: toca num comando 🎮' : 'Nesses botões não é pra apertar: são só os comandos que vais usar 🚫'
      if (await trySendList(c, { text: `${def.e} ${ui.sc(cats[0] ? cats[0].t : def.t)}\n\n${nota}`, button: '≡ COMANDOS', sections: [{ title: (cats.length === 1 ? cats[0].t : def.t).slice(0, 24), rows: rows.slice(0, 10) }] }, names)) return
    }
  }
  const lines = cats.flatMap(x => catText(def, x))
  await sendText(c, ui.panel(c.modo, def.e, def.t, lines) + '\n' + ui.CRIADOR, [], names)
}

async function run(c) {
  const { cmd, args } = c
  if (cmd === 'menu') {
    const n = args[0]
    if (n && MENUS[n]) { await show(c, MENUS[n], n, img.forMenu(n, c.modo), args[1]); return true }
    await main(c); return true
  }
  const mm = /^menu([1-7])$/.exec(cmd)
  if (mm) { await show(c, MENUS[mm[1]], mm[1], img.forMenu(mm[1], c.modo), args[0]); return true }

  if (cmd === 'ownermenu') {
    if (!(await G.owner(c))) return true
    const head = [`🔐 ${ui.sc('acesso autorizado')}`]
    if (listMode() && (!args[0])) {
      const rows = OWNER.cats.map(x => ({ title: x.t, desc: `${x.items.length} comandos`, id: `.ownermenu ${x.k}` }))
      rows.push({ title: 'Voltar ao menu', desc: '↩️ .menu', id: '.menu' })
      if (await trySendList(c, { text: `👑 ${ui.sc('owner')}\n\nToca em ≡ COMANDOS para ver as secções 👇`, button: '≡ COMANDOS', sections: [{ title: 'SECÇÕES', rows }] }, img.forOwner(c.modo))) return true
    }
    const cats = args[0] ? OWNER.cats.filter(x => x.k === args[0]) : OWNER.cats
    if (listMode() && args[0]) {
      const rows = cats.flatMap(x => x.items.map(i => ({ title: itemLine(i)[1], desc: i[2], id: 'noop' }))); rows.push({ title: 'Voltar ao menu', desc: '↩️ .menu', id: '.menu' })
      if (await trySendList(c, { text: `👑 ${ui.sc(cats[0].t)}\n\nNesses botões não é pra apertar 🚫`, button: '≡ COMANDOS', sections: [{ title: cats[0].t, rows }] }, img.forOwner(c.modo))) return true
    }
    await sendText(c, ui.panel(c.modo, OWNER.e, OWNER.t, [...head, ...cats.flatMap(x => catText(OWNER, x))]) + '\n' + ui.CRIADOR, [], img.forOwner(c.modo))
    return true
  }

  if (cmd === 'menumodo') {
    if (!(await G.owner(c))) return true
    const v = (args[0] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (['lista', 'list', 'botoes', 'botao', 'botões'].includes(v)) { db.data.menuMode = 'lista'; db.save() }
    if (['texto', 'text', 'normal'].includes(v)) { db.data.menuMode = 'texto'; db.save() }
    const lines = [`modo atual: ${listMode() ? 'lista (botões)' : 'texto'}`, `${ui.sc('uso')}: .menumodo lista | texto`, `${ui.sc('teste')}: .testelista`]
    if (lastListError) lines.push(`⚠️ ${ui.sc('último erro da lista')}: ${lastListError}`)
    await c.reply(ui.panel(c.modo, '📋', 'MENU', lines))
    if (listMode() && v && ['lista', 'list', 'botoes', 'botao', 'botões'].includes(v)) await main(c)
    return true
  }
  if (cmd === 'testelista') {
    if (!(await G.owner(c))) return true
    const ok = await trySendList(c, { text: `🧪 ${ui.sc('teste de menu em lista')}\n\nSe vês o botão ≡ ABRIR MENU abaixo, o teu WhatsApp suporta. Usa .menumodo lista`, button: '≡ ABRIR MENU', sections: [{ title: 'TESTE', rows: [{ title: 'MENU-PRINCIPAL', desc: '.menu', id: '.menu' }, { title: 'PING', desc: '.ping', id: '.ping' }] }] }, img.forMain(c.modo))
    if (!ok) await c.reply(ui.err(c.modo, 'o envio da lista falhou (veja o Termux). Fica no modo texto.'))
    return true
  }
  return false
}
module.exports = { run }
