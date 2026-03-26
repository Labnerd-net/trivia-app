#!/usr/bin/env python3
"""
Trivia Card Scanner
Processes scanned trivia card images and outputs structured JSON using Claude Vision.

Supports both single-card files (card_NNN.jpg / card_NNN_front.jpg + card_NNN_back.jpg)
and batch scans (batch_NNN.jpg / batch_NNN_front.jpg + batch_NNN_back.jpg).

Successfully processed input images are moved to a processed/ subfolder within each card set directory.

Usage:
    python3 scanner.py                        # process all card sets
    python3 scanner.py tp_millennium          # process one set
    python3 scanner.py all_of_us mind_the_gap # process multiple sets
"""

import anthropic
import base64
import hashlib
import io
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image

load_dotenv(Path(__file__).parent / "scanner.env")

INPUT_DIR = Path("scans/input_scans")
OUTPUT_DIR = Path("scans/processed_scans")
MAX_IMAGE_DIMENSION_SINGLE = 800   # one card per image — less resolution needed
MAX_IMAGE_DIMENSION_BATCH  = 1200  # multiple cards per image — needs more resolution

CARD_SETS = {
    "all_of_us":     {"mode": "single"},
    # guess_that_tune: skipped — Claude's content policy blocks song lyric transcription
    "mind_the_gap":  {"mode": "pair"},
    "tp_millennium": {"mode": "pair"},
}

# Single-card prompts: return a flat list of questions
PROMPTS = {
    "all_of_us": """This is an All of Us trivia card. It has numbered questions with the answers printed inline in parentheses at the end of each question.
The card's border color indicates the generation category:
  - Red border = Gen X
  - Purple border = Boomers
  - Green border = Millennials
  - Yellow border = Gen Z
Extract each question and its answer (the text inside the parentheses), and identify the border color to set the category.
Return a JSON array only, no explanation:
[{"category": "<generation name>", "color": "<border color>", "question": "...", "answer": "..."}]""",

    "mind_the_gap": """These are the front and back of a Mind the Gap trivia card.
The front has questions matched to category icons running left to right along the top.
The back has the sub-edition name (e.g. "Millennial" or "Gen X") and answers matched to the same icons in the same left-to-right order.
Match each question to its answer by icon position.
If any individual question or answer cannot be transcribed, set that field to null rather than omitting the entry or refusing the response.
Return a JSON array only, no explanation:
[{"category": "<sub-edition name>", "color": null, "question": "...", "answer": "..."}]""",

    "tp_millennium": """These are the front and back of a Trivial Pursuit Millennium card.
Each question and answer is labeled with a colored oval abbreviation: WC, SL, SN, HIS, AE, PP.
Match each question on the front to its answer on the back using the oval abbreviation.
The colors are: WC=orange, SL=green, SN=brown, HIS=yellow, AE=pink, PP=blue.
Return a JSON array only, no explanation:
[{"category": "<abbreviation>", "color": "<color>", "question": "...", "answer": "..."}]""",
}

