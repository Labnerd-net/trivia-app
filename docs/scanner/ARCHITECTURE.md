# Trivia Card Scanner — Architecture & Reference

A Python CLI that processes flatbed scans of physical trivia cards and outputs structured JSON using the Claude Vision API.

## Stack

- Python 3
- Anthropic Python SDK (`anthropic`)
- Pillow + numpy for image processing
- Input: `scans/input_scans/<card_set>/` — JPG scans
- Output: `scans/processed_scans/<card_set>/` — one JSON file per card

## Commands

```bash
# Install dependencies
pip install -r scripts/requirements.txt

# Run all card sets
python3 scripts/scanner.py

# Run a specific card set
python3 scripts/scanner.py tp_millennium

# Run multiple specific sets
python3 scripts/scanner.py all_of_us mind_the_gap

# Crop batch scans into individual card images first
python3 scripts/crop_batch.py mind_the_gap
```

## Card Sets

| Folder | Layout | Files |
|--------|--------|-------|
| `all_of_us` | Questions and answers on one side only | `card_NNN.jpg` or `batch_NNN.jpg` |
| `mind_the_gap` | Questions front, answers back | `card_NNN_front/back.jpg` or `batch_NNN_front/back.jpg` |
| `tp_millennium` | Questions front, answers back | `card_NNN_front/back.jpg` or `batch_NNN_front/back.jpg` |

### Per-set format details

**all_of_us**
- 5 numbered questions per card, answers inline in parentheses
- Category determined by border color: Red=Gen X, Purple=Boomers, Green=Millennials, Yellow=Gen Z
- Cards titled "TIME TRAVEL" are automatically ignored

**mind_the_gap**
- 4-5 questions per card matched to small icons along the top
- Front has questions, back has answers matched positionally by icon order
- Sub-edition (Millennial, Gen X, Gen Z, Boomer) printed on the back — use as `category`
- Cards are scanned sideways (rotated 90°) — Claude handles this fine

**tp_millennium**
- 6 questions per card with colored oval labels: WC, SL, SN, HIS, AE, PP
- Front has questions, back has answers — matched by oval label
- Each card has a unique number printed on it — used as `card_id` for reliable matching
- Colors: WC=orange, SL=green, SN=brown, HIS=yellow, AE=pink, PP=blue

## Input File Naming

| Pattern | Description |
|---------|-------------|
| `card_NNN.jpg` | Single-sided card (questions + answers on one image) |
| `card_NNN_front.jpg` + `card_NNN_back.jpg` | Front/back pair for one card |
| `batch_NNN.jpg` | Multiple single-sided cards in one scan |
| `batch_NNN_front.jpg` + `batch_NNN_back.jpg` | Multiple cards, front and back scans |

## Output Schema

One JSON file per card written to `scans/processed_scans/<card_set>/`.

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

### card_id format

| Source | card_id format |
|--------|----------------|
| Single `card_NNN.jpg` | `NNN` |
| Batch `batch_NNN.jpg`, positional sets | `NNN_<position>` |
| Batch `batch_NNN.jpg`, tp_millennium | `NNN_<printed card number>` |

## Deduplication

Questions are MD5-hashed on write and checked against all existing output files. Re-scanning the same card produces a SKIPPED warning rather than a duplicate file.

## Image Compression

- Single card scans: resized to 800px max before API call
- Batch scans: resized to 1200px max (needed to keep multiple cards readable)

## Integration with trivia-app

Output is imported into `public/data/` via `scripts/import-cards.js`. See the **Card Scanning Pipeline** section in the root `CLAUDE.md`.

### Planned trivia-app changes

1. **Add `'open'` to `QuestionType`** (`src/types/index.ts`)
   - Physical cards are free-answer, not multiple choice

2. **Add `LocalCardsProvider`** (`src/api/providers.ts`)
   - `getCategories()` — returns unique categories across all card sets
   - `getQuestions()` — filters by card set and returns `NormalizedQuestion[]`
   - `incorrectAnswers` will be `[]`, `type` will be `'open'`

3. **Add free-answer mode to `Question` component** (`src/components/Question.tsx`)
   - When `type === 'open'`, show a text input instead of multiple choice
   - Reveal correct answer and let the player self-report correct/incorrect

## Workflow

```
scans/input_scans/<card_set>/card_NNN.jpg            ──┐
scans/input_scans/<card_set>/card_NNN_front/back.jpg ──┤  scanner.py  ──►  scans/processed_scans/<card_set>/card_NNN.json
scans/input_scans/<card_set>/batch_NNN.jpg           ──┤
scans/input_scans/<card_set>/batch_NNN_front/back.jpg──┘

scans/processed_scans/<card_set>/card_NNN.json  ──►  import-cards.js  ──►  public/data/<card_set>.json
```
