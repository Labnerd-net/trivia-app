import axiosInstance from '../axiosInstance';
import type { Provider, GetQuestionsOptions } from '../../types';

export const openTDBProvider = {
  id: 'opentdb',
  name: 'Open Trivia Database',
  description: 'Large community database with 4,000+ questions — live',
  group: 'Online',
  requiresToken: true,
  tokenUrl: 'https://opentdb.com/api_token.php?command=request',

  async getCategories({ signal } = {}) {
    const response = await axiosInstance.get('https://opentdb.com/api_category.php', { signal });
    return [
      { id: 'all', name: 'Any Category' },
      ...response.data.trivia_categories.map((cat: { id: number; name: string }) => ({
        id: cat.id.toString(),
        name: cat.name
      })),
    ];
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