# Batch prompts: return an array of cards, each with card_id and questions
BATCH_PROMPTS = {
    "all_of_us": """This image contains multiple All of Us trivia cards laid out in a grid.
Each card has a colored border that indicates the generation category:
  - Red border = Gen X
  - Purple border = Boomers
  - Green border = Millennials
  - Yellow border = Gen Z
Cards titled "TIME TRAVEL" should be ignored entirely.
For each non-TIME TRAVEL card, extract all questions and their inline answers (in parentheses).
Number cards by their grid position left-to-right, top-to-bottom starting at 1.
Return a JSON array only, no explanation:
[{"card_id": "<position number>", "questions": [{"category": "<generation>", "color": "<border color>", "question": "...", "answer": "..."}]}]""",

    "mind_the_gap": """The first image shows the fronts of multiple Mind the Gap cards arranged in a grid.
The second image shows the backs of the same cards in the same grid order (left-to-right, top-to-bottom).
For each card, match the questions (front, by icon order) to the answers (back, same icon order).
The sub-edition name (Millennial, Gen X, Gen Z, Boomer) is printed on each card's back.
Number cards by their grid position left-to-right, top-to-bottom starting at 1.
If any individual question or answer cannot be transcribed, set that field to null rather than omitting the card or refusing the response.
Return a JSON array only, no explanation:
[{"card_id": "<position number>", "questions": [{"category": "<sub-edition>", "color": null, "question": "...", "answer": "..."}]}]""",

    "tp_millennium": """The first image shows the fronts of multiple Trivial Pursuit Millennium cards.
The second image shows the backs of the same cards.
Each card has a unique number printed in the bottom-right corner — use this as card_id to match fronts to backs.
For each card, match questions to answers using the colored oval abbreviations (WC, SL, SN, HIS, AE, PP).
The colors are: WC=orange, SL=green, SN=brown, HIS=yellow, AE=pink, PP=blue.
Return a JSON array only, no explanation:
[{"card_id": "<printed number>", "questions": [{"category": "<abbreviation>", "color": "<color>", "question": "...", "answer": "..."}]}]""",
}


def compress_image(path: Path, max_dim: int) -> str:
    """Load image, resize if needed, return base64-encoded JPEG string."""
    with Image.open(path) as img:
        img = img.convert("RGB")
        if max(img.size) > max_dim:
            img.thumbnail((max_dim, max_dim), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return base64.standard_b64encode(buf.getvalue()).decode("utf-8")


def call_claude(client: anthropic.Anthropic, images: list[Path], prompt: str, is_batch: bool = False) -> str:
    """Send images and prompt to Claude, return raw text response."""
    max_dim = MAX_IMAGE_DIMENSION_BATCH if is_batch else MAX_IMAGE_DIMENSION_SINGLE
    content = []
    for img_path in images:
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/jpeg",
                "data": compress_image(img_path, max_dim),
            },
        })
    content.append({"type": "text", "text": prompt})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": content}],
    )
    return response.content[0].text.strip()


def parse_json(text: str) -> any:
    """Strip markdown code fences if present and parse JSON."""
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    return json.loads(text)


def find_items(card_set_dir: Path, mode: str) -> list[dict]:
    """
    Return list of items to process. Each item is either:
      - A single card:  {"type": "card",  "card_id": "001", "images": [...]}
      - A batch scan:   {"type": "batch", "batch_id": "001", "images": [...]}
    """
    items = []

    if mode == "single":
        for img_path in sorted(card_set_dir.glob("card_*.jpg")):
            if "_front" in img_path.stem or "_back" in img_path.stem:
                continue
            items.append({"type": "card", "card_id": img_path.stem.replace("card_", ""), "images": [img_path]})
        for img_path in sorted(card_set_dir.glob("batch_*.jpg")):
            if "_front" in img_path.stem or "_back" in img_path.stem:
                continue
            items.append({"type": "batch", "batch_id": img_path.stem.replace("batch_", ""), "images": [img_path]})
    else:
        for front in sorted(card_set_dir.glob("card_*_front.jpg")):
            card_id = front.stem.replace("card_", "").replace("_front", "")
            back = card_set_dir / front.name.replace("_front", "_back")
            if not back.exists():
                print(f"  WARNING: no back found for {front.name}, skipping")
                continue
            items.append({"type": "card", "card_id": card_id, "images": [front, back]})
        for front in sorted(card_set_dir.glob("batch_*_front.jpg")):
            batch_id = front.stem.replace("batch_", "").replace("_front", "")
            back = card_set_dir / front.name.replace("_front", "_back")
            if not back.exists():
                print(f"  WARNING: no back found for {front.name}, skipping")
                continue
            items.append({"type": "batch", "batch_id": batch_id, "images": [front, back]})

    return items


def questions_fingerprint(questions: list[dict]) -> str:
    """Hash the question texts to detect duplicate cards regardless of card_id."""
    combined = "|".join(q.get("question", "") for q in questions)
    return hashlib.md5(combined.encode()).hexdigest()


