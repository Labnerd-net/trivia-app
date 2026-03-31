import axiosInstance from '../axiosInstance';
import type { Provider, GetQuestionsOptions, NormalizedQuestion } from '../../types';
import { shuffleArray } from './utils';
import type { SnapshotFile } from './utils';

function makeSnapshotProvider(
  id: string,
  name: string,
  description: string,
  dataFile: string,
) {
  let dataPromise: Promise<NormalizedQuestion[]> | null = null;

  function load(signal?: AbortSignal) {
    if (!dataPromise) {
      dataPromise = axiosInstance
        .get<SnapshotFile>(dataFile, { signal })
        .then(r => r.data.questions)
        .catch(err => { dataPromise = null; throw err; });
    }
    return dataPromise;
  }

  return {
    id,
    name,
    description,
    group: 'Offline',
    requiresToken: false,

    async getCategories({ signal } = {}) {
      const questions = await load(signal);
      const unique = [...new Set(questions.map(q => q.category))].sort();
      return [
        { id: 'all', name: 'Any Category' },
        ...unique.map(c => ({ id: c, name: c })),
      ];
    },

    async getQuestions({ amount = 10, categoryId, difficulty, type, signal }: GetQuestionsOptions) {
      const questions = await load(signal);
      let pool = questions;
      if (categoryId && categoryId !== 'all') pool = pool.filter(q => q.category === categoryId);
      if (difficulty && difficulty !== 'all') pool = pool.filter(q => q.difficulty === difficulty);
      if (type && type !== 'all') pool = pool.filter(q => q.type === type);
      return { results: shuffleArray(pool).slice(0, amount) };
    },

    difficulties: [
      { value: 'all', label: 'Any difficulty' },
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
    ],

    types: [
      { value: 'all', label: 'Any type' },
      { value: 'multiple', label: 'Multiple Choice' },
      { value: 'boolean', label: 'True/False' },
    ],
  } satisfies Provider;
}

export const opentdbOfflineProvider = makeSnapshotProvider(
  'opentdb-offline',
  'Open Trivia DB (Offline)',
  'Offline snapshot of OpenTDB (4,546 questions)',
  '/data/opentdb_snapshot.json',
);

export const triviaAPIOfflineProvider = makeSnapshotProvider(
  'triviaapi-offline',
  'The Trivia API (Offline)',
  'Offline snapshot of The Trivia API (1,482 questions)',
  '/data/triviaapi_snapshot.json',
);
