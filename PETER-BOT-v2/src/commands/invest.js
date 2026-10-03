'use strict'
// VIP + SIMULADOR DE INVESTIMENTO (dinheiro virtual). Não movimenta dinheiro real nem recomenda ativos.
const ui = require('../ui')
const db = require('../db')
const C = require('../ctx')
const G = require('../guards')
const M = require('../invest/market')

const E = '💹'
const vips = () => (db.data.vips || (db.data.vips = {}))
const isVip = c => c.isOwner || !!vips()[c.senderNum]
const panel = (c, title, lines) => c.reply(ui.panel(c.modo, E, title, lines))
const AVISO = `🎓 ${ui.sc('simulador · dinheiro virtual · não é recomendação')}`
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
const keyOf = s => { const a = norm(s).toUpperCase(); return M.ASSETS[a] ? a : Object.keys(M.ASSETS).find(k => norm(M.ASSETS[k].n).toUpperCase().startsWith(a) && a.length >= 3) }

async function lock(c) { await c.reply(ui.panel(c.modo, '🔒', 'VIP', ['Recurso exclusivo para VIP.', 'Pede ao criador para te liberar.'])); }

async function run(c) {
  const { cmd, args } = c

  // ───── gestão de VIP (só o dono) ─────
  if (cmd === 'vip') {
    const sub = norm(args[0])
    if (sub === 'add' || sub === 'del') {
      if (!(await G.owner(c))) return true
      const t = C.target({ ...c, args: args.slice(1) })
      if (!t) { await panel(c, 'VIP', [`${ui.sc('uso')}: .vip ${sub} @pessoa`]); return true }
      const n = C.num(t)
      if (sub === 'add') vips()[n] = { desde: Date.now(), por: c.senderNum }; else delete vips()[n]
      db.save()
      await c.reply(ui.ok(c.modo, [`💎 ${c.tag(t)} ${sub === 'add' ? 'agora é VIP' : 'deixou de ser VIP'}`]), [t])
      return true
    }
    await panel(c, 'VIP', [isVip(c) ? '💎 Tens acesso VIP.' : '🔒 Não és VIP.', `${ui.sc('menu')}: .menu7`])
    return true
  }
  if (cmd === 'vips') {
    if (!(await G.owner(c))) return true
    const list = Object.keys(vips())
    await c.reply(ui.panel(c.modo, '💎', 'VIPS', list.length ? list.map(n => `💎 @${n}`) : ['Nenhum VIP ainda.']), list.map(n => n + '@s.whatsapp.net'))
    return true
  }

  if (cmd !== 'inv') return false
  if (!isVip(c)) { await lock(c); return true }

  const sub = norm(args[0]), a = M.acct(c.senderNum), m = M.market()

  if (!sub || sub === 'ajuda') {
    await panel(c, 'INVESTIMENTO', ['.inv mercado · preços e risco', '.inv carteira · teu saldo e risco', '.inv comprar ACAO 2000', '.inv vender ACAO 1000 | tudo', '.inv noticias · eventos do mercado', '.inv rank · ranking dos VIP', '.inv calc juros|risco|meta', '.inv resetar', AVISO])
    return true
  }
  if (sub === 'mercado') {
    const lines = Object.keys(M.ASSETS).map(k => { const ch = M.change24(m, k), as = M.ASSETS[k]; return `${as.e} ${k} · ${M.money(m.prices[k])} · ${ch >= 0 ? '▲' : '▼'}${Math.abs(ch).toFixed(1)}% · ${M.stars(as.risk)}` })
    await panel(c, 'MERCADO', [...lines, '⭐ = nível de risco (1 a 5)', AVISO]); return true
  }
  if (sub === 'carteira') {
    const s = M.summary(a, m)
    const lines = [`💵 ${ui.sc('saldo')}: ${M.money(a.cash)}`, ...s.rows.map(r => `${M.ASSETS[r.k].e} ${r.k} · ${M.money(r.v)} · ${r.pl >= 0 ? '+' : ''}${r.plPct.toFixed(1)}%`), `💼 ${ui.sc('total')}: ${M.money(s.total)} (${s.retPct >= 0 ? '+' : ''}${s.retPct.toFixed(1)}%)`, `⚖️ ${ui.sc('perfil')}: ${M.riskLabel(s.risk)}`]
    if (s.conc > 0.6) lines.push(`⚠️ ${Math.round(s.conc * 100)}% concentrado em ${s.topK}: diversifica`)
    lines.push(AVISO); await panel(c, 'CARTEIRA', lines); return true
  }
  if (sub === 'comprar' || sub === 'vender') {
    const k = keyOf(args[1])
    if (!k) { await panel(c, 'INVESTIMENTO', [`Ativo inválido. Vê .inv mercado`, `${ui.sc('uso')}: .inv ${sub} ACAO ${sub === 'comprar' ? '2000' : '1000 | tudo'}`]); return true }
    const raw = norm(args[2]), amount = raw === 'tudo' ? 'tudo' : M.num(raw)
    if (sub === 'comprar') {
      const r = M.buy(a, m, k, amount === 'tudo' ? a.cash : amount)
      if (r.err) { await panel(c, 'COMPRA', [r.err]); return true }
      db.save(); await panel(c, 'COMPRA', [`✅ ${M.ASSETS[k].e} ${k}`, `🛒 ${M.money(r.qty)} un a ${M.money(m.prices[k])}`, `🧾 taxa ${M.money(r.fee)} (${M.FEE * 100}%)`, `💵 saldo ${M.money(a.cash)}`]); return true
    }
    const r = M.sell(a, m, k, amount)
    if (r.err) { await panel(c, 'VENDA', [r.err]); return true }
    db.save(); await panel(c, 'VENDA', [`✅ ${M.ASSETS[k].e} ${k}`, `💰 recebido ${M.money(r.net)}`, `${r.pl >= 0 ? '📈' : '📉'} resultado ${r.pl >= 0 ? '+' : ''}${M.money(r.pl)}`, `💵 saldo ${M.money(a.cash)}`]); return true
  }
  if (sub === 'noticias') {
    const n = m.news.slice(0, 6)
    await panel(c, 'NOTÍCIAS', n.length ? n.map(x => x.text) : ['Sem eventos recentes.']); return true
  }
  if (sub === 'rank') {
    const rows = Object.entries(db.data.inv || {}).map(([n, ac]) => ({ n, s: M.summary(ac, m) })).sort((x, y) => y.s.total - x.s.total).slice(0, 10)
    await c.reply(ui.panel(c.modo, E, 'RANKING VIP', rows.map((r, i) => `${['🥇', '🥈', '🥉'][i] || (i + 1) + '.'} @${r.n} · ${M.money(r.s.total)} (${r.s.retPct >= 0 ? '+' : ''}${r.s.retPct.toFixed(1)}%)`)), rows.map(r => r.n + '@s.whatsapp.net'))
    return true
  }
  if (sub === 'resetar') {
    delete db.data.inv[c.senderNum]; db.save(); await panel(c, 'INVESTIMENTO', [`🔄 Simulação reiniciada com ${M.money(M.START)}.`]); return true
  }
  if (sub === 'calc') {
    const t = norm(args[1]), n = args.slice(2).map(M.num)
    if (t === 'juros') {
      if (n.length < 3 || n.slice(0, 3).some(isNaN)) { await panel(c, 'JUROS COMPOSTOS', [`${ui.sc('uso')}: .inv calc juros capital taxa%/mês meses [aporte/mês]`, 'ex: .inv calc juros 1000 1 12 100']); return true }
      const r = M.juros(n[0], n[1], n[2], n[3] || 0)
      await panel(c, 'JUROS COMPOSTOS', [`💰 ${ui.sc('final')}: ${M.money(r.fv)}`, `📥 ${ui.sc('investido')}: ${M.money(r.investido)}`, `📈 ${ui.sc('ganho')}: ${M.money(r.ganho)}`, '🎓 taxas e impostos reais mudam o resultado']); return true
    }
    if (t === 'risco') {
      if (n.length < 4 || n.slice(0, 4).some(isNaN)) { await panel(c, 'TAMANHO DA POSIÇÃO', [`${ui.sc('uso')}: .inv calc risco capital risco% entrada stop [alvo]`, 'ex: .inv calc risco 5000 1 20 18 26']); return true }
      const r = M.risco(n[0], n[1], n[2], n[3], n[4])
      if (r.err) { await panel(c, 'TAMANHO DA POSIÇÃO', [r.err]); return true }
      const lines = [`⚠️ ${ui.sc('risco máx')}: ${M.money(r.risco$)}`, `🛒 ${ui.sc('quantidade')}: ${M.money(r.qty)}`, `💼 ${ui.sc('posição')}: ${M.money(r.posicao)}`]
      if (r.rr != null) lines.push(`⚖️ ${ui.sc('risco/retorno')}: 1:${r.rr.toFixed(2)} · ganho ${M.money(r.ganho)}`)
      if (r.alavancado) lines.push('🚨 a posição é maior que o teu capital (alavancagem)')
      await panel(c, 'TAMANHO DA POSIÇÃO', lines); return true
    }
    if (t === 'meta') {
      if (n.length < 3 || n.slice(0, 3).some(isNaN)) { await panel(c, 'META', [`${ui.sc('uso')}: .inv calc meta capital alvo taxa%/mês`, 'ex: .inv calc meta 1000 5000 1.5']); return true }
      const r = M.meta(n[0], n[1], n[2])
      if (r.err) { await panel(c, 'META', [r.err]); return true }
      await panel(c, 'META', [`⏳ ~${r.meses} meses (${(r.meses / 12).toFixed(1)} anos)`, 'sem aportes, taxa constante (irreal)']); return true
    }
    await panel(c, 'CALCULADORAS', ['.inv calc juros capital taxa meses [aporte]', '.inv calc risco capital risco% entrada stop [alvo]', '.inv calc meta capital alvo taxa']); return true
  }
  await panel(c, 'INVESTIMENTO', ['Comando desconhecido. Usa .inv']); return true
}
module.exports = { run }