def load_existing_fingerprints(output_dir: Path) -> set[str]:
    """Read all existing output files and return their question fingerprints."""
    fingerprints = set()
    for path in output_dir.glob("card_*.json"):
        try:
            data = json.loads(path.read_text())
            fingerprints.add(questions_fingerprint(data.get("questions", [])))
        except Exception:
            pass
    return fingerprints


def write_card(output_dir: Path, card_set: str, card_id: str, questions: list[dict],
               seen: set[str]) -> tuple[Path | None, bool]:
    """Write card JSON. Returns (path, was_duplicate). Skips if duplicate content detected."""
    fp = questions_fingerprint(questions)
    if fp in seen:
        return None, True
    seen.add(fp)
    out_path = output_dir / f"card_{card_id}.json"
    out_path.write_text(json.dumps({
        "card_set": card_set,
        "card_id": card_id,
        "questions": questions,
    }, indent=2, ensure_ascii=False))
    return out_path, False


def move_to_processed(card_set_dir: Path, images: list[Path]) -> None:
    """Move processed input images to a processed/ subfolder."""
    processed_dir = card_set_dir / "processed"
    processed_dir.mkdir(exist_ok=True)
    for img in images:
        img.rename(processed_dir / img.name)


def process_card_set(client: anthropic.Anthropic, card_set: str, mode: str) -> None:
    card_set_dir = INPUT_DIR / card_set
    if not card_set_dir.exists():
        print(f"  Skipping {card_set}: input folder not found")
        return

    output_dir = OUTPUT_DIR / card_set
    output_dir.mkdir(parents=True, exist_ok=True)

    seen = load_existing_fingerprints(output_dir)
    items = find_items(card_set_dir, mode)
    print(f"\n{card_set}: {len(items)} item(s)")

    for item in items:
        if item["type"] == "card":
            card_id = item["card_id"]
            print(f"  card {card_id}...", end=" ", flush=True)
            try:
                raw = call_claude(client, item["images"], PROMPTS[card_set], is_batch=False)
                questions = parse_json(raw)
                out_path, duplicate = write_card(output_dir, card_set, card_id, questions, seen)
                if duplicate:
                    print("SKIPPED (duplicate)")
                else:
                    print(f"OK ({len(questions)} questions) -> {out_path}")
                move_to_processed(card_set_dir, item["images"])
            except json.JSONDecodeError as e:
                print(f"PARSE ERROR: {e}")
            except Exception as e:
                print(f"ERROR: {e}")

        else:  # batch
            batch_id = item["batch_id"]
            print(f"  batch {batch_id}...", end=" ", flush=True)
            try:
                raw = call_claude(client, item["images"], BATCH_PROMPTS[card_set], is_batch=True)
                cards = parse_json(raw)
                written = dupes = 0
                for card in cards:
                    card_id = f"{batch_id}_{card['card_id']}"
                    _, duplicate = write_card(output_dir, card_set, card_id, card["questions"], seen)
                    if duplicate:
                        dupes += 1
                    else:
                        written += 1
                msg = f"OK ({written} cards)"
                if dupes:
                    msg += f", {dupes} duplicate(s) skipped"
                print(f"{msg} -> {output_dir}/")
                move_to_processed(card_set_dir, item["images"])
            except json.JSONDecodeError as e:
                print(f"PARSE ERROR: {e}")
            except Exception as e:
                print(f"ERROR: {e}")


def main() -> None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set. Add your key to scripts/scanner.env.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    sets_to_process = sys.argv[1:] if len(sys.argv) > 1 else list(CARD_SETS.keys())

    for card_set in sets_to_process:
        if card_set not in CARD_SETS:
            print(f"Unknown card set: {card_set}. Valid sets: {', '.join(CARD_SETS)}")
            continue
        process_card_set(client, card_set, CARD_SETS[card_set]["mode"])


if __name__ == "__main__":
    main()
