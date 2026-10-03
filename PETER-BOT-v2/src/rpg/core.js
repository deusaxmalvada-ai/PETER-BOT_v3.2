'use strict'
// RPG NINJA · dados e regras (funções puras, fáceis de testar)
const rnd = (a, b) => a + Math.random() * (b - a)
const ri = (a, b) => Math.floor(rnd(a, b + 1))
const pick = a => a[Math.floor(Math.random() * a.length)]
const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

const NATS = { fogo: { n: 'Fogo', e: '🔥' }, agua: { n: 'Água', e: '💧' }, terra: { n: 'Terra', e: '🪨' }, vento: { n: 'Vento', e: '🌪️' }, raio: { n: 'Raio', e: '⚡' } }
const ALDEIAS = {
  konoha: { n: 'Konoha', e: '🍃', d: '+5% de XP', b: {}, xp: 0.05 },
  suna: { n: 'Suna', e: '🏜️', d: '+2 vel · +1 def', b: { vel: 2, def: 1 } },
  kiri: { n: 'Kiri', e: '🌫️', d: '+15 HP', b: { hpMax: 15 } },
  kumo: { n: 'Kumo', e: '⛈️', d: '+2 ataque', b: { atk: 2 } },
  iwa: { n: 'Iwa', e: '⛰️', d: '+3 defesa', b: { def: 3 } }
}
const CLAS = {
  uchiha: { n: 'Uchiha', e: '👁️', d: 'crítico +15% · fogo/raio', b: { nin: 3, vel: 2 }, g: { nin: 0.4 }, nat: ['fogo', 'raio'], crit: 0.15 },
  hyuga: { n: 'Hyuga', e: '⚪', d: 'golpes que furam defesa · natureza livre', b: { def: 3, atk: 2 }, g: { atk: 0.3 }, nat: null, crit: 0 },
  uzumaki: { n: 'Uzumaki', e: '🌀', d: 'chakra enorme · água/vento', b: { ckMax: 40, hpMax: 20 }, g: { ckMax: 2 }, nat: ['agua', 'vento'], crit: 0 },
  nara: { n: 'Nara', e: '🦌', d: 'sombras que paralisam · terra', b: { nin: 2, def: 1 }, g: { nin: 0.3 }, nat: ['terra'], crit: 0 },
  akimichi: { n: 'Akimichi', e: '🍙', d: 'força e vida · terra/fogo', b: { hpMax: 50, atk: 4, vel: -1 }, g: { hpMax: 3 }, nat: ['terra', 'fogo'], crit: 0 },
  aburame: { n: 'Aburame', e: '🐛', d: 'insetos que queimam chakra · terra/vento', b: { nin: 2, def: 1 }, g: { def: 0.3 }, nat: ['terra', 'vento'], crit: 0 },
  inuzuka: { n: 'Inuzuka', e: '🐕', d: 'velocidade feroz · natureza livre', b: { atk: 3, vel: 3 }, g: { vel: 0.4 }, nat: null, crit: 0.05 },
  civil: { n: 'Sem clã', e: '🥷', d: '+10% de XP · natureza livre', b: {}, g: {}, nat: null, crit: 0, xp: 0.10 }
}
// t: nin | tai · pow: poder · ck: custo · lvl: nível mínimo · buy: preço (precisa aprender) · fx: burn | stun | pierce
const JUTSUS = [
  { id: 'soco', n: 'Soco Firme', t: 'tai', pow: 12, ck: 0, lvl: 1 },
  { id: 'kunai', n: 'Arremesso de Kunai', t: 'tai', pow: 17, ck: 4, lvl: 3 },
  { id: 'shuriken', n: 'Chuva de Shuriken', t: 'tai', pow: 34, ck: 14, lvl: 8, buy: 700 },
  { id: 'rasengan', n: 'Rasengan', t: 'nin', pow: 62, ck: 35, lvl: 12, buy: 1800 },
  { id: 'katon1', n: 'Bola de Fogo', t: 'nin', pow: 25, ck: 10, lvl: 1, nat: 'fogo' },
  { id: 'katon2', n: 'Grande Bola de Fogo', t: 'nin', pow: 44, ck: 24, lvl: 10, nat: 'fogo', fx: 'burn' },
  { id: 'katon3', n: 'Fênix de Fogo', t: 'nin', pow: 70, ck: 42, lvl: 25, nat: 'fogo', fx: 'burn' },
  { id: 'suiton1', n: "Bala d'Água", t: 'nin', pow: 24, ck: 10, lvl: 1, nat: 'agua' },
  { id: 'suiton2', n: "Dragão d'Água", t: 'nin', pow: 45, ck: 25, lvl: 10, nat: 'agua' },
  { id: 'suiton3', n: 'Grande Onda', t: 'nin', pow: 72, ck: 44, lvl: 25, nat: 'agua', fx: 'stun' },
  { id: 'doton1', n: 'Lança de Pedra', t: 'nin', pow: 26, ck: 10, lvl: 1, nat: 'terra' },
  { id: 'doton2', n: 'Golpe de Rocha', t: 'nin', pow: 46, ck: 26, lvl: 10, nat: 'terra' },
  { id: 'doton3', n: 'Colosso de Pedra', t: 'nin', pow: 74, ck: 44, lvl: 25, nat: 'terra', fx: 'stun' },
  { id: 'fuuton1', n: 'Lâmina de Vento', t: 'nin', pow: 27, ck: 11, lvl: 1, nat: 'vento' },
  { id: 'fuuton2', n: 'Grande Rajada', t: 'nin', pow: 47, ck: 26, lvl: 10, nat: 'vento', fx: 'pierce' },
  { id: 'fuuton3', n: 'Tempestade Cortante', t: 'nin', pow: 76, ck: 45, lvl: 25, nat: 'vento', fx: 'pierce' },
  { id: 'raiton1', n: 'Descarga Elétrica', t: 'nin', pow: 26, ck: 10, lvl: 1, nat: 'raio' },
  { id: 'raiton2', n: 'Lança de Raio', t: 'nin', pow: 46, ck: 25, lvl: 10, nat: 'raio', fx: 'stun' },
  { id: 'raiton3', n: 'Relâmpago Cortante', t: 'nin', pow: 78, ck: 46, lvl: 25, nat: 'raio', fx: 'pierce' },
  { id: 'ilusao', n: 'Ilusão Visual', t: 'nin', pow: 38, ck: 18, lvl: 6, cla: 'uchiha', fx: 'stun' },
  { id: 'chamasnegras', n: 'Chamas Negras', t: 'nin', pow: 92, ck: 55, lvl: 30, cla: 'uchiha', fx: 'burn' },
  { id: 'juuken', n: 'Punho Gentil', t: 'tai', pow: 42, ck: 15, lvl: 5, cla: 'hyuga', fx: 'pierce' },
  { id: 'trigramas', n: 'Palma das 64 Trigramas', t: 'tai', pow: 78, ck: 38, lvl: 20, cla: 'hyuga', fx: 'pierce' },
  { id: 'clones', n: 'Clones das Sombras', t: 'nin', pow: 40, ck: 26, lvl: 6, cla: 'uzumaki' },
  { id: 'selo', n: 'Selo de Chakra', t: 'nin', pow: 70, ck: 34, lvl: 22, cla: 'uzumaki', fx: 'stun' },
  { id: 'sombras', n: 'Prisão de Sombras', t: 'nin', pow: 22, ck: 16, lvl: 6, cla: 'nara', fx: 'stun' },
  { id: 'tanque', n: 'Tanque Humano', t: 'tai', pow: 55, ck: 20, lvl: 6, cla: 'akimichi' },
  { id: 'insetos', n: 'Insetos Parasitas', t: 'nin', pow: 30, ck: 14, lvl: 6, cla: 'aburame', fx: 'burn' },
  { id: 'presa', n: 'Presa Perfurante', t: 'tai', pow: 48, ck: 16, lvl: 6, cla: 'inuzuka' }
]
const JBY = Object.fromEntries(JUTSUS.map(j => [j.id, j]))

