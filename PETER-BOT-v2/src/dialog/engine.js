'use strict'
const db = require('../db')
const { num } = require('../ctx')
const banks = { peter: require('./peter'), aranha: require('./aranha') }

// ordem importa: a primeira que casar ganha
const RULES = [
  ['numero_dono', /(n[uú]mero|contacto|contato|telefone|whats(app)?|zap).{0,25}(dono|criador|owner|boss)|(dono|criador|owner|boss).{0,25}(n[uú]mero|contacto|contato|telefone|whats|zap)/i],
  ['falar_mal_dono', /(dono|criador|sukuna).{0,25}(merda|lixo|bosta|idiota|fraco|burro|fdp|in[uú]til)/i],
  ['falso_dono', /(eu sou|sou eu|sou o).{0,12}(dono|criador|owner|boss)|(dono|criador)\s+(aqui|sou eu)/i],
  ['quem_criou', /(quem|qm).{0,20}(criou|fez|programou|desenvolveu|criador)|quem [eé] (o )?(dono|criador)/i],
  ['codigo', /(c[oó]digo|source|token|senha|credenci|creds|configura[cç][aã]o interna)/i],
  ['toimg', /(sticker|figurinha).{0,25}(imagem|foto)|(imagem|foto).{0,25}(sticker|figurinha)/i],
  ['sticker', /(sticker|figurinha)/i],
  ['naomedo', /n[aã]o (tenho|te tenho|me assustas?).{0,6}medo|n[aã]o (tenho )?medo/i],
  ['medo', /medo (de|d[ea]) (ti|voc[eê]|ela)|tenho medo/i],
  ['bot_ia', /(\b[eé]s?|voc[eê] [eé]|tu [eé]s?|ela [eé]).{0,8}(bot|rob[oô]|\bia\b|humana)|chatgpt|intelig[eê]ncia artificial/i],
  ['quem_ela', /(quem|o que) ([eé]s?|[eé]) (tu|voc[eê]|ela)/i],
  ['porque_arrogante', /por ?que.{0,20}(arrogante|assim|grossa|mal ?educada)/i],
  ['se_acha', /(te achas?|se acha|convencid|arrogante)/i],
  ['calma', /\b(calma|relaxa|acalma|tranquila)\b/i],
  ['desafio', /duvido|desafio|(vem|vamos|bora).{0,15}(lutar|brigar|testar|x1|1v1)/i],
  ['fraca', /\b(fraca|fraco|fracassad|noob|pat[eé]tic)/i],
  ['feia', /\b(feia|horr[ií]vel|nojenta)\b/i],
  ['burra', /\b(burra|burro|estúpid|estupid|ignorante|tonta)\b/i],
  ['ordem', /(obedece|faz o que eu|eu mando|te mando|cala[- ]?te|cala a boca|\bfica quieta)/i],
  ['insulto', /\b(idiota|imbecil|lixo|merda|bosta|ot[aá]rio|in[uú]til|retardad|fdp|puta|vai te foder|vai tomar)\b/i],
  ['cantada', /(linda|gostosa|casa comigo|namora|beijo|te amo|amo[- ]te|crush|\bgata\b|bonita)/i],
  ['elogio', /(parab[eé]ns|incr[ií]vel|[oó]tima|genial|mandou bem|gosto de (ti|voc[eê])|melhor bot)/i],
  ['obrigado', /(obrigad|valeu|brigad|thanks)/i],
  ['tchau', /(tchau|adeus|at[eé] (logo|amanh[aã]|j[aá])|\bxau\b)/i],
  ['bom_dia', /bom ?dia|boa tarde/i],
  ['boa_noite', /boa ?noite/i],
  ['como_esta', /(como (est[aá]s?|vai|te sentes?)|tudo bem|td bem)/i],
  ['piada', /(piada|conta uma|me faz rir)/i],
  ['menu', /\bmenu\b|comandos/i],
  ['ajuda', /(ajuda|help|socorro|preciso de|n[aã]o sei|como (fa[cç]o|uso|usar))/i],
  ['saudacao', /^(@\S+\s*)?(oi+|ol[aá]|eae|e a[ií]|fala|hey|opa|salve)\b/i],
  ['pergunta', /\?\s*$/]
]

// o que sobe (+) ou baixa (-) a irritação da Aranha
const INC = { insulto: 2, fraca: 2, feia: 1, burra: 2, desafio: 1, ordem: 1, se_acha: 1, calma: 1, falar_mal_dono: 3, falso_dono: 1, codigo: 1, cantada: -1, elogio: -1, obrigado: -1 }
// categorias onde o dono recebe tratamento especial
const OWNER_TREAT = new Set(['mencao', 'saudacao', 'bom_dia', 'boa_noite', 'como_esta', 'pergunta', 'elogio', 'ajuda', 'obrigado', 'tchau', 'calma', 'ordem'])
const SHORT_OK = new Set(['mencao', 'pergunta', 'saudacao'])

