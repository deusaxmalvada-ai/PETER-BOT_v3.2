'use strict'
// RPG NINJA: criação de personagem (aldeia · clã · natureza), treino, missões, caça, duelos, loja, jutsus.
const ui = require('../ui')
const db = require('../db')
const confirm = require('../confirm')
const R = require('../rpg/core')

const E = '🍥'
const store = () => (db.data.rpg || (db.data.rpg = { players: {} }))
const getP = c => store().players[c.senderNum]
const fmtT = ms => { const s = Math.ceil(ms / 1000), m = Math.floor(s / 60); return m ? `${m}m ${s % 60}s` : `${s}s` }
const COOL = { treinar: 10 * 60e3, missao: 6 * 60e3, cacar: 4 * 60e3, diario: 24 * 3600e3 }
const r0 = x => Math.round(x)
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
const panel = (c, title, lines) => c.reply(ui.panel(c.modo, E, title, lines))
const pending = new Map()      // duelos: alvo → { de, aposta, exp }

function cooldown(p, key) {
  const left = (p.cd[key] || 0) - Date.now()
  return left > 0 ? left : 0
}
const setCd = (p, key) => { p.cd[key] = Date.now() + COOL[key] }

// escolhe numa lista por número ou nome
function choose(map, arg) {
  const keys = Object.keys(map), a = norm(arg)
  if (/^\d+$/.test(a)) return keys[Number(a) - 1]
  return keys.find(k => k === a || norm(map[k].n) === a)
}
const listOf = (map, f) => Object.keys(map).map((k, i) => `${i + 1} ${map[k].e} ${map[k].n} · ${f(map[k])}`)

async function needChar(c) {
  const p = getP(c)
  if (!p) { await panel(c, 'RPG', ['Ainda não tens personagem.', `${ui.sc('cria')}: .criar Nome`]); return null }
  if (p.state !== 'ok') { await creationPrompt(c, p); return null }
  R.regen(p)
  return p
}
async function creationPrompt(c, p) {
  if (p.state === 'aldeia') await panel(c, 'ESCOLHE A ALDEIA', [...listOf(R.ALDEIAS, a => a.d), `${ui.sc('usa')}: .aldeia konoha (ou o número)`])
  else if (p.state === 'cla') await panel(c, 'ESCOLHE O CLÃ', [...listOf(R.CLAS, x => x.d), `${ui.sc('usa')}: .cla uchiha (ou o número)`])
  else if (p.state === 'nat') {
    const allowed = R.CLAS[p.cla].nat || Object.keys(R.NATS)
    await panel(c, 'ESCOLHE A NATUREZA', [...allowed.map((k, i) => `${i + 1} ${R.NATS[k].e} ${R.NATS[k].n}`), `${ui.sc('usa')}: .natureza fogo (ou o número)`])
  }
}
const sheet = (p, withEquip = true) => {
  const e = R.eff(p), rk = R.rankOf(p.lvl), a = R.ALDEIAS[p.aldeia] || {}, cl = R.CLAS[p.cla] || {}, n = R.NATS[p.nat] || {}
  const lines = [
    `🥷 ${p.name} · ${rk.e} ${rk.n} · ${ui.sc('nv')} ${p.lvl}`,
    `${a.e || ''} ${a.n || '—'} · ${cl.e || ''} ${cl.n || '—'} · ${n.e || ''} ${n.n || '—'}`,
    `❤️ ${r0(p.hp)}/${r0(e.hpMax)} · 🔷 ${r0(p.ck)}/${r0(e.ckMax)}`,
    `⚔️ ${r0(e.atk)} · 🌀 ${r0(e.nin)} · 🛡️ ${r0(e.def)} · 💨 ${r0(e.vel)}`,
    `📈 ${p.xp}/${R.xpNeed(p.lvl)} xp · 💰 ${p.ryo} ryo`,
    `🏆 ${p.wins}V · ${p.losses}D · 🎯 ${p.missions} missões`
  ]
  if (withEquip) { const eq = Object.entries(p.equip || {}).map(([s, id]) => R.ITENS[id] && R.ITENS[id].n).filter(Boolean); if (eq.length) lines.push(`🎒 ${eq.join(' · ')}`) }
  return lines
}
function applyFight(p, A) { const e = R.eff(p); p.hp = Math.max(1, Math.min(A.hp, e.hpMax)); p.ck = Math.max(0, Math.min(A.ck, e.ckMax)) }
const needHealth = p => p.hp < R.eff(p).hpMax * 0.3

function lvlUpLines(res) { return res.ups.length ? [`⬆️ ${ui.sc('subiste para o nível')} ${res.ups[res.ups.length - 1]}!`] : [] }