const ITENS = {
  kunai: { n: 'Kunai Afiada', slot: 'arma', price: 150, lvl: 1, b: { atk: 2 } },
  katana: { n: 'Katana', slot: 'arma', price: 900, lvl: 8, b: { atk: 6 } },
  lamina: { n: 'Lâmina de Chakra', slot: 'arma', price: 4500, lvl: 25, b: { atk: 12, nin: 4 } },
  colete: { n: 'Colete Tático', slot: 'armadura', price: 300, lvl: 1, b: { def: 3 } },
  armadura: { n: 'Armadura Jounin', slot: 'armadura', price: 2000, lvl: 20, b: { def: 9, hpMax: 20 } },
  bandana: { n: 'Bandana Ninja', slot: 'acessorio', price: 200, lvl: 1, b: { vel: 1 } },
  amuleto: { n: 'Amuleto de Chakra', slot: 'acessorio', price: 1500, lvl: 12, b: { ckMax: 40 } },
  pilula: { n: 'Pílula de Chakra', slot: 'consumo', price: 120, lvl: 1, ck: 50 },
  pergaminho: { n: 'Pergaminho Médico', slot: 'consumo', price: 180, lvl: 1, hpPct: 0.5 }
}

const RANKS = [[1, 'Estudante', '📘'], [5, 'Genin', '🥋'], [15, 'Chunin', '🦺'], [30, 'Jounin', '🎖️'], [50, 'ANBU', '🎭'], [70, 'Sannin', '🐍'], [90, 'Kage', '👑']]
const rankOf = lvl => { let r = RANKS[0]; for (const x of RANKS) if (lvl >= x[0]) r = x; return { n: r[1], e: r[2] } }
const xpNeed = lvl => Math.round(60 * Math.pow(lvl, 1.55))

