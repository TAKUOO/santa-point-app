#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/assets/generated/rooms/normal"
TARGET_DIR="$ROOT_DIR/assets/generated/rooms"

TIME_SLOTS=(late-night morning daytime night)
RANKS=(bronze silver gold)

color_for_rank() {
  case "$1" in
    bronze) printf '%s' "#b87333" ;;
    silver) printf '%s' "#d8dbe2" ;;
    gold) printf '%s' "#d4af37" ;;
    *) return 1 ;;
  esac
}

opacity_for_rank() {
  case "$1" in
    bronze) printf '%s' "10" ;;
    silver) printf '%s' "8" ;;
    gold) printf '%s' "11" ;;
    *) return 1 ;;
  esac
}

mkdir -p "$TARGET_DIR"

for rank in "${RANKS[@]}"; do
  mkdir -p "$TARGET_DIR/$rank" "$TARGET_DIR/$rank/raw"

  for slot in "${TIME_SLOTS[@]}"; do
    src="$SOURCE_DIR/normal-santa-$slot.png"
    raw_out="$TARGET_DIR/$rank/raw/$rank-santa-$slot.png"
    final_out="$TARGET_DIR/$rank/$rank-santa-$slot.png"
    color="$(color_for_rank "$rank")"
    opacity="$(opacity_for_rank "$rank")"

    cp "$src" "$raw_out"
    magick "$src" \
      -fill "$color" \
      -colorize "$opacity" \
      -sigmoidal-contrast 2,50% \
      "$final_out"
  done
done
