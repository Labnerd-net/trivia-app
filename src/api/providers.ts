import axios from 'axios';
import type { Provider, ProviderListItem, GetQuestionsOptions } from '../types';

/**
 * Trivia API Provider Configurations
 * Each provider has methods to fetch categories and questions,
 * and adapters to normalize responses to a common format
 */

// ============================================================================
// OPENTDB PROVIDER
// ============================================================================
const openTDBProvider: Provider = {
  id: 'opentdb',
  name: 'Open Trivia Database',
  description: 'Large community database with 4,000+ questions',
  requiresToken: true,

  async getToken(signal?: AbortSignal) {
    const response = await axios.get('https://opentdb.com/api_token.php?command=request', { signal });
    return response.data.token;
  },

  async getCategories({ signal } = {}) {
    const response = await axios.get('https://opentdb.com/api_category.php', { signal });
    return response.data.trivia_categories.map((cat: { id: number; name: string }) => ({
      id: cat.id.toString(),
      name: cat.name
    }));
  },

  async getQuestions({ amount = 10, categoryId, difficulty, type, token, signal }: GetQuestionsOptions) {
    let url = `https://opentdb.com/api.php?amount=${amount}`;

    if (categoryId && categoryId !== 'all') url += `&category=${categoryId}`;
    if (difficulty && difficulty !== 'all') url += `&difficulty=${difficulty}`;
    if (type && type !== 'all') url += `&type=${type}`;
    if (token) url += `&token=${token}`;

    const response = await axios.get(url, { signal });

    return {
      results: response.data.results.map((q: {
        question: string;
        correct_answer: string;
        incorrect_answers: string[];
        category: string;
        difficulty: string;
        type: string;
      }) => ({
        question: q.question,
        correctAnswer: q.correct_answer,
        incorrectAnswers: q.incorrect_answers,
        category: q.category,
        difficulty: q.difficulty,
        type: q.type
      }))
    };
  },

  difficulties: [
    { value: "all", label: "Any difficulty" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ],

  types: [
    { value: "all", label: "Any type" },
    { value: "multiple", label: "Multiple Choice" },
    { value: "boolean", label: "True/False" },
  ],
};

// ============================================================================
// THE TRIVIA API PROVIDER
// ============================================================================
const triviaAPIProvider: Provider = {
  id: 'triviaapi',
  name: 'The Trivia API',
  description: 'High-quality questions with region filtering',
  requiresToken: false,

  async getToken(_signal?: AbortSignal) {
    return null; // No token needed
  },

  async getCategories() {
    // The Trivia API uses predefined categories
    return [
      { id: 'arts_and_literature', name: 'Arts & Literature' },
      { id: 'film_and_tv', name: 'Film & TV' },
      { id: 'food_and_drink', name: 'Food & Drink' },
      { id: 'general_knowledge', name: 'General Knowledge' },
      { id: 'geography', name: 'Geography' },
      { id: 'history', name: 'History' },
      { id: 'music', name: 'Music' },
      { id: 'science', name: 'Science' },
      { id: 'society_and_culture', name: 'Society & Culture' },
      { id: 'sport_and_leisure', name: 'Sport & Leisure' },
    ];
  },

  async getQuestions({ amount = 10, categoryId, difficulty, signal }: GetQuestionsOptions) {
    let url = `https://the-trivia-api.com/v2/questions?limit=${amount}`;

    if (categoryId && categoryId !== 'all') {
      url += `&categories=${categoryId}`;
    }
    if (difficulty && difficulty !== 'all') {
      url += `&difficulties=${difficulty}`;
    }

    const response = await axios.get(url, { signal });

    return {
      results: response.data.map((q: {
        question: { text: string };
        correctAnswer: string;
        incorrectAnswers: string[];
        category: string;
        difficulty: string;
      }) => ({
        question: q.question.text,
        correctAnswer: q.correctAnswer,
        incorrectAnswers: q.incorrectAnswers,
        category: q.category,
        difficulty: q.difficulty,
        type: 'multiple' as const
      }))
    };
  },

  difficulties: [
    { value: "all", label: "Any difficulty" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ],

  types: [
    { value: "multiple", label: "Multiple Choice" },
  ],
};

// ============================================================================
// PROVIDER REGISTRY
// ============================================================================
export const providers: Record<string, Provider> = {
  opentdb: openTDBProvider,
  triviaapi: triviaAPIProvider,
};

export const providerList: ProviderListItem[] = [
  { id: 'opentdb', name: 'Open Trivia Database', icon: '📚' },
  { id: 'triviaapi', name: 'The Trivia API', icon: '🎯' },
];

export function getProvider(id: string): Provider {
  return providers[id] ?? providers.opentdb;
}
