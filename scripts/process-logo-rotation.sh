#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_DIR="${1:?Usage: scripts/process-logo-rotation.sh /path/to/cope-logos}"
OUTPUT_DIR="$ROOT/apps/frontend/public/media/logo-rotation"
SPLASH_DIR="$OUTPUT_DIR/splash"
WORDMARK_DIR="$OUTPUT_DIR/wordmark"
PROCESSING_DIR="$(mktemp -d)"
trap 'rm -rf -- "$PROCESSING_DIR"' EXIT

make_splash() {
  local source_path="$1"
  local id="$2"
  local max_size="$3"
  local suffix="$4"
  local quality="$5"
  local base_path="$PROCESSING_DIR/$id-splash-$suffix-base.png"
  local mask_path="$PROCESSING_DIR/$id-splash-$suffix-mask.png"
  local alpha_path="$PROCESSING_DIR/$id-splash-$suffix-alpha.png"

  magick "$source_path" -auto-orient -strip -resize "$max_size" "$base_path"

  local width height shortest fade blur right bottom
  read -r width height < <(magick identify -format '%w %h\n' "$base_path")
  if ((width < height)); then shortest="$width"; else shortest="$height"; fi
  fade=$((shortest * 4 / 100))
  if ((fade < 8)); then fade=8; fi
  blur=$((fade / 2))
  right=$((width - fade - 1))
  bottom=$((height - fade - 1))

  # Feather every outer edge to full transparency. This removes the hard
  # generated-image rectangle without color-keying away matching logo details.
  magick -size "${width}x${height}" xc:black -fill white \
    -draw "rectangle $fade,$fade $right,$bottom" -blur "0x$blur" "$mask_path"
  magick "$base_path" "$mask_path" -alpha off -compose CopyOpacity -composite "$alpha_path"
  magick "$alpha_path" -quality "$quality" -define webp:method=6 \
    -define webp:alpha-quality=100 "$SPLASH_DIR/$id-$suffix.webp"
}

mkdir -p "$SPLASH_DIR" "$WORDMARK_DIR"
find "$SPLASH_DIR" -maxdepth 1 -type f -name '*.webp' -delete
find "$WORDMARK_DIR" -maxdepth 1 -type f -name '*.webp' -delete

# Every submitted artwork remains in the splash rotation, including images that do
# not have a clean rectangular wordmark crop.
# source filename | public id
SPLASH_SOURCES=(
  "Gemini_Generated_Image_2jt6db2jt6db2jt6.jpeg|2jt6db"
  "Gemini_Generated_Image_749ofw749ofw749o.jpeg|749ofw"
  "Gemini_Generated_Image_836vt1836vt1836v.jpeg|836vt1"
  "Gemini_Generated_Image_8rh43q8rh43q8rh4.jpeg|8rh43q"
  "Gemini_Generated_Image_b2fwp0b2fwp0b2fw.jpeg|b2fwp0"
  "Gemini_Generated_Image_b53lnhb53lnhb53l.jpeg|b53lnh"
  "Gemini_Generated_Image_d8714id8714id871.jpeg|d8714i"
  "Gemini_Generated_Image_dg0zd8dg0zd8dg0z.jpeg|dg0zd8"
  "Gemini_Generated_Image_du0wawdu0wawdu0w.jpeg|du0waw"
  "Gemini_Generated_Image_f88afsf88afsf88a.jpeg|f88afs"
  "Gemini_Generated_Image_fqwyhjfqwyhjfqwy.jpeg|fqwyhj"
  "Gemini_Generated_Image_gg2497gg2497gg24.jpeg|gg2497"
  "Gemini_Generated_Image_gltpvwgltpvwgltp.jpeg|gltpvw"
  "Gemini_Generated_Image_gp4zlpgp4zlpgp4z.jpeg|gp4zlp"
  "Gemini_Generated_Image_gp7motgp7motgp7m.jpeg|gp7mot"
  "Gemini_Generated_Image_i27mjti27mjti27m.jpeg|i27mjt"
  "Gemini_Generated_Image_io0dt8io0dt8io0d.jpeg|io0dt8"
  "Gemini_Generated_Image_ke0zvbke0zvbke0z.jpeg|ke0zvb"
  "Gemini_Generated_Image_lq0smslq0smslq0s.jpeg|lq0sms"
  "Gemini_Generated_Image_mn3v09mn3v09mn3v.jpeg|mn3v09"
  "Gemini_Generated_Image_n8gt9nn8gt9nn8gt.jpeg|n8gt9n"
  "Gemini_Generated_Image_nzh76pnzh76pnzh7.jpeg|nzh76p"
  "Gemini_Generated_Image_ogohadogohadogoh.jpeg|ogohad"
  "Gemini_Generated_Image_oxpp04oxpp04oxpp.jpeg|oxpp04"
  "Gemini_Generated_Image_qh2r6lqh2r6lqh2r.jpeg|qh2r6l"
  "Gemini_Generated_Image_rc2njkrc2njkrc2n.jpeg|rc2njk"
  "Gemini_Generated_Image_wf33fhwf33fhwf33.jpeg|wf33fh"
  "Gemini_Generated_Image_wz1pujwz1pujwz1p.jpeg|wz1puj"
  "Gemini_Generated_Image_xifzyrxifzyrxifz.jpeg|xifzyr"
  "Gemini_Generated_Image_yx19n8yx19n8yx19.jpeg|yx19n8"
)

