#!/data/data/com.termux/files/usr/bin/sh
# Inicia o bot e reinicia sozinho (.restart). O .shutdown cria data/stop e para o ciclo.
cd "$(dirname "$0")"
mkdir -p data
rm -f data/stop
while true; do
  node index.js
  [ -f data/stop ] && echo "🔌 Desligado." && break
  echo "🔄 Reiniciando em 2s..."
  sleep 2
done