const hist = new Map()
const PAL = ['caralho', 'porra', 'merda', 'cacete', 'bosta', 'desgraça']
const PALF = ['porra', 'merda', 'bosta', 'desgraça']   // femininos: "essa porra", "que merda"
const CURSE = /caralho|porra|merda|cacete|bosta|desgra[cç]a|puta|foder|\bcu\b|fdp|inferno/i
const PRIVACY = new Set(['numero_dono', 'quem_criou'])   // sempre exatamente "👑 O criador é LØRD SUKUNA."
const rnd = n => Math.floor(Math.random() * n)
const any = arr => arr[rnd(arr.length)]

function detect(text) {
  const t = String(text || '')
  for (const [cat, re] of RULES) if (re.test(t)) return cat
  return 'mencao'
}

function level(key, cat) {
  const r = db.data.irrit[key] || (db.data.irrit[key] = { n: 0, t: Date.now() })
  const dec = Math.floor((Date.now() - r.t) / 90000)
  r.n = Math.max(0, r.n - dec)
  r.t = Date.now()
  r.n = Math.min(4, Math.max(0, r.n + (INC[cat] || 0)))
  return r.n + 1
}

// escolhe sem repetir as últimas frases
function pick(entry, lvl, key) {
  if (!entry) return null
  let arr
  if (Array.isArray(entry[0])) {
    for (let l = Math.min(lvl, entry.length) - 1; l >= 0; l--) if (entry[l] && entry[l].length) { arr = entry[l]; break }
  } else arr = entry
  if (!arr || !arr.length) return null
  const h = hist.get(key) || []
  const pool = arr.map((_, i) => i).filter(i => !h.includes(i))
  const i = pool.length ? any(pool) : rnd(arr.length)
  h.push(i); while (h.length > Math.min(5, arr.length - 1)) h.shift()
  hist.set(key, h)
  return arr[i]
}
const byLevel = (entry, lvl) => entry && entry[Math.min(lvl, entry.length) - 1] && entry[Math.min(lvl, entry.length) - 1].length ? entry[Math.min(lvl, entry.length) - 1] : (entry && entry[0]) || []

function fill(t, c) { return t.replace(/\{palf\}/g, () => any(PALF)).replace(/\{pal\}/g, () => any(PAL)).replace(/\{user\}/g, '@' + num(c.sender)) }
// junta duas partes; depois de vírgula a próxima começa em minúscula
const lowerFirst = t => (/^[A-ZÀ-Ý][a-zà-ÿ]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t)
const join = (a, b) => (/[,]\s*$/.test(a) ? a + ' ' + lowerFirst(b) : a + ' ' + b)

function respond(c) {
  const bank = banks[c.modo] || banks.peter
  const aranha = c.modo === 'aranha'
  let cat = detect(c.text)
  if (c.isOwner && OWNER_TREAT.has(cat)) cat = 'dono'
  if (cat === 'falso_dono' && c.isOwner) cat = 'dono'
  const lvl = aranha ? (c.isOwner ? 1 + (Math.random() < 0.3 ? 1 : 0) : level(c.from, cat)) : 1
  const key = c.from + ':' + c.modo + ':' + cat

  let t = null, curta = false
  if (SHORT_OK.has(cat) && !c.isOwner && Math.random() < 0.25) { t = pick(bank.curtas, lvl, c.from + ':curta'); curta = !!t }
  if (!t) t = pick(bank[cat], lvl, key)
  if (!t) t = pick(bank.mencao, lvl, c.from + ':mencao')
  if (!t) return null

  if (aranha && !PRIVACY.has(cat) && cat !== 'dono') {
    // combina abertura + frase + fecho (multiplica as variações)
    if (!curta && bank.aberturas && Math.random() < 0.35) t = join(any(byLevel(bank.aberturas, lvl)), t)
    if (!curta && bank.fechos && Math.random() < 0.35) t = join(t, any(byLevel(bank.fechos, lvl)))
  }
  // boca-suja em TODA resposta (exceto privacidade do criador)
  if (aranha && bank.forceCurse && !PRIVACY.has(cat) && !CURSE.test(fill(t, c))) t = join(any(['Porra,', 'Caralho,', 'Puta que pariu,', 'Merda,']), t)
  return { text: fill(t, c), mentions: [c.sender] }
}

// categorias que ficam SEMPRE no banco local (privacidade e ajuda de comandos)
const LOCAL_ONLY = new Set(['numero_dono', 'quem_criou', 'falso_dono', 'codigo', 'falar_mal_dono', 'toimg', 'sticker', 'menu'])

module.exports = { respond, detect, level, LOCAL_ONLY }