# Only artwork with a manually approved text-only crop enters the header pool.
# source filename | public id | exact crop x/y/width/height in source pixels | clear side pixels after resize
WORDMARK_SPECS=(
  "Gemini_Generated_Image_2jt6db2jt6db2jt6.jpeg|2jt6db|619|998|1605|199|0"
  "Gemini_Generated_Image_749ofw749ofw749o.jpeg|749ofw|478|844|1858|307|0"
  "Gemini_Generated_Image_836vt1836vt1836v.jpeg|836vt1|380|1060|2055|215|0"
  "Gemini_Generated_Image_b2fwp0b2fwp0b2fw.jpeg|b2fwp0|285|1445|1390|260|0"
  "Gemini_Generated_Image_d8714id8714id871.jpeg|d8714i|704|1152|1408|153|0"
  "Gemini_Generated_Image_dg0zd8dg0zd8dg0z.jpeg|dg0zd8|873|983|1098|215|0"
  "Gemini_Generated_Image_du0wawdu0wawdu0w.jpeg|du0waw|704|1105|1408|215|0"
  "Gemini_Generated_Image_f88afsf88afsf88a.jpeg|f88afs|286|1331|1474|225|0"
  "Gemini_Generated_Image_fqwyhjfqwyhjfqwy.jpeg|fqwyhj|820|160|1175|165|0"
  "Gemini_Generated_Image_gltpvwgltpvwgltp.jpeg|gltpvw|506|184|1914|276|0"
  "Gemini_Generated_Image_gp7motgp7motgp7m.jpeg|gp7mot|930|345|960|160|0"
  "Gemini_Generated_Image_i27mjti27mjti27m.jpeg|i27mjt|900|220|1060|205|0"
  "Gemini_Generated_Image_io0dt8io0dt8io0d.jpeg|io0dt8|704|906|1408|215|0"
  "Gemini_Generated_Image_ke0zvbke0zvbke0z.jpeg|ke0zvb|844|983|1126|184|0"
  "Gemini_Generated_Image_lq0smslq0smslq0s.jpeg|lq0sms|710|940|1395|165|0"
  "Gemini_Generated_Image_n8gt9nn8gt9nn8gt.jpeg|n8gt9n|710|985|1395|180|0"
  "Gemini_Generated_Image_nzh76pnzh76pnzh7.jpeg|nzh76p|990|1005|850|160|0"
  "Gemini_Generated_Image_ogohadogohadogoh.jpeg|ogohad|760|940|1435|205|0"
  "Gemini_Generated_Image_qh2r6lqh2r6lqh2r.jpeg|qh2r6l|760|1059|1295|199|0"
  "Gemini_Generated_Image_rc2njkrc2njkrc2n.jpeg|rc2njk|225|710|2366|370|0"
  "Gemini_Generated_Image_yx19n8yx19n8yx19.jpeg|yx19n8|844|1029|1126|153|0"
)

for source in "${SPLASH_SOURCES[@]}"; do
  IFS='|' read -r filename id <<< "$source"
  source_path="$SOURCE_DIR/$filename"
  if [[ ! -f "$source_path" ]]; then
    echo "Missing source logo: $source_path" >&2
    exit 1
  fi

  make_splash "$source_path" "$id" '640x560>' 640 72
  make_splash "$source_path" "$id" '1280x900>' 1280 78
done

for spec in "${WORDMARK_SPECS[@]}"; do
  IFS='|' read -r filename id x y w h clear_x <<< "$spec"
  source_path="$SOURCE_DIR/$filename"
  if [[ ! -f "$source_path" ]]; then
    echo "Missing source logo: $source_path" >&2
    exit 1
  fi

  read -r source_width source_height < <(magick identify -format '%w %h\n' "$source_path")
  if ((x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > source_width || y + h > source_height)); then
    echo "Invalid wordmark crop for $id: ${w}x${h}+${x}+${y} in ${source_width}x${source_height}" >&2
    exit 1
  fi

  magick "$source_path" -auto-orient -crop "${w}x${h}+${x}+${y}" +repage \
    -strip -resize '800x144>' "$PROCESSING_DIR/$id-base.png"
  magick "$PROCESSING_DIR/$id-base.png" -alpha off -colorspace gray \
    -level '25%,45%' "$PROCESSING_DIR/$id-mask.png"
  magick "$PROCESSING_DIR/$id-base.png" "$PROCESSING_DIR/$id-mask.png" \
    -alpha off -compose CopyOpacity -composite "$PROCESSING_DIR/$id-alpha.png"
  if ((clear_x > 0)); then
    magick "$PROCESSING_DIR/$id-alpha.png" -shave "${clear_x}x0" \
      -bordercolor none -border "${clear_x}x0" "$PROCESSING_DIR/$id.png"
  else
    magick "$PROCESSING_DIR/$id-alpha.png" "$PROCESSING_DIR/$id.png"
  fi
  magick "$PROCESSING_DIR/$id.png" -quality 80 -define webp:method=6 \
    -define webp:alpha-quality=100 "$WORDMARK_DIR/$id.webp"
done

magick montage "$SPLASH_DIR"/*-1280.webp -thumbnail 320x220 -set label '%t' \
  -font DejaVu-Sans -pointsize 14 -background '#111111' -fill white \
  -geometry 320x250+8+8 -tile 4x "$ROOT/docs/logo-splash-review.jpg"
magick montage "$WORDMARK_DIR"/*.webp -thumbnail 400x110 -set label '%t' \
  -font DejaVu-Sans -pointsize 14 -background '#111111' -fill white \
  -geometry 400x145+8+8 -tile 3x "$ROOT/docs/logo-wordmark-review.jpg"

echo "Processed ${#SPLASH_SOURCES[@]} splash artworks and ${#WORDMARK_SPECS[@]} header wordmarks into $OUTPUT_DIR"
