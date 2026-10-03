// guarda os números do teu config.js antigo (qualquer versão) antes de atualizar
const fs = require('fs')
try {
  const c = require(process.argv[2])
  fs.writeFileSync(process.argv[3], JSON.stringify({ o: c.OWNER_NUMBERS, p: c.PAIRING_NUMBER }))
  console.log('✅ números do dono guardados')
} catch (e) { console.log('— sem config antigo para guardar') }
