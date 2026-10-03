const fs=require('fs')
let code=fs.readFileSync('index.js','utf8')
if(code.includes('SESSION_MINI')){console.log('ja fixado');process.exit(0)}
// remove patch antigo
code=code.replace(/const SESSION_ID[\s\S]*?Sessao Koyeb[\s\S]*?}\n}/,'')
let patch=`
const fs=require('fs')
const SESSION_ID=process.env.SESSION_ID
if(SESSION_ID){
 try{
  const dir='./auth'; if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true})
  const data=JSON.parse(Buffer.from(SESSION_ID,'base64').toString())
  for(const k in data) fs.writeFileSync(dir+'/'+k, data[k])
  console.log('✅ Sessao Koyeb MINI restaurada')
 }catch(e){ console.log('Erro SESSION_ID', e.message) }
}
`
// adiciona no topo
fs.writeFileSync('index.js', patch + "\n" + code.replace(/const fs=require.*\n/,''))
console.log('✅ index.js fixado pro MINI')
