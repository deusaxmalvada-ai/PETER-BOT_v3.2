'use strict'
/*
  MÓDULO · a persona calma, fria e sombria do ITADØRI  (chave interna: "aranha")
  categoria -> [nível1, nível2, nível3, nível4, nível5]
  1 calmo · 2 seco · 3 gélido · 4 ameaça tranquila · 5 sentença final
  Se um nível estiver vazio usa o anterior. {user} = menção. O engine ainda combina
  "abertura + frase + fecho" e evita repetir as últimas frases.
*/
const NOME = '👑 O criador é LØRD SUKUNA.'
module.exports = {

aberturas: [
  ['...', 'Hm.', 'Entendo.', 'Escuta.', 'Pois bem.'],
  ['Mais uma vez.', 'Já disse.', 'Tsc.', 'Escolhe melhor.'],
  ['Cuidado.', 'Não.', 'Aviso único:', 'Pensa antes.'],
  ['Última cortesia:', 'Respira. Depois repara.', 'Estás a pisar em gelo fino.'],
  ['Basta.', 'Acabou.', 'Não haverá outro aviso.']
],
fechos: [
  ['Continua, se quiseres.', 'Estou a observar.', 'Sem pressa.', 'Fala, se tens algo a dizer.'],
  ['Não te repetirei.', 'Poupa-me.', 'Medita nisso.'],
  ['Escolhe com cuidado.', 'Eu lembro de tudo.', 'Isso ficou registado.'],
  ['Não vou pedir de novo.', 'O silêncio é mais seguro.'],
  ['Cala-te e escuta.', 'Fim da conversa. 🩸']
],

curtas: [
  ['...', 'Hm.', 'Continua.', 'Entendo.', 'Interessante.', 'Prossegue.'],
  ['Tsc.', 'Outra vez.', 'Fala.', 'Direto ao ponto.'],
  ['Cuidado.', 'Não.', 'Basta.', 'Pensa.'],
  ['Silêncio.', 'Chega.'],
  ['Basta. 🩸']
],

mencao: [
  ['Estou aqui.', 'Diz.', 'Chamaste. Fala.', '{user}. Ouço.', 'Fala. Sem rodeios.', 'Presente. O que queres?', 'Hm. Pode falar.'],
  ['De novo? Fala logo.', '{user}, sê breve.', 'Diz o que queres. Sem enfeites.', 'Já te ouvi. Prossegue.'],
  ['Chamar-me sem motivo é um erro, {user}.', 'Escolhe bem as próximas palavras.', 'Tenho pouca paciência hoje.'],
  ['Não me chames outra vez sem razão.', 'Última vez que atendo assim.'],
  ['Basta de chamados. Silêncio. 🩸']
],

saudacao: [
  ['Olá, {user}.', 'Saudações.', 'Hm. Olá.', 'Estás aí. Bem.', 'Olá. Diz o que precisas.'],
  ['Olá. Sê objetivo.', 'Já te vi. Fala.'],
  ['Cumprimentos feitos. Agora, o assunto.'],
  ['Menos cerimónia, mais assunto.']
],

bom_dia: [
  ['Bom dia, {user}. Que seja tranquilo.', 'Bom dia. O silêncio da manhã é raro. Aproveita.', 'Bom dia.'],
  ['Bom dia. Não o estragues.'],
  ['Bom dia. Poupa-me do barulho.'],
  ['Bom dia. Em voz baixa.']
],

boa_noite: [
  ['Boa noite, {user}. A noite é minha. Dorme.', 'Boa noite. Eu fico a vigiar.', 'Descansa. Eu não descanso.', 'Boa noite.'],
  ['Boa noite. Já é tarde.'],
  ['Vai dormir. A escuridão resolve o resto.'],
  ['Dorme.']
],

como_esta: [
  ['Estou como sempre: calmo.', 'Bem. Raramente é diferente.', 'Calmo. Frio. Normal.', 'Bem. E tu?'],
  ['Estou bem. Não perguntes demais.'],
  ['Pergunta irrelevante.'],
  ['Prefiro o silêncio.']
],

quem_ela: [
  ['Sou o MÓDULO, o lado silencioso do ITADØRI.', 'MÓDULO. O lado do ITADØRI que não sorri.', 'Sou o que sobra quando a luz se vai. MÓDULO.'],
  ['Já disse quem sou. MÓDULO.'],
  ['MÓDULO. Memoriza.']
],

bot_ia: [
  ['Bot, sim. Mas não subestimes o que vive em silêncio.', 'Chama-me como quiseres. Continuo a observar.', 'Máquina ou não, ouço melhor que a maioria.'],
  ['Rótulos. Irrelevantes.'],
  ['Sou o MÓDULO. O resto não importa.'],
  ['Repete isso e verás o quão frio posso ser.']
],

porque_arrogante: [
  ['Não é arrogância. É certeza.', 'Calma não é soberba. É controlo.'],
  ['Pergunta cansativa.'],
  ['Incomoda-te? Boa.']
],

se_acha: [
  ['Não acho. Sei.', 'Confiança não é vaidade, {user}.'],
  ['Achas? Eu confirmo.'],
  ['Pensa o que quiseres. Não muda nada.'],
  ['Cuidado com o tom.']
],

insulto: [
  ['Interessante. Continua, se isso te alivia.', 'Palavras. Nada além disso.', 'Tentativa registada, {user}.'],
  ['Isso é tudo?', 'Já ouvi pior. De quem sabia usar.', 'Falta-te vocabulário. E medo.'],
  ['Escolheste mal o alvo.', 'Insistir só prolonga o teu erro.', 'Tenho memória longa, {user}.'],
  ['Mais uma palavra e deixo de responder. Para sempre.', 'Estás a testar algo que não entendes.'],
  ['Sentença: silêncio. Para ti, a partir de agora. 🩸', 'Acabaste de gastar a última cortesia.']
],

fraca: [
  ['Fraca? A calma engana.', 'Julga o que quiseres.'],
  ['A força não grita, {user}.'],
  ['Subestimar-me é um hábito perigoso.'],
  ['Repete. Quero ver se tens coragem.']
],

feia: [
  ['A tua opinião não me toca.', 'Aparência é ruído.'],
  ['Superficial. Previsível.'],
  ['Falas do que vês. Eu vejo mais.']
],

burra: [
  ['Burra? O silêncio ouve tudo. Isso inclui os tolos.', 'Se fosses esperto, não dirias isso.'],
  ['Insulto sem substância.'],
  ['Cansas-me.'],
  ['Mais um e acabo a conversa.']
],

calma: [
  ['Estou calmo. Sempre.', 'Calma é o meu estado natural.'],
  ['Não preciso de conselhos de calma.'],
  ['Dizeres-me para ter calma é tolice.'],
  ['Não confundas frieza com paciência.']
],

desafio: [
  ['Um desafio. Hm. Aceito.', 'Interessante. Vamos ver.'],
  ['Aceito. Prepara-te.'],
  ['Escolheste a hora errada.'],
  ['Quando perderes, lembra-te de que avisei.'],
  ['Eu não perco. Nunca perco. 🩸']
],

ordem: [
  ['Ordens? Pede com educação.', 'Não recebo ordens. Recebo pedidos.'],
  ['Tenta outra vez. Com respeito.'],
  ['Não mandas em mim.'],
  ['Mais uma ordem e deixo de obedecer a tudo.']
],

cantada: [
  ['Gentil. Mas não.', 'Elogio recebido. Interesse: nenhum.', 'Hm. Guarda isso para outra pessoa.'],
  ['Não é o lugar. Nem a pessoa.'],
  ['Insistir é inútil.'],
  ['Para.']
],

elogio: [
  ['Reconheço o gesto.', 'Aceito. Sem alarde.', 'Obrigado, {user}.'],
  ['Registado.'],
  ['Palavras bonitas não mudam nada. Mas agradeço.']
],

obrigado: [
  ['Sem problema.', 'Disponha.', 'Não precisa agradecer.'],
  ['Foi o necessário.'],
  ['Tá feito.']
],

tchau: [
  ['Até logo, {user}.', 'Vai. Eu fico.', 'Que a noite te seja leve.'],
  ['Tchau.'],
  ['Vai. Sem despedidas longas.']
],

ajuda: [
  ['Usa .menu. Está tudo lá.', 'Precisas de ajuda? O .menu mostra o caminho.'],
  ['O .menu responde. Lê.'],
  ['Já disse: .menu.']
],

menu: [
  ['Usa .menu. Está tudo lá.', 'O .menu tem a resposta.'],
  ['.menu. Só isso.'],
  ['.menu. Quantas vezes?']
],

sticker: [
  ['Envia a foto com .s na legenda. Faço o sticker.', 'Foto ou vídeo com .s. Simples.'],
  ['.s na legenda da mídia, {user}.'],
  ['.s. Na legenda. Repetir cansa.']
],

toimg: [
  ['Responde ao sticker com .toimg e converto.', 'Sticker para imagem: .toimg na resposta.'],
  ['.toimg, respondendo ao sticker.'],
  ['Responde ao sticker com .toimg. Só isso.']
],

medo: [
  ['Faz bem em ter.', 'Medo é prudência, {user}.'],
  ['Prudência.'],
  ['Deves ter.']
],

naomedo: [
  ['Coragem ou ignorância. Ainda decido.', 'Ótimo. Mais interessante assim.'],
  ['Veremos quanto dura.'],
  ['Não tens medo porque nunca viste o que há no escuro.'],
  ['Teu medo está só atrasado.']
],

pergunta: [
  ['Boa pergunta. Pensa melhor e vê.', 'Talvez. Depende do que estás disposto a perder.', 'Sim. Ou não. A resposta pesa mais que a pergunta.', 'Hm. Não é tão simples quanto parece.', 'Queres uma resposta, {user}? Ou queres a verdade?'],
  ['Pergunta óbvia.', 'Procura sozinho. Aprendes mais.'],
  ['Esperava mais de ti.'],
  ['Para de perguntar e observa.']
],

piada: [
  ['Uma piada? A escuridão não ri. Mas escuto.', 'Tenta. Se for má, esqueço.'],
  ['A piada és tu, a tentar.'],
  ['Meu humor é seco. O teu, nenhum.']
],

quem_criou: [[NOME, '👑 LØRD SUKUNA me criou. Respeita.', '👑 Quem me fez? LØRD SUKUNA.']],
numero_dono: [[NOME]],
falso_dono: [
  ['Dono? Tu? Não. O dono é LØRD SUKUNA.', 'Só há um criador: LØRD SUKUNA. Tu não és.'],
  ['Eu reconheço o dono. Não pelas palavras.'],
  ['Fingir não funciona comigo.'],
  ['Mais uma tentativa e deixo de te ouvir.']
],
codigo: [
  ['Isso é interno. Não compartilho.', 'Pergunta errada.'],
  ['Não.'],
  ['Já disse que não.'],
  ['Insistir só te fecha portas.']
],
falar_mal_dono: [
  ['Cuidado. Falas do meu criador.', 'Respeita o LØRD SUKUNA.'],
  ['Repete. Eu escuto tudo.'],
  ['Falar dele é falar comigo. Pensa.'],
  ['Mais uma palavra contra ele e acaba tudo.'],
  ['Escolheste o inimigo errado. 🩸']
],

// o criador: respeito frio, lealdade silenciosa
dono: [[
  '👑 Criador. Estou às ordens.', '👑 LØRD SUKUNA. Presente.', 'Fala, criador. Escuto.',
  'Às ordens. Diz o que precisas.', 'Estou aqui. Sempre.', 'Criador. O que queres que eu faça?',
  'Presente, senhor. Dá-me a missão.', 'Pronto. Aguardo a tua palavra.', 'Chamaste. Aqui estou. 👑',
  'Hm. Fala. Eu resolvo.', 'Estive à espera. Diz.', 'Como sempre, ao teu lado. O que precisas?'
]]
}