async function run(c) {
  const { cmd, args } = c
  const S = store()

  // ───── criação ─────
  if (cmd === 'criar') {
    if (getP(c) && getP(c).state === 'ok') { await panel(c, 'RPG', ['Já tens um personagem.', `${ui.sc('vê')}: .ficha`]); return true }
    const name = args.join(' ').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 16)
    if (name.length < 2) { await panel(c, 'RPG', [`${ui.sc('uso')}: .criar Nome (2 a 16 letras)`]); return true }
    if (Object.values(S.players).some(x => x.state === 'ok' && norm(x.name) === norm(name))) { await panel(c, 'RPG', ['Esse nome já existe. Escolhe outro.']); return true }
    S.players[c.senderNum] = R.newPlayer(name, c.senderNum); db.save()
    await creationPrompt(c, S.players[c.senderNum]); return true
  }
  if (cmd === 'aldeia' || cmd === 'cla' || cmd === 'natureza') {
    const p = getP(c)
    if (!p || p.state === 'ok') { await panel(c, 'RPG', [p ? 'Teu personagem já está criado.' : `${ui.sc('cria')}: .criar Nome`]); return true }
    const step = { aldeia: 'aldeia', cla: 'cla', natureza: 'nat' }[cmd]
    if (p.state !== step) { await creationPrompt(c, p); return true }
    if (step === 'aldeia') { const k = choose(R.ALDEIAS, args.join(' ')); if (!k) { await creationPrompt(c, p); return true } p.aldeia = k; p.state = 'cla' }
    else if (step === 'cla') { const k = choose(R.CLAS, args.join(' ')); if (!k) { await creationPrompt(c, p); return true } p.cla = k; p.state = 'nat' }
    else {
      const allowed = R.CLAS[p.cla].nat || Object.keys(R.NATS), a = norm(args.join(' '))
      const k = /^\d+$/.test(a) ? allowed[Number(a) - 1] : allowed.find(x => x === a || norm(R.NATS[x].n) === a)
      if (!k) { await creationPrompt(c, p); return true }
      p.nat = k; R.finish(p)
      db.save()
      await panel(c, 'PERSONAGEM CRIADO', [...sheet(p), `${ui.sc('próximos passos')}: .treinar · .missao · .loja`]); return true
    }
    db.save(); await creationPrompt(c, p); return true
  }

  // ───── menu / informação ─────
  if (cmd === 'rpg') {
    const p = getP(c)
    await panel(c, 'RPG NINJA', [p && p.state === 'ok' ? `${ui.sc('bem-vindo')}, ${p.name}!` : `${ui.sc('começa')}: .criar Nome`, 'Veja .menu6 para todos os comandos.'])
    return true
  }
  if (cmd === 'clas') { await panel(c, 'CLÃS', listOf(R.CLAS, x => x.d)); return true }
  if (cmd === 'ficha') {
    let p = getP(c)
    const t = c.mentioned[0] && S.players[require('../ctx').num(c.mentioned[0])]
    if (c.mentioned[0] && !t) { await panel(c, 'RPG', ['Essa pessoa não tem personagem.']); return true }
    p = t || p
    if (!p) { await panel(c, 'RPG', [`${ui.sc('cria')}: .criar Nome`]); return true }
    if (p.state !== 'ok') { await creationPrompt(c, p); return true }
    R.regen(p); await panel(c, 'FICHA', sheet(p)); return true
  }
  if (cmd === 'jutsus') {
    const p = await needChar(c); if (!p) return true
    const known = R.knownJutsus(p).map(j => `${j.t === 'nin' ? '🌀' : '👊'} ${j.n} · ${j.pow} · ${j.ck}ck`)
    const buy = R.JUTSUS.filter(j => j.buy && !(p.known || []).includes(j.id)).map(j => `🛒 ${j.id} · ${j.n} · ${j.buy} ryo (nv ${j.lvl})`)
    const locked = R.JUTSUS.filter(j => ((j.nat === p.nat) || (j.cla === p.cla)) && j.lvl > p.lvl).slice(0, 3).map(j => `🔒 ${j.n} · nv ${j.lvl}`)
    await panel(c, 'JUTSUS', [...known, ...buy, ...locked, `${ui.sc('aprender')}: .aprender rasengan`]); return true
  }
  if (cmd === 'aprender') {
    const p = await needChar(c); if (!p) return true
    const j = R.JBY[norm(args[0])]
    if (!j || !j.buy) { await panel(c, 'APRENDER', [`${ui.sc('uso')}: .aprender rasengan | shuriken`]); return true }
    if ((p.known || []).includes(j.id)) { await panel(c, 'APRENDER', ['Já conheces esse jutsu.']); return true }
    if (p.lvl < j.lvl) { await panel(c, 'APRENDER', [`Precisas de nível ${j.lvl}.`]); return true }
    if (p.ryo < j.buy) { await panel(c, 'APRENDER', [`Custa ${j.buy} ryo. Tens ${p.ryo}.`]); return true }
    p.ryo -= j.buy; p.known = [...(p.known || []), j.id]; db.save()
    await panel(c, 'APRENDER', [`✅ ${j.n} aprendido!`, `💰 -${j.buy} ryo`]); return true
  }

  // ───── progressão ─────
  if (cmd === 'treinar') {
    const p = await needChar(c); if (!p) return true
    const left = cooldown(p, 'treinar'); if (left) { await panel(c, 'TREINO', [`Estás cansado. Volta em ${fmtT(left)}.`]); return true }
    const map = { forca: 'atk', ninjutsu: 'nin', defesa: 'def', velocidade: 'vel', chakra: 'ckMax' }
    const foco = map[norm(args[0])] || R.pick(['atk', 'nin', 'def', 'vel'])
    const gain = foco === 'ckMax' ? R.rnd(1, 3) : R.rnd(0.2, 0.7)
    p[foco] += gain; setCd(p, 'treinar')
    const res = R.addXp(p, R.ri(15, 30)); db.save()
    const nome = { atk: '⚔️ força', nin: '🌀 ninjutsu', def: '🛡️ defesa', vel: '💨 velocidade', ckMax: '🔷 chakra' }[foco]
    await panel(c, 'TREINO', [`💪 Treinaste ${nome} (+${gain.toFixed(1)})`, `📈 +${res.gain} xp`, ...lvlUpLines(res)]); return true
  }
  if (cmd === 'diario') {
    const p = await needChar(c); if (!p) return true
    const left = cooldown(p, 'diario'); if (left) { await panel(c, 'DIÁRIO', [`Volta em ${fmtT(left)}.`]); return true }
    setCd(p, 'diario'); const ryo = 100 + p.lvl * 10; p.ryo += ryo; const res = R.addXp(p, 25); db.save()
    await panel(c, 'DIÁRIO', [`🎁 +${ryo} ryo · +${res.gain} xp`, ...lvlUpLines(res)]); return true
  }
  if (cmd === 'curar') {
    const p = await needChar(c); if (!p) return true
    const e = R.eff(p), miss = e.hpMax - p.hp, custo = Math.ceil(miss * 1.2)
    if (miss < 1 && p.ck >= e.ckMax - 1) { await panel(c, 'HOSPITAL', ['Estás em plena forma.']); return true }
    if (p.ryo < custo) { await panel(c, 'HOSPITAL', [`Custa ${custo} ryo. Tens ${p.ryo}.`, 'Descansa: regeneras 1% de HP por minuto.']); return true }
    p.ryo -= custo; p.hp = e.hpMax; p.ck = e.ckMax; db.save()
    await panel(c, 'HOSPITAL', ['🏥 Curado!', `💰 -${custo} ryo`]); return true
  }

  // ───── missões e caça ─────
  if (cmd === 'missao' || cmd === 'cacar') {
    const p = await needChar(c); if (!p) return true
    const hunt = cmd === 'cacar'
    const key = hunt ? 'cacar' : 'missao'
    if (!hunt && !args[0]) {
      await panel(c, 'MISSÕES', Object.entries(R.MISSOES).map(([k, m]) => `${k} · nv ${m.minLvl}+ · 💰${m.ryo[0]}-${m.ryo[1]} · 📈${m.xp[0]}-${m.xp[1]}${p.lvl < m.minLvl ? ' 🔒' : ''}`).concat([`${ui.sc('usa')}: .missao D`]))
      return true
    }
    const rank = hunt ? null : String(args[0]).toUpperCase()
    const m = hunt ? null : R.MISSOES[rank]
    if (!hunt && !m) { await panel(c, 'MISSÕES', ['Rank inválido. Usa D, C, B, A ou S.']); return true }
    if (!hunt && p.lvl < m.minLvl) { await panel(c, 'MISSÕES', [`Missão ${rank} pede nível ${m.minLvl}.`]); return true }
    const left = cooldown(p, key); if (left) { await panel(c, hunt ? 'CAÇA' : 'MISSÃO', [`Descansa. Volta em ${fmtT(left)}.`]); return true }
    if (needHealth(p)) { await panel(c, 'FERIDO', ['Estás ferido demais.', `Usa .curar ou espera regenerar.`]); return true }
    setCd(p, key)
    const lvlE = hunt ? p.lvl : Math.max(1, p.lvl + R.ri(m.lv[0], m.lv[1]))
    const A = R.fighterFromPlayer(p), B = R.enemyFor(lvlE), res = R.fight(A, B)
    applyFight(p, A)
    const title = hunt ? 'CAÇA' : `MISSÃO ${rank}`
    const head = hunt ? `🐾 Encontraste: ${B.name} (nv ${lvlE})` : `🎯 ${R.pick(m.nomes)}\n👤 ${B.name} (nv ${lvlE})`
    if (res.winner === 'a') {
      const ryo = hunt ? R.ri(20, 60) + p.lvl * 2 : R.ri(m.ryo[0], m.ryo[1]), xp = hunt ? R.ri(20, 40) + p.lvl : R.ri(m.xp[0], m.xp[1])
      p.ryo += ryo; if (!hunt) p.missions++
      const xr = R.addXp(p, xp); db.save()
      await panel(c, title, [head, `✅ Vitória em ${res.rounds} rondas`, `💰 +${ryo} ryo · 📈 +${xr.gain} xp`, ...lvlUpLines(xr), `❤️ ${r0(p.hp)}/${r0(R.eff(p).hpMax)}`])
    } else {
      const perda = Math.min(p.ryo, Math.round(p.ryo * 0.05)); p.ryo -= perda; db.save()
      await panel(c, title, [head, '❌ Foste derrotado!', perda ? `💸 -${perda} ryo` : '', `❤️ ${r0(p.hp)}/${r0(R.eff(p).hpMax)} · usa .curar`].filter(Boolean))
    }
    return true
  }

  // ───── duelos ─────
  if (cmd === 'duelo') {
    const p = await needChar(c); if (!p) return true
    const t = c.mentioned[0] || c.ci.participant
    if (!t) { await panel(c, 'DUELO', [`${ui.sc('uso')}: .duelo @alvo [aposta]`]); return true }
    const tk = require('../ctx').num(t), q = S.players[tk]
    if (tk === c.senderNum) { await panel(c, 'DUELO', ['Não podes lutar contra ti mesmo.']); return true }
    if (!q || q.state !== 'ok') { await panel(c, 'DUELO', ['O alvo não tem personagem.']); return true }
    const aposta = Math.max(0, Math.floor(Number(args.find(a => /^\d+$/.test(a))) || 0))
    R.regen(q)
    if (needHealth(p) || needHealth(q)) { await panel(c, 'DUELO', ['Alguém está ferido demais para lutar.']); return true }
    if (aposta > p.ryo || aposta > q.ryo) { await panel(c, 'DUELO', ['A aposta é maior que o dinheiro de um dos dois.']); return true }
    pending.set(tk, { de: c.senderNum, nome: p.name, aposta, exp: Date.now() + 90000, jid: c.sender })
    await c.reply(ui.panel(c.modo, E, 'DESAFIO', [`⚔️ ${p.name} desafiou ${q.name}!`, aposta ? `💰 Aposta: ${aposta} ryo` : '🤝 Sem aposta', `${c.tag(t)} responde .aceitar (90s)`]), [t])
    return true
  }
  if (cmd === 'aceitar') {
    const d = pending.get(c.senderNum)
    if (!d || Date.now() > d.exp) { pending.delete(c.senderNum); await panel(c, 'DUELO', ['Não tens nenhum desafio ativo.']); return true }
    pending.delete(c.senderNum)
    const q = getP(c), p = S.players[d.de]
    if (!p || !q || q.state !== 'ok') return true
    R.regen(p); R.regen(q)
    if (d.aposta > p.ryo || d.aposta > q.ryo) { await panel(c, 'DUELO', ['Alguém já não tem dinheiro para a aposta.']); return true }
    const A = R.fighterFromPlayer(p), B = R.fighterFromPlayer(q), res = R.fight(A, B)
    applyFight(p, A); applyFight(q, B)
    const win = res.winner === 'a' ? p : q, lose = win === p ? q : p
    win.wins++; lose.losses++; win.ryo += d.aposta; lose.ryo -= d.aposta
    const xr = R.addXp(win, 40 + lose.lvl * 3); R.addXp(lose, 10); db.save()
    await panel(c, 'DUELO', [...R.shortLog(res.log), `🏆 ${win.name} venceu! 📈 +${xr.gain} xp${d.aposta ? ` · 💰 +${d.aposta}` : ''}`, ...lvlUpLines(xr)])
    return true
  }

  // ───── loja e inventário ─────
  if (cmd === 'loja') {
    const p = await needChar(c); if (!p) return true
    const bySlot = { arma: '🗡️', armadura: '🥼', acessorio: '📿', consumo: '🧪' }
    await panel(c, 'LOJA', [...Object.entries(R.ITENS).map(([id, it]) => `${bySlot[it.slot]} ${id} · ${it.n} · ${it.price} ryo${it.lvl > 1 ? ` (nv ${it.lvl})` : ''}`), `${ui.sc('usa')}: .comprar kunai 1`]); return true
  }
  if (cmd === 'comprar') {
    const p = await needChar(c); if (!p) return true
    const id = norm(args[0]), it = R.ITENS[id], qtd = Math.max(1, Math.min(20, Math.floor(Number(args[1])) || 1))
    if (!it) { await panel(c, 'LOJA', ['Item não encontrado. Vê .loja']); return true }
    if (p.lvl < it.lvl) { await panel(c, 'LOJA', [`Precisas de nível ${it.lvl}.`]); return true }
    const total = it.price * qtd
    if (p.ryo < total) { await panel(c, 'LOJA', [`Custa ${total} ryo. Tens ${p.ryo}.`]); return true }
    p.ryo -= total; p.inv[id] = (p.inv[id] || 0) + qtd; db.save()
    await panel(c, 'LOJA', [`✅ ${qtd}x ${it.n}`, `💰 -${total} ryo`, it.slot === 'consumo' ? `${ui.sc('usa')}: .usar ${id}` : `${ui.sc('equipa')}: .equipar ${id}`]); return true
  }
  if (cmd === 'inventario') {
    const p = await needChar(c); if (!p) return true
    const items = Object.entries(p.inv).filter(([, n]) => n > 0).map(([id, n]) => `${R.ITENS[id] ? R.ITENS[id].n : id} x${n}`)
    await panel(c, 'INVENTÁRIO', [`💰 ${p.ryo} ryo`, ...(items.length ? items : ['vazio · vê .loja'])]); return true
  }
  if (cmd === 'equipar') {
    const p = await needChar(c); if (!p) return true
    const id = norm(args[0]), it = R.ITENS[id]
    if (!it || it.slot === 'consumo') { await panel(c, 'EQUIPAR', [`${ui.sc('uso')}: .equipar kunai`]); return true }
    if (!(p.inv[id] > 0)) { await panel(c, 'EQUIPAR', ['Não tens esse item. Vê .loja']); return true }
    p.equip[it.slot] = id; db.save(); await panel(c, 'EQUIPAR', [`✅ ${it.n} equipado`]); return true
  }
  if (cmd === 'usar') {
    const p = await needChar(c); if (!p) return true
    const id = norm(args[0]), it = R.ITENS[id], e = R.eff(p)
    if (!it || it.slot !== 'consumo') { await panel(c, 'USAR', [`${ui.sc('uso')}: .usar pilula | pergaminho`]); return true }
    if (!(p.inv[id] > 0)) { await panel(c, 'USAR', ['Não tens esse item.']); return true }
    p.inv[id]--; if (it.ck) p.ck = Math.min(e.ckMax, p.ck + it.ck); if (it.hpPct) p.hp = Math.min(e.hpMax, p.hp + e.hpMax * it.hpPct); db.save()
    await panel(c, 'USAR', [`✅ ${it.n}`, `❤️ ${r0(p.hp)}/${r0(e.hpMax)} · 🔷 ${r0(p.ck)}/${r0(e.ckMax)}`]); return true
  }

  // ───── ranking e reset ─────
  if (cmd === 'rankrpg') {
    const top = Object.values(S.players).filter(x => x.state === 'ok').sort((a, b) => b.lvl - a.lvl || b.xp - a.xp).slice(0, 10)
    if (!top.length) { await panel(c, 'RANKING', ['Ainda ninguém criou personagem.']); return true }
    await panel(c, 'RANKING', top.map((x, i) => `${['🥇', '🥈', '🥉'][i] || (i + 1) + '.'} ${x.name} · ${R.rankOf(x.lvl).e} nv ${x.lvl} · 🏆${x.wins}`)); return true
  }
  if (cmd === 'excluirchar') {
    const p = getP(c); if (!p) { await panel(c, 'RPG', ['Não tens personagem.']); return true }
    await confirm.ask(c, { action: 'APAGAR PERSONAGEM' }, async () => { delete S.players[c.senderNum]; db.save(); await panel(c, 'RPG', ['🗑️ Personagem apagado.']) })
    return true
  }
  return false
}
module.exports = { run }
