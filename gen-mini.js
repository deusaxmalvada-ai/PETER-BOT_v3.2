const fs=require('fs')
let p='./auth'
let files=fs.readdirSync(p).filter(f=>f.endsWith('.json'))
console.log('JSONs na auth:', files)
let o={}
files.forEach(f=>{
  o[f]=fs.readFileSync(p+'/'+f,'utf8')
})
// So creds.json basta
if(o['creds.json']){
  let mini={ 'creds.json': o['creds.json'] }
  const b64=Buffer.from(JSON.stringify(mini)).toString('base64')
  fs.writeFileSync('SESSION_MINI.txt', b64)
  console.log('✅ MINI gerado:', b64.length, 'chars (so creds.json)')
  console.log('Tamanho ideal pro Koyeb!')
}else{
  console.log('❌ creds.json nao achado, mostrando o que tem:')
  console.log(files.slice(0,10))
}