const MISSOES = {
  D: { minLvl: 1, lv: [-1, 0], ryo: [60, 120], xp: [35, 60], nomes: ['Capturar o gato fugitivo', 'Entregar pergaminhos na vila', 'Limpar o campo de treino', 'Escoltar um comerciante', 'Apanhar ervas medicinais'] },
  C: { minLvl: 5, lv: [-1, 1], ryo: [150, 300], xp: [70, 120], nomes: ['Proteger a ponte em construção', 'Caçar bandidos na estrada', 'Recuperar uma encomenda roubada', 'Vigiar a fronteira'] },
  B: { minLvl: 15, lv: [0, 2], ryo: [350, 650], xp: [140, 230], nomes: ['Infiltrar o esconderijo rival', 'Capturar um ninja desertor', 'Defender a aldeia vizinha'] },
  A: { minLvl: 30, lv: [1, 4], ryo: [800, 1500], xp: [280, 450], nomes: ['Eliminar um criminoso classe A', 'Escoltar o líder do clã', 'Selar uma besta de chakra'] },
  S: { minLvl: 50, lv: [3, 7], ryo: [2200, 4000], xp: [600, 1000], nomes: ['Enfrentar uma organização sombria', 'Deter uma besta caudal', 'Missão proibida do Kage'] }
}
const INIMIGOS = ['Ladrão Renegado', 'Ninja Desertor', 'Marionetista Rival', 'Besta Selvagem', 'Assassino da Névoa', 'Mercenário Sombrio', 'Espadachim Errante', 'Ninja Médico Renegado']

// ───── personagem ─────
function newPlayer(name, id) {
  return { id, name, state: 'aldeia', aldeia: null, cla: null, nat: null, lvl: 1, xp: 0, ryo: 0, hpMax: 100, ckMax: 60, atk: 8, nin: 8, def: 5, vel: 5, hp: 100, ck: 60, known: [], inv: {}, equip: {}, cd: {}, wins: 0, losses: 0, missions: 0, t: Date.now(), tick: Date.now() }
}
function finish(p) {
  const a = ALDEIAS[p.aldeia], c = CLAS[p.cla]
  for (const src of [a.b, c.b]) for (const k in src) p[k] += src[k]
  p.hp = p.hpMax; p.ck = p.ckMax; p.ryo = 300; p.state = 'ok'
}
function bonus(p) {
  const b = { atk: 0, nin: 0, def: 0, vel: 0, hpMax: 0, ckMax: 0 }
  for (const slot of Object.keys(p.equip || {})) { const it = ITENS[p.equip[slot]]; if (it && it.b) for (const k in it.b) b[k] += it.b[k] }
  return b
}
function eff(p) {
  const b = bonus(p)
  return { atk: p.atk + b.atk, nin: p.nin + b.nin, def: p.def + b.def, vel: p.vel + b.vel, hpMax: p.hpMax + b.hpMax, ckMax: p.ckMax + b.ckMax }
}
// regenera com o tempo (1% de HP e 2% de chakra por minuto)
function regen(p, now = Date.now()) {
  const e = eff(p), min = Math.max(0, (now - (p.tick || now)) / 60000)
  p.tick = now
  p.hp = clamp(p.hp + e.hpMax * 0.01 * min, 0, e.hpMax)
  p.ck = clamp(p.ck + e.ckMax * 0.02 * min, 0, e.ckMax)
}
function addXp(p, amount) {
  const mult = 1 + ((ALDEIAS[p.aldeia] || {}).xp || 0) + ((CLAS[p.cla] || {}).xp || 0)
  const gain = Math.round(amount * mult), ups = []
  p.xp += gain
  while (p.xp >= xpNeed(p.lvl)) {
    p.xp -= xpNeed(p.lvl); p.lvl++
    const g = { hpMax: 9, ckMax: 4, atk: 1.1, nin: 1.1, def: 0.7, vel: 0.6 }
    const cg = (CLAS[p.cla] || {}).g || {}
    for (const k in g) p[k] += g[k] + (cg[k] || 0)
    p.hp = eff(p).hpMax; p.ck = eff(p).ckMax
    ups.push(p.lvl)
  }
  return { gain, ups }
}
function knownJutsus(p) {
  return JUTSUS.filter(j => j.lvl <= p.lvl && ((j.nat && j.nat === p.nat) || (j.cla && j.cla === p.cla) || (!j.nat && !j.cla && (!j.buy || (p.known || []).includes(j.id)))))
}

