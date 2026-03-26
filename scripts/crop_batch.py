#!/usr/bin/env python3
"""
Crop batch scan sheets into individual card images for scanner.py.

Splits each batch_NNN_front.jpg / batch_NNN_back.jpg pair into individual
card_NNN_NN_front.jpg / card_NNN_NN_back.jpg files (one per grid cell).

Usage:
    python3 crop_batch.py mind_the_gap                    # all batches in set
    python3 crop_batch.py mind_the_gap 000075 000077      # specific batches
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

INPUT_DIR = Path("scans/input_scans")

GRID = {
    "mind_the_gap": (2, 5),   # cols, rows
}


def find_cuts(img_array: np.ndarray, axis: int, n: int) -> list[int]:
    """
    Detect n+1 boundary positions (start, n-1 separators, end) along the given axis.
    axis=0 → horizontal cuts (rows), axis=1 → vertical cuts (cols).
    Trims trailing white space, then finds n-1 separator bands.
    Falls back to equal division if detection fails.
    """
    if axis == 0:
        brightness = img_array.mean(axis=(1, 2))   # per row
    else:
        brightness = img_array.mean(axis=(0, 2))   # per col

    length = len(brightness)

    # Trim trailing white space (brightness > 250 = blank margin)
    content_end = length
    for i in range(length - 1, -1, -1):
        if brightness[i] < 250:
            content_end = i + 1
            break

    # Adaptive threshold: midpoint between content avg and local minima
    content_brightness = brightness[:content_end]
    threshold = content_brightness.min() + (content_brightness.mean() - content_brightness.min()) * 0.4

    dark = content_brightness < threshold

    # Collect midpoints of dark bands with minimum spacing between them
    min_gap = content_end // (n * 3)
    separators = []
    in_band = False
    band_start = 0
    for i, is_dark in enumerate(dark):
        if is_dark and not in_band:
            in_band = True
            band_start = i
        elif not is_dark and in_band:
            in_band = False
            mid = (band_start + i) // 2
            if not separators or mid - separators[-1] > min_gap:
                separators.append(mid)

    # Keep the n-1 separators that best divide the content region.
    # Snap each expected divider position to the nearest detected separator.
    if len(separators) >= n - 1:
        picks = []
        for k in range(1, n):
            expected = round(content_end * k / n)
            nearest = min(separators, key=lambda s: abs(s - expected))
            picks.append(nearest)
        picks = sorted(set(picks))
        # If deduplication dropped any, fall back to first n-1
        if len(picks) < n - 1:
            picks = separators[:n - 1]
        boundaries = [0] + picks + [content_end]
    else:
        # Fall back to equal division of content region
        boundaries = [round(content_end * i / n) for i in range(n + 1)]

    return boundaries


def crop_batch(card_set: str, batch_id: str) -> None:
    card_set_dir = INPUT_DIR / card_set
    front_path = card_set_dir / f"batch_{batch_id}_front.jpg"
    back_path  = card_set_dir / f"batch_{batch_id}_back.jpg"

    if not front_path.exists() or not back_path.exists():
        print(f"  {batch_id}: missing front or back, skipping")
        return

    cols, rows = GRID.get(card_set, (2, 5))

    front = Image.open(front_path).convert("RGB")
    back  = Image.open(back_path).convert("RGB")

    fa = np.array(front)
    x_cuts = find_cuts(fa, axis=1, n=cols)
    y_cuts = find_cuts(fa, axis=0, n=rows)

    position = 1
    for row in range(rows):
        y0, y1 = y_cuts[row], y_cuts[row + 1]
        for col in range(cols):
            x0, x1 = x_cuts[col], x_cuts[col + 1]
            pos_str = f"{position:02d}"
            card_id = f"{batch_id}_{pos_str}"

            front_crop = front.crop((x0, y0, x1, y1))
            back_crop  = back.crop((x0, y0, x1, y1))

            front_out = card_set_dir / f"card_{card_id}_front.jpg"
            back_out  = card_set_dir / f"card_{card_id}_back.jpg"
            front_crop.save(front_out, format="JPEG", quality=95)
            back_crop.save(back_out,  format="JPEG", quality=95)

            position += 1

    print(f"  {batch_id}: {rows * cols} cards -> {card_set_dir}/card_{batch_id}_*.jpg")


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python3 crop_batch.py <card_set> [batch_id ...]")
        sys.exit(1)

    card_set = sys.argv[1]
    card_set_dir = INPUT_DIR / card_set

    if not card_set_dir.exists():
        print(f"Input folder not found: {card_set_dir}")
        sys.exit(1)

    if card_set not in GRID:
        print(f"No grid config for '{card_set}'. Add it to GRID in crop_batch.py.")
        sys.exit(1)

    if len(sys.argv) > 2:
        batch_ids = sys.argv[2:]
    else:
        batch_ids = sorted(set(
            p.stem.replace("batch_", "").replace("_front", "").replace("_back", "")
            for p in card_set_dir.glob("batch_*_front.jpg")
        ))

    print(f"\n{card_set}: cropping {len(batch_ids)} batch(es)")
    for batch_id in batch_ids:
        crop_batch(card_set, batch_id)


if __name__ == "__main__":
    main()
