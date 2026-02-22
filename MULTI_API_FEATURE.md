# Multi-API Provider Feature

## Overview

The trivia app supports **two different trivia API providers**, allowing users to choose their preferred question source directly from the menu.

## Supported Providers

### 1. Open Trivia Database (OpenTDB)
- **Questions**: 4,000+ community-contributed
- **Token**: Required (prevents duplicate questions in session)
- **Categories**: 24 categories fetched dynamically from the API
- **Difficulties**: Easy, Medium, Hard
- **Types**: Multiple Choice, True/False
- **Best for**: General trivia with difficulty levels

### 2. The Trivia API
- **Questions**: High-quality curated questions
- **Token**: Not required
- **Categories**: 10 predefined categories
- **Difficulties**: Easy, Medium, Hard
- **Types**: Multiple Choice only
- **Best for**: High-quality questions with consistent formatting

## Architecture

### Provider System (`src/api/providers.ts`)

Each provider implements a common interface:

```typescript
{
  id: string,
  name: string,
  description: string,
  requiresToken: boolean,

  async getToken(signal?: AbortSignal): Promise<string | null>,
  async getCategories(options?: { signal?: AbortSignal }): Promise<Category[]>,
  async getQuestions(options: GetQuestionsOptions): Promise<QuestionsResult>,

  difficulties: SelectOption[],
  types: SelectOption[]
}
```

### Response Normalization

All API responses are normalized to a common format:

```typescript
{
  results: [{
    question: string,
    correctAnswer: string,
    incorrectAnswers: string[],
    category: string,
    difficulty: string,
    type: string,
  }]
}
```

## Adding New Providers

To add a new provider:

1. Create a provider object in `src/api/providers.ts` implementing the interface above.
2. Add it to the `providers` registry:
```typescript
export const providers: Record<string, Provider> = {
  // ... existing providers
  newprovider: newProvider,
};
```
3. Add it to `providerList`:
```typescript
export const providerList: ProviderListItem[] = [
  // ... existing providers
  { id: 'newprovider', name: 'New Provider Name', icon: '🎲' },
];
```
