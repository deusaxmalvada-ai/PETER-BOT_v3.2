#!/data/data/com.termux/files/usr/bin/sh
# Instala o ITADØRI por cima do teu ~/PETER-BOT (com backup). Não mexe em auth, m2, core, panels, personality.
set -e
DEST="${DEST_DIR:-$HOME/PETER-BOT}"
SRC="$(cd "$(dirname "$0")" && pwd)"
[ -d "$DEST" ] || { echo "❌ Não encontrei $DEST"; exit 1; }
STAMP=$(date +%Y%m%d-%H%M%S)
cd "$HOME"
tar --exclude=PETER-BOT/auth --exclude=PETER-BOT/node_modules -czf "peter-bot-backup-$STAMP.tar.gz" "$(basename "$DEST")"
echo "✅ Backup: ~/peter-bot-backup-$STAMP.tar.gz"
mkdir -p "$DEST/_old" "$DEST/data"
cp "$DEST/index.js" "$DEST/_old/index-$STAMP.js" 2>/dev/null || true
cp "$DEST/bot.js" "$DEST/_old/bot-$STAMP.js" 2>/dev/null || true
KEEP="$HOME/.peter-owner.json"; rm -f "$KEEP"
[ -f "$DEST/src/config.js" ] && node "$SRC/tools/keep.js" "$DEST/src/config.js" "$KEEP" || true
rm -rf "$DEST/src"
cp -r "$SRC/src" "$DEST/src"
[ -f "$KEEP" ] && node "$SRC/tools/restore.js" "$KEEP" "$DEST/src/config.js" || true
cp "$SRC/index.js" "$SRC/bot.js" "$SRC/start.sh" "$SRC/ia-config.sh" "$SRC/imagens.sh" "$DEST/"
[ -f "$DEST/modo.json" ] || echo '{"modo":"Peter"}' > "$DEST/modo.json"
sh "$DEST/imagens.sh" || true
echo "✅ Instalado. Inicia com:"
echo "   cd ~/PETER-BOT && sh start.sh"
