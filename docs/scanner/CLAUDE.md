# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Python CLI tool that processes flatbed scans of physical trivia cards and outputs structured JSON using the Claude Vision API. Output is stored in `output/` for future import into the `../trivia-app` frontend.

## Stack

- Python 3
- Anthropic Python SDK (`anthropic`)
- Pillow for image compression
- Input: `input/<card_set>/` — JPG scans
- Output: `output/<card_set>/` — one JSON file per card

## Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Copy and fill in your API key
cp .env.example .env

# Run all card sets
python3 scanner.py

# Run a specific card set
python3 scanner.py tp_millennium

# Run multiple specific sets
python3 scanner.py all_of_us mind_the_gap
```

## Architecture

`scanner.py` is the single entry point. It processes each card set defined in `CARD_SETS`.

### Input file naming

Two file types are supported per card set:

| Pattern | Description |
|---------|-------------|
| `card_NNN.jpg` | Single-sided card (questions + answers on one image) |
| `card_NNN_front.jpg` + `card_NNN_back.jpg` | Front/back pair for one card |
| `batch_NNN.jpg` | Multiple single-sided cards in one scan |
| `batch_NNN_front.jpg` + `batch_NNN_back.jpg` | Multiple cards, front and back scans |

### Card sets

| Folder | Mode | Notes |
|--------|------|-------|
| `all_of_us` | single | Border color = generation (Red=Gen X, Purple=Boomers, Green=Millennials, Yellow=Gen Z). TIME TRAVEL cards are ignored. |
| `guess_that_tune` | single | Skipped — Claude's content policy blocks song lyric transcription |
| `mind_the_gap` | pair | Questions on front, answers on back matched by icon position. Sub-edition (Millennial, Gen X, Gen Z, Boomer) on back. |
| `tp_millennium` | pair | 6 questions per card with colored oval labels (WC, SL, SN, HIS, AE, PP). Printed card number used as card_id for reliable front/back matching. |

### Output schema

```json
{
  "card_set": "tp_millennium",
  "card_id": "001_572",
  "questions": [
    {
      "category": "HIS",
      "color": "yellow",
      "question": "...",
      "answer": "..."
    }
  ]
}
```

- `card_id` for batch items: `{batch_id}_{position}` for positional sets, `{batch_id}_{printed_number}` for tp_millennium
- `color` is null for sets without color coding
- `category` is null for sets without category labels

### Deduplication

Before writing, each card's questions are hashed and checked against all existing output files. Duplicate cards (from re-scanning) are skipped and reported.

### Image compression

- Single card images: resized to 800px max (sufficient for one card)
- Batch scan images: resized to 1200px max (needed to keep multiple cards readable)
