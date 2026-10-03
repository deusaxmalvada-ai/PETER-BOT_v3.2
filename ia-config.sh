#!/data/data/com.termux/files/usr/bin/sh
# Configura a IA de conversa (cria ai.json). A chave fica só no teu telemóvel.
cd "$(dirname "$0")"
echo "Provedor: gemini | groq | openrouter | openai | anthropic"
printf "Provedor [gemini]: "; read -r P; [ -z "$P" ] && P=gemini
printf "Cola a API key: "; read -r K
printf "Modelo (Enter = padrão): "; read -r M
P="$P" K="$K" M="$M" node -e '
const fs=require("fs");const o={provider:process.env.P.trim().toLowerCase(),apiKey:process.env.K.trim()};
if(process.env.M.trim())o.model=process.env.M.trim();
fs.writeFileSync("ai.json",JSON.stringify(o,null,2),{mode:0o600});console.log("✅ ai.json criado");'
echo "Agora reinicia o bot e manda .ia no WhatsApp para ver o estado."
