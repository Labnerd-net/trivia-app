import axiosInstance from './axiosInstance';
import type { Provider, GetQuestionsOptions } from '../types';

/**
 * Trivia API Provider Configurations
 * Each provider has methods to fetch categories and questions,
 * and adapters to normalize responses to a common format
 */

// ============================================================================
// OPENTDB PROVIDER
// ============================================================================
const openTDBProvider = {
  id: 'opentdb',
  name: 'Open Trivia Database',
  description: 'Large community database with 4,000+ questions',
  requiresToken: true,
  tokenUrl: 'https://opentdb.com/api_token.php?command=request',

  async getCategories({ signal } = {}) {
    const response = await axiosInstance.get('https://opentdb.com/api_category.php', { signal });
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

    const response = await axiosInstance.get(url, { signal });

    const code = response.data.response_code;
    if (code === 1) throw new Error('No results found for the selected options. Try a different category or difficulty.');
    if (code === 2) throw new Error('Invalid query parameters.');
    if (code === 3) throw new Error('Session token not found. Please refresh the page.');
    if (code === 4) throw new Error('Session token exhausted — you\'ve seen all questions for this combination. Try different settings or refresh.');
    if (code === 5) throw new Error('Too many requests. Please wait a moment and try again.');

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
} satisfies Provider;

// ============================================================================
// THE TRIVIA API PROVIDER
// ============================================================================
const triviaAPIProvider = {
  id: 'triviaapi',
  name: 'The Trivia API',
  description: 'High-quality questions with region filtering',
  requiresToken: false,

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

    const response = await axiosInstance.get(url, { signal });

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
} satisfies Provider;

// ============================================================================
// ALL OF US PROVIDER (local card data)
// ============================================================================
type CardQuestion = { category: string; question: string; answer: string };
let allOfUsCache: CardQuestion[] | null = null;

async function loadAllOfUs(signal?: AbortSignal): Promise<CardQuestion[]> {
  if (allOfUsCache) return allOfUsCache;
  const response = await axiosInstance.get<{ questions: CardQuestion[] }>('/data/all_of_us.json', { signal });
  allOfUsCache = response.data.questions;
  return allOfUsCache;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const allOfUsProvider = {
  id: 'allofus',
  name: 'All Of Us',
  description: 'Generational trivia questions from physical card sets',
  requiresToken: false,

  async getCategories() {
    return [
      { id: 'boomers', name: 'Boomers' },
      { id: 'gen_x', name: 'Gen X' },
      { id: 'millennials', name: 'Millennials' },
      { id: 'gen_z', name: 'Gen Z' },
    ];
  },

  async getQuestions({ amount = 10, categoryId, signal }: GetQuestionsOptions) {
    const categoryNameById: Record<string, string> = {
      boomers: 'Boomers',
      gen_x: 'Gen X',
      millennials: 'Millennials',
      gen_z: 'Gen Z',
    };
    const all = await loadAllOfUs(signal);
    const categoryName = categoryId ? categoryNameById[categoryId] : null;
    const pool = categoryName ? all.filter(q => q.category === categoryName) : all;
    const selected = shuffleArray(pool).slice(0, amount);
    return {
      results: selected.map(q => ({
        question: q.question,
        correctAnswer: q.answer,
        incorrectAnswers: [],
        category: q.category,
        difficulty: 'all',
        type: 'open' as const,
      }))
    };
  },

  difficulties: [
    { value: 'all', label: 'Any difficulty' },
  ],

  types: [
    { value: 'open', label: 'Open Answer' },
  ],
} satisfies Provider;

// ============================================================================
// PROVIDER REGISTRY
// ============================================================================
export const providers: Record<string, Provider> = {
  opentdb: openTDBProvider,
  triviaapi: triviaAPIProvider,
  allofus: allOfUsProvider,
};

export const providerList = Object.values(providers);

export function getProvider(id: string): Provider {
  return providers[id] ?? providers.opentdb;
}
