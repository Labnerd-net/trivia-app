# Trivia Card Scanner

A standalone Python CLI tool to photograph physical trivia cards and digitize them into structured JSON using the Claude Vision API.

## Goal

Batch-process photos of trivia cards (front and back) and extract questions/answers into structured JSON files for later import into a database.

## Card Characteristics

- Various card sets (different layouts, fonts, designs)
- All cards have a front and back
- Multiple questions per card (e.g. Trivial Pursuit-style with one question per category/color)
- Answers may be on the reverse side of the card

## Output Format

JSON files per card (or batch), structured roughly as:

```json
[
  {
    "card_id": "001",
    "questions": [
      {
        "category": "Science",
        "question": "What is the chemical symbol for water?",
        "answer": "H2O"
      }
    ]
  }
]
```

Schema may evolve once real cards are tested — category labels, difficulty, and color coding will vary by card set.

## Input Methods

### Option A: Phone Photos (card-by-card)
- Photograph front and back of each card individually
- Simpler script logic — one front/back pair per card
- More physical effort, less consistent image quality

### Option B: Flatbed Scanner (recommended)
- Flatbed scanner that supports larger than 8.5x11 — can fit multiple cards per scan
- Consistent lighting, no distortion, higher reliability for Claude Vision
- Scan a sheet of fronts, then a sheet of backs in one pass each
- Recommended resolution: 300 DPI (higher is unnecessary and increases file size)
- Script should resize/compress images before sending to the API
- More complex parsing — Claude needs to identify individual cards within the larger image and pair fronts with backs

## Approach

- Python CLI script
- Claude Vision API (`claude-sonnet-4-6` or similar) to parse card images
- Script sends front/back image(s) to Claude with a prompt to extract and pair questions with answers
- Output written to JSON files

## Workflow

### Option A: Card-by-card (phone)
1. Photograph card front → save to input folder
2. Photograph card back → save to input folder (paired by filename, e.g. `card_001_front.jpg` / `card_001_back.jpg`)
3. Run script against input folder
4. Script processes each front/back pair and writes `card_001.json` to output folder
5. Review output for accuracy

### Option B: Batch scans (flatbed)
1. Lay multiple card fronts on the platen → scan → save as `batch_01_fronts.jpg`
2. Flip cards, lay backs on the platen → scan → save as `batch_01_backs.jpg`
3. Run script against input folder
4. Script sends each front/back scan pair to Claude, which identifies individual cards and extracts all questions/answers
5. Output written as one JSON file per batch (or split per card during post-processing)
6. Review output for accuracy

## Key Decisions / Open Questions

- **Input method**: decide between card-by-card phone photos vs. flatbed batch scans — start with flatbed for prototype
- **Naming convention**: front/back image pairs need a consistent naming scheme
- **Batch vs. single**: script should support processing a whole folder in one run
- **Error handling**: low-quality images should be flagged rather than silently producing bad output
- **Image compression**: flatbed scans should be resized before sending to the API to control cost and avoid size limits
- **Card set variations**: prompt may need tuning per card set if layouts differ significantly
- **Database**: JSON output is the immediate goal; DB import is a future step

## Stack

- Python 3
- Anthropic Python SDK (`anthropic`)
- Input: folder of JPG/PNG images
- Output: folder of JSON files

## Status

Not started — prototype phase. Plan is to test on a small batch of cards first before committing to a full run.
