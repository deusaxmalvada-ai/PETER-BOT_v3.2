const { jidNormalizedUser } = require('@whiskeysockets/baileys')
const OWNER = '244948179380'
module.exports = {
  isOwner: (sender) => jidNormalizedUser(sender||'').includes(OWNER),
  isAdmin: async (sock, from, sender) => {
    try{
      if(!from.endsWith('@g.us')) return true
      const meta = await sock.groupMetadata(from)
      return meta.participants.find(p=>p.id===sender)?.admin!= null
    }catch{ return false }
  }
}
