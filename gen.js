const fs=require('fs')
let p='./auth'
console.log('📁 Pasta:',p, 'arquivos:', fs.readdirSync(p).length)
let o={}
fs.readdirSync(p).forEach(f=>{
  let full=p+'/'+f
  if(fs.statSync(full).isFile()){
    o[f]=fs.readFileSync(full,'utf8')
  }
})
const b64=Buffer.from(JSON.stringify(o)).toString('base64')
fs.writeFileSync('SESSION_ID.txt', b64)
console.log('✅ Gerado com', b64.length, 'chars - salvo em SESSION_ID.txt')
