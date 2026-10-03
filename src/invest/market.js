'use strict'
// SIMULADOR DE INVESTIMENTO (dinheiro virtual, mercado fictício) + calculadoras reais.
const db = require('../db')
const TICK = 5 * 60e3
const ASSETS = {
  RF: { n: 'Renda Fixa', e: '🏦', risk: 1, vol: 0.0003, drift: 0.00002, p0: 100 },
  IMO: { n: 'Imobiliário', e: '🏠', risk: 2, vol: 0.0015, drift: 0.00003, p0: 250 },
  OURO: { n: 'Ouro', e: '🥇', risk: 2, vol: 0.002, drift: 0.00001, p0: 180 },
  ACAO: { n: 'Ações', e: '📈', risk: 3, vol: 0.004, drift: 0.00005, p0: 50 },
  CRIPTO: { n: 'Cripto', e: '🪙', risk: 5, vol: 0.01, drift: 0.00008, p0: 30 },
  STARTUP: { n: 'Startups', e: '🚀', risk: 5, vol: 0.02, drift: 0.0001, p0: 10 }
}
const randn = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())
const money = x => { const [i, d] = Math.abs(x).toFixed(2).split('.'); return (x < 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + d }

function market(now = Date.now()) {
  let m = db.data.market
  if (!m) { m = db.data.market = { t: now, prices: {}, ref: {}, refT: now, news: [] }; for (const k in ASSETS) { m.prices[k] = ASSETS[k].p0; m.ref[k] = ASSETS[k].p0 } }
  const ticks = Math.min(Math.floor((now - m.t) / TICK), 2000)
  for (let i = 0; i < ticks; i++) {
    for (const k in ASSETS) {
      const a = ASSETS[k]
      m.prices[k] = Math.max(0.01, m.prices[k] * (1 + a.drift + a.vol * randn()))
      if (k === 'STARTUP') {
        if (Math.random() < 0.0004) { m.prices[k] *= 0.3; addNews(m, now, '🚀 Várias startups faliram: Startups −70%') }
        else if (Math.random() < 0.0004) { m.prices[k] *= 1.8; addNews(m, now, '🚀 Uma startup virou unicórnio: Startups +80%') }
      }
    }
    if (Math.random() < 0.004) {
      const crash = Math.random() < 0.5, f = crash ? 1 - (0.05 + Math.random() * 0.1) : 1 + (0.04 + Math.random() * 0.08)
      for (const k in ASSETS) if (ASSETS[k].risk >= 3) m.prices[k] *= f
      addNews(m, now, crash ? `📉 Pânico no mercado: ativos de risco ${Math.round((f - 1) * 100)}%` : `📈 Otimismo geral: ativos de risco +${Math.round((f - 1) * 100)}%`)
    }
  }
  if (ticks) m.t += ticks * TICK
  if (now - m.refT > 24 * 3600e3) { m.ref = { ...m.prices }; m.refT = now }
  if (ticks) db.save()
  return m
}
function addNews(m, now, text) { m.news.unshift({ t: now, text }); if (m.news.length > 15) m.news.pop() }
const change24 = (m, k) => (m.prices[k] / m.ref[k] - 1) * 100

// ───── carteira ─────
const START = 10000
function acct(num) {
  const all = db.data.inv || (db.data.inv = {})
  if (!all[num]) all[num] = { cash: START, pos: {}, t: Date.now(), trades: 0 }
  return all[num]
}
const FEE = 0.005
function buy(a, m, k, amount) {
  if (!ASSETS[k]) return { err: 'Ativo inválido.' }
  if (!(amount > 0)) return { err: 'Valor inválido.' }
  if (amount > a.cash + 1e-9) return { err: `Saldo insuficiente (${money(a.cash)}).` }
  const net = amount * (1 - FEE), qty = net / m.prices[k]
  a.cash -= amount
  const p = a.pos[k] || (a.pos[k] = { qty: 0, cost: 0 })
  p.qty += qty; p.cost += amount; a.trades++
  return { qty, fee: amount * FEE }
}
function sell(a, m, k, amount) {
  const p = a.pos[k]
  if (!ASSETS[k]) return { err: 'Ativo inválido.' }
  if (!p || p.qty <= 0) return { err: 'Não tens esse ativo.' }
  const value = p.qty * m.prices[k]
  const gross = amount === 'tudo' ? value : Math.min(amount, value)
  if (!(gross > 0)) return { err: 'Valor inválido.' }
  const frac = gross / value, net = gross * (1 - FEE)
  const costOut = p.cost * frac
  p.qty -= p.qty * frac; p.cost -= costOut; a.cash += net; a.trades++
  if (p.qty < 1e-9) delete a.pos[k]
  return { net, fee: gross * FEE, pl: net - costOut }
}
function summary(a, m) {
  let invested = 0, value = 0, riskW = 0
  const rows = []
  for (const k in a.pos) { const v = a.pos[k].qty * m.prices[k]; value += v; invested += a.pos[k].cost; rows.push({ k, v, pl: v - a.pos[k].cost, plPct: (v / a.pos[k].cost - 1) * 100 }); riskW += v * ASSETS[k].risk }
  const total = a.cash + value
  const risk = value > 0 ? riskW / value : 0
  const top = rows.sort((x, y) => y.v - x.v)[0]
  return { rows, value, invested, total, risk, conc: top && value > 0 ? top.v / value : 0, topK: top && top.k, retPct: (total / START - 1) * 100 }
}
const riskLabel = r => (r === 0 ? 'sem posições' : r < 1.6 ? 'conservador' : r < 2.8 ? 'moderado' : r < 4 ? 'arrojado' : 'muito arriscado')
const stars = n => '⭐'.repeat(n)

// ───── calculadoras ─────
const num = s => Number(String(s).replace(/\./g, m => m).replace(',', '.'))
function juros(capital, taxaMes, meses, aporte = 0) {
  const i = taxaMes / 100, g = Math.pow(1 + i, meses)
  const fv = capital * g + (i === 0 ? aporte * meses : aporte * ((g - 1) / i))
  const investido = capital + aporte * meses
  return { fv, investido, ganho: fv - investido }
}
function risco(capital, riscoPct, entrada, stop, alvo) {
  const perUnit = Math.abs(entrada - stop)
  if (!(perUnit > 0)) return { err: 'A entrada e o stop não podem ser iguais.' }
  const risco$ = capital * riscoPct / 100, qty = risco$ / perUnit, posicao = qty * entrada
  const rr = alvo ? Math.abs(alvo - entrada) / perUnit : null
  return { risco$, qty, posicao, rr, ganho: alvo ? qty * Math.abs(alvo - entrada) : null, alavancado: posicao > capital }
}
function meta(capital, alvo, taxaMes) {
  if (!(capital > 0 && alvo > capital && taxaMes > 0)) return { err: 'Usa valores positivos com alvo maior que o capital.' }
  return { meses: Math.ceil(Math.log(alvo / capital) / Math.log(1 + taxaMes / 100)) }
}
module.exports = { ASSETS, START, FEE, market, change24, acct, buy, sell, summary, riskLabel, stars, juros, risco, meta, money, num }
