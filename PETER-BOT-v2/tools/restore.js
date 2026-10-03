// repõe os teus números no config.js novo
const fs = require('fs')
const k = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), f = process.argv[3]
let s = fs.readFileSync(f, 'utf8')
if (Array.isArray(k.o) && k.o.length) s = s.replace(/OWNER_NUMBERS:\s*\[[^\]]*\]/, 'OWNER_NUMBERS: ' + JSON.stringify(k.o).replace(/"/g, "'"))
if (k.p) s = s.replace(/PAIRING_NUMBER:\s*'[^']*'/, "PAIRING_NUMBER: '" + String(k.p).replace(/[^0-9]/g, '') + "'")
fs.writeFileSync(f, s)
console.log('✅ teus números preservados')
