# Architecture & Data Design

## Card Sets (input/)

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

## Scanner Output (JSON)

One JSON file per card written to `output/<card_set>/`.

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

### card_id format

| Source | card_id format |
|--------|----------------|
| Single `card_NNN.jpg` | `NNN` |
| Batch `batch_NNN.jpg`, positional sets | `NNN_<position>` |
| Batch `batch_NNN.jpg`, tp_millennium | `NNN_<printed card number>` |

### Deduplication

Questions are MD5-hashed on write and checked against all existing output files. Re-scanning the same card produces a SKIPPED warning rather than a duplicate file.

### Image compression

- Single card scans: resized to 800px max before API call
- Batch scans: resized to 1200px max (needed to keep multiple cards readable)

## Integration with trivia-app

The scanner feeds into `../trivia-app`. Output stays in this repo until a future import step.

### Changes needed in trivia-app

1. **Add `'open'` to `QuestionType`** (`src/types/index.ts`)
   - Physical cards are free-answer, not multiple choice

2. **Add `LocalCardsProvider`** (`src/api/providers.ts`)
   - Reads scanned JSON from `output/` in this repo (or a copied path)
   - `getCategories()` — returns unique categories across all card sets
   - `getQuestions()` — filters by card set and returns `NormalizedQuestion[]`
   - `incorrectAnswers` will be `[]`, `type` will be `'open'`

3. **Add free-answer mode to `Question` component** (`src/components/Question.tsx`)
   - When `type === 'open'`, show a text input instead of multiple choice
   - Reveal correct answer and let the player self-report correct/incorrect

## Workflow

```
input/<card_set>/card_NNN.jpg            ──┐
input/<card_set>/card_NNN_front/back.jpg ──┤  scanner.py  ──►  output/<card_set>/card_NNN.json
input/<card_set>/batch_NNN.jpg           ──┤
input/<card_set>/batch_NNN_front/back.jpg──┘
```
