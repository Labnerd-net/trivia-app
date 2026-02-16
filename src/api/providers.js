import axios from 'axios';

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

  async getToken() {
    const response = await axios.get('https://opentdb.com/api_token.php?command=request');
    return response.data.token;
  },

  async getCategories() {
    const response = await axios.get('https://opentdb.com/api_category.php');
    return response.data.trivia_categories.map(cat => ({
      id: cat.id.toString(),
      name: cat.name
    }));
  },

  async getQuestions({ amount = 10, categoryId, difficulty, type, token, signal }) {
    let url = `https://opentdb.com/api.php?amount=${amount}`;

    if (categoryId && categoryId !== 'all') url += `&category=${categoryId}`;
    if (difficulty && difficulty !== 'all') url += `&difficulty=${difficulty}`;
    if (type && type !== 'all') url += `&type=${type}`;
    if (token) url += `&token=${token}`;

    const response = await axios.get(url, { signal });

    return {
      results: response.data.results.map(q => ({
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
const triviaAPIProvider = {
  id: 'triviaapi',
  name: 'The Trivia API',
  description: 'High-quality questions with region filtering',
  requiresToken: false,

  async getToken() {
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

  async getQuestions({ amount = 10, categoryId, difficulty, signal }) {
    let url = `https://the-trivia-api.com/v2/questions?limit=${amount}`;

    if (categoryId && categoryId !== 'all') {
      url += `&categories=${categoryId}`;
    }
    if (difficulty && difficulty !== 'all') {
      url += `&difficulties=${difficulty}`;
    }
    // The Trivia API doesn't support type filtering the same way

    const response = await axios.get(url, { signal });

    return {
      results: response.data.map(q => ({
        question: q.question.text,
        correctAnswer: q.correctAnswer,
        incorrectAnswers: q.incorrectAnswers,
        category: q.category,
        difficulty: q.difficulty,
        type: q.type === 'Multiple Choice' ? 'multiple' : 'boolean'
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
  ],
};

// ============================================================================
// JSERVICE (JEOPARDY) PROVIDER
// ============================================================================
const jServiceProvider = {
  id: 'jservice',
  name: 'jService (Jeopardy!)',
  description: '221,510+ questions from the TV show',
  requiresToken: false,

  async getToken() {
    return null; // No token needed
  },

  async getCategories() {
    // jService has thousands of categories, we'll use popular ones
    // You could fetch from https://jservice.io/api/categories?count=100
    const response = await axios.get('https://jservice.io/api/categories?count=50');
    return response.data.map(cat => ({
      id: cat.id.toString(),
      name: cat.title
    }));
  },

  async getQuestions({ amount = 10, categoryId, signal }) {
    let url = `https://jservice.io/api/clues?count=${amount}`;

    if (categoryId && categoryId !== 'all') {
      url = `https://jservice.io/api/category?id=${categoryId}`;
    }

    const response = await axios.get(url, { signal });

    // jService returns different formats depending on endpoint
    let clues = categoryId && categoryId !== 'all'
      ? response.data.clues
      : response.data;

    // Filter out invalid questions
    clues = clues.filter(q => q && q.question && q.answer);

    return {
      results: clues.slice(0, amount).map(q => ({
        question: q.question,
        correctAnswer: q.answer,
        incorrectAnswers: [], // Jeopardy doesn't have multiple choice
        category: q.category?.title || 'Unknown',
        difficulty: q.value >= 800 ? 'hard' : q.value >= 400 ? 'medium' : 'easy',
        type: 'jeopardy', // Special type for Jeopardy format
        airdate: q.airdate,
        value: q.value
      }))
    };
  },

  difficulties: [
    { value: "all", label: "Any difficulty" },
  ],

  types: [
    { value: "all", label: "Jeopardy! format" },
  ],
};

// ============================================================================
// PROVIDER REGISTRY
// ============================================================================
export const providers = {
  opentdb: openTDBProvider,
  triviaapi: triviaAPIProvider,
  jservice: jServiceProvider,
};

export const providerList = [
  { id: 'opentdb', name: 'Open Trivia Database', icon: '📚' },
  { id: 'triviaapi', name: 'The Trivia API', icon: '🎯' },
  { id: 'jservice', name: 'Jeopardy!', icon: '🎮' },
];

export function getProvider(id) {
  return providers[id] || providers.opentdb;
}