// ───── combate ─────
function fighterFromPlayer(p) {
  const e = eff(p), c = CLAS[p.cla] || {}
  return { name: p.name, hp: Math.max(1, p.hp), hpMax: e.hpMax, ck: p.ck, atk: e.atk, nin: e.nin, def: e.def, vel: e.vel, crit: c.crit || 0, jutsus: knownJutsus(p), hyuga: p.cla === 'hyuga' }
}
function enemyFor(lvl, name) {
  const L = Math.max(1, Math.round(lvl))
  const nat = pick(Object.keys(NATS)), jn = JUTSUS.filter(j => j.nat === nat && j.lvl <= L)
  const js = [JBY.soco, JBY.kunai, ...(jn.length ? [jn[jn.length - 1]] : [])]
  return { name: name || pick(INIMIGOS), lvl: L, hp: 50 + L * 8, hpMax: 50 + L * 8, ck: 60 + L * 4, atk: 5 + L * 0.95, nin: 5 + L * 0.95, def: 3 + L * 0.65, vel: 5 + L * 0.6, crit: 0.04, jutsus: js, isNpc: true }
}
function chooseJutsu(f) {
  const ok = f.jutsus.filter(j => f.ck >= j.ck)
  if (!ok.length) return JBY.soco
  if (Math.random() < 0.2) return pick(ok)
  const score = j => j.pow * (1 + (j.t === 'nin' ? f.nin : f.atk) / 40) * (j.fx === 'stun' ? 1.1 : 1)
  return ok.reduce((b, j) => (score(j) > score(b) ? j : b), ok[0])
}
function hit(att, def, j) {
  const stat = j.t === 'nin' ? att.nin : att.atk
  const pierce = j.fx === 'pierce' || att.hyuga ? 0.65 : 1
  const dr = 100 / (100 + def.def * pierce * 2.2)
  const crit = Math.random() < att.crit + 0.04
  return { dmg: Math.max(1, Math.round(j.pow * (1 + stat / 40) * dr * rnd(0.88, 1.12) * (crit ? 1.6 : 1))), crit }
}
// luta até 10 rondas; devolve vencedor ('a' ou 'b'), estado final e o registo
function fight(a, b, maxR = 10) {
  const log = [], st = { a: { burn: 0, stun: false }, b: { burn: 0, stun: false } }
  let rounds = 0
  for (let r = 1; r <= maxR && a.hp > 0 && b.hp > 0; r++) {
    rounds = r
    const order = a.vel + Math.random() * 4 >= b.vel + Math.random() * 4 ? [['a', a, b], ['b', b, a]] : [['b', b, a], ['a', a, b]]
    for (const [k, att, def] of order) {
      if (att.hp <= 0 || def.hp <= 0) break
      const dk = k === 'a' ? 'b' : 'a'
      if (st[k].burn > 0) { const d = Math.max(1, Math.round(att.hpMax * 0.03)); att.hp -= d; st[k].burn--; log.push(`🔥 ${att.name} queima (-${d})`); if (att.hp <= 0) break }
      if (st[k].stun) { st[k].stun = false; log.push(`💫 ${att.name} está paralisado`); continue }
      const j = chooseJutsu(att); att.ck = Math.max(0, att.ck - j.ck)
      const evade = clamp(0.05 + (def.vel - att.vel) / 120, 0.02, 0.3)
      if (Math.random() < evade) { log.push(`💨 ${def.name} desvia de ${j.n}`) }
      else {
        const h = hit(att, def, j); def.hp -= h.dmg
        log.push(`${h.crit ? '💥' : '⚔️'} ${att.name}: ${j.n} (-${h.dmg})`)
        if (j.fx === 'burn') st[dk].burn = 2
        if (j.fx === 'stun' && Math.random() < 0.35) st[dk].stun = true
      }
      att.ck = Math.min(att.ck + 2, 9999)
    }
  }
  const winner = a.hp <= 0 ? 'b' : b.hp <= 0 ? 'a' : (a.hp / a.hpMax >= b.hp / b.hpMax ? 'a' : 'b')
  a.hp = Math.max(0, a.hp); b.hp = Math.max(0, b.hp)
  return { winner, rounds, log }
}
const shortLog = (log, n = 7) => (log.length <= n ? log : [...log.slice(0, 4), '…', ...log.slice(-(n - 5))])

module.exports = { rnd, ri, pick, clamp, NATS, ALDEIAS, CLAS, JUTSUS, JBY, ITENS, RANKS, MISSOES, rankOf, xpNeed, newPlayer, finish, bonus, eff, regen, addXp, knownJutsus, fighterFromPlayer, enemyFor, fight, shortLog }
