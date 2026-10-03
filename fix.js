const fs=require('fs')
let code=fs.readFileSync('index.js','utf8')
if(!code.includes('SESSION_ID')){
  let patch = `
const SESSION_ID=process.env.SESSION_ID
if(SESSION_ID){
  try{
    const dir='./auth'
    if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true})
    const data=JSON.parse(Buffer.from(SESSION_ID,'base64').toString())
    for(const k in data) fs.writeFileSync(dir+'/'+k, data[k])
    console.log('✅ Sessao Koyeb restaurada em./auth')
  }catch(e){ console.log('Erro SESSION_ID', e.message) }
}
`
  code = code.replace(/const fs=require/, patch + "\nconst fs2=require")
  code = code.replace("const fs2=require", "const fs=require")
  // se nao achou, so adiciona no topo
  if(!code.includes('Sessao Koyeb')){
    code = patch + "\n" + code
  }
  fs.writeFileSync('index.js', code)
  console.log('✅ index.js fixado pra pasta auth')
}else{
  console.log('✅ ja tem SESSION_ID')
}
