# Multi-API Provider Feature

## Overview

The trivia app now supports **three different trivia API providers**, allowing users to choose their preferred question source directly from the menu.

## Supported Providers

### 1. Open Trivia Database (OpenTDB)
- **Icon**: 📚
- **Questions**: 4,000+ community-contributed
- **Token**: Required (prevents duplicate questions in session)
- **Categories**: 24 categories
- **Difficulties**: Easy, Medium, Hard
- **Types**: Multiple Choice, True/False
- **Best for**: General trivia with difficulty levels

### 2. The Trivia API
- **Icon**: 🎯
- **Questions**: High-quality curated questions
- **Token**: Not required
- **Categories**: 10 predefined categories
- **Difficulties**: Easy, Medium, Hard
- **Types**: Multiple Choice only
- **Best for**: High-quality questions with consistent formatting

### 3. jService (Jeopardy!)
- **Icon**: 🎮
- **Questions**: 221,510+ from the TV show
- **Token**: Not required
- **Categories**: 50+ popular Jeopardy categories
- **Difficulties**: Based on dollar value (auto-calculated)
- **Types**: Jeopardy! format (answer-only, no multiple choice)
- **Best for**: Jeopardy fans and unique Q&A format

## Architecture

### Provider System (`src/api/providers.js`)

Each provider implements a common interface:

```javascript
{
  id: string,
  name: string,
  description: string,
  requiresToken: boolean,

  async getToken(): Promise<string|null>,
  async getCategories(): Promise<Category[]>,
  async getQuestions(options): Promise<Questions>,

  difficulties: Difficulty[],
  types: Type[]
}
```

### Response Normalization

All API responses are normalized to a common format:

```javascript
{
  results: [{
    question: string,
    correctAnswer: string,
    incorrectAnswers: string[],
    category: string,
    difficulty: string,
    type: string,
    // Optional provider-specific fields
    airdate?: string,
    value?: number
  }]
}
```

### Question Component Adaptation

The `Question` component automatically adapts to different question types:
- **Multiple Choice**: Shuffled answers in clickable list
- **True/False**: Two-option format
- **Jeopardy**: Answer-only display with dollar value

## User Experience

1. User selects API provider from dropdown in menu
2. App fetches token (if required by provider)
3. Categories load specific to selected provider
4. Difficulty and type options adjust based on provider capabilities
5. Questions display in appropriate format for the provider

## Implementation Details

### Token Management
- OpenTDB requires a session token to prevent duplicates
- The Trivia API and jService do not require tokens
- Token is only fetched when provider changes or app initializes

### Category Loading
- Categories are fetched when provider changes
- Each provider has different category structures (normalized to common format)
- First category is auto-selected when provider changes

### Question Fetching
- All providers use the same `getQuestions()` interface
- Parameters (amount, category, difficulty, type) are passed consistently
- Each provider adapter handles its specific API requirements

## Adding New Providers

To add a new provider:

1. Create provider object in `src/api/providers.js`:
```javascript
const newProvider = {
  id: 'newprovider',
  name: 'New Provider Name',
  description: 'Description here',
  requiresToken: false,

  async getToken() { /* ... */ },
  async getCategories() { /* ... */ },
  async getQuestions(options) { /* ... */ },

  difficulties: [ /* ... */ ],
  types: [ /* ... */ ]
};
```

2. Add to provider registry:
```javascript
export const providers = {
  // ... existing providers
  newprovider: newProvider,
};
```

3. Add to provider list:
```javascript
export const providerList = [
  // ... existing providers
  { id: 'newprovider', name: 'New Provider Name', icon: '🎲' },
];
```

## Benefits

- **User Choice**: Users can pick their preferred question source
- **Fallback Options**: If one API is down, users can switch to another
- **Variety**: Different APIs have different question styles and difficulties
- **Extensibility**: Easy to add new providers without changing core app logic
- **Consistency**: All providers normalized to common format ensures UI works seamlessly
