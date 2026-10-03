#!/data/data/com.termux/files/usr/bin/sh
# Copia e otimiza as imagens dos menus da galeria para ~/PETER-BOT/img (nomes finais normalizados).
# Procura em DCIM/Camera, Download e Pictures (precisa de: termux-setup-storage)
DEST="$(cd "$(dirname "$0")" && pwd)/img"
mkdir -p "$DEST"
BASE="${STORAGE_BASE:-$HOME/storage}"
DIRS="$BASE/dcim/Camera $BASE/downloads $BASE/pictures $BASE/dcim"
N=0
copy() { # $1 = nome na galeria (sem extensão)  $2 = nome final
  for d in $DIRS; do
    [ -d "$d" ] || continue
    f=$(find "$d" -maxdepth 2 \( -iname "$1.jpg" -o -iname "$1.jpeg" -o -iname "$1.png" \) 2>/dev/null | head -1)
    if [ -n "$f" ]; then
      if command -v ffmpeg >/dev/null 2>&1; then
        ffmpeg -loglevel error -y -i "$f" -vf "scale='min(1280,iw)':-2" -q:v 4 "$DEST/$2.jpg" || cp "$f" "$DEST/$2.jpg"
      else
        cp "$f" "$DEST/$2.jpg"
      fi
      echo "✅ $1 → img/$2.jpg"; N=$((N+1)); return
    fi
  done
  echo "— não achei: $1"
}
copy mneu1 menu1; [ -f "$DEST/menu1.jpg" ] || copy menu1 menu1
copy menu2 menu2; copy menu3 menu3; copy menu4 menu4; copy menu5 menu5
copy Ownermenu ownermenu; copy Perfilbot perfilbot; copy Banido banido
copy Yujujj yuji; copy YujiModulo yujim
echo "Imagens copiadas: $N"
