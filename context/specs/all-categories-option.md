# Spec: All Categories Option

## Goal
Add an "Any Category" option to all providers so users can get questions from any category.

## Affected Providers
- `opentdb` — `getCategories` currently returns only named categories; `getQuestions` already skips the category param when `categoryId === 'all'`
- `triviaapi` — same as above
- `makeLocalProvider` (allofus, mindthegap, tpmillennium) — `getCategories` returns only named categories; `getQuestions` already falls back to full pool when `categoryName` is falsy

## Not Affected
- Offline snapshot providers already include `{ id: 'all', name: 'Any Category' }` as the first item

## Changes
- `openTDBProvider.getCategories`: prepend `{ id: 'all', name: 'Any Category' }` to the returned array
- `triviaAPIProvider.getCategories`: prepend `{ id: 'all', name: 'Any Category' }` to the returned array
- `makeLocalProvider`: change `getCategories` to return `[{ id: 'all', name: 'Any Category' }, ...categories]`

## Behavior
- "Any Category" will be the default selection (first item in list)
- Selecting it passes `categoryId = 'all'`, which all `getQuestions` implementations already handle correctly
- No changes needed to Menu.tsx, Quiz.tsx, or any other file
