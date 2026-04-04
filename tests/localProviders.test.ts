import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '../src/api/axiosInstance';
import { allOfUsProvider } from '../src/api/adapters/localProviders';

vi.mock('../src/api/axiosInstance', () => ({
  default: { get: vi.fn() },
}));
const mockGet = vi.mocked(axiosInstance.get);

const makeQuestions = (category: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    category,
    question: `${category} Q${i + 1}`,
    answer: `${category} A${i + 1}`,
  }));

// Use allOfUsProvider as a representative local provider.
// We reset the module's dataPromise between tests via vi.resetModules — instead,
// we exploit that a failed fetch resets dataPromise, so we just re-mock each test.

describe('local provider seen-question tracking', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function getProvider() {
    const { allOfUsProvider: p } = await import('../src/api/adapters/localProviders');
    return p;
  }

  it('does not return duplicate questions within a single pass', async () => {
    const questions = makeQuestions('Boomers', 6);
    mockGet.mockResolvedValue({ data: { questions } });
    const provider = await getProvider();

    const first = await provider.getQuestions({ amount: 3, categoryId: 'boomers' });
    const second = await provider.getQuestions({ amount: 3, categoryId: 'boomers' });

    const firstTexts = first.results.map(q => q.question);
    const secondTexts = second.results.map(q => q.question);
    const overlap = firstTexts.filter(q => secondTexts.includes(q));
    expect(overlap).toHaveLength(0);
  });

  it('resets and returns questions after pool is exhausted', async () => {
    const questions = makeQuestions('Boomers', 4);
    mockGet.mockResolvedValue({ data: { questions } });
    const provider = await getProvider();

    // Exhaust the pool (2 + 2 = 4)
    await provider.getQuestions({ amount: 2, categoryId: 'boomers' });
    await provider.getQuestions({ amount: 2, categoryId: 'boomers' });

    // Next call should reset and return questions without error
    const third = await provider.getQuestions({ amount: 2, categoryId: 'boomers' });
    expect(third.results).toHaveLength(2);
  });

  it('tracks categories independently', async () => {
    const questions = [
      ...makeQuestions('Boomers', 3),
      ...makeQuestions('Gen X', 3),
    ];
    mockGet.mockResolvedValue({ data: { questions } });
    const provider = await getProvider();

    // Exhaust Boomers
    await provider.getQuestions({ amount: 3, categoryId: 'boomers' });

    // Gen X should be unaffected
    const genX = await provider.getQuestions({ amount: 3, categoryId: 'gen_x' });
    expect(genX.results).toHaveLength(3);
  });

  it('"all" category tracks separately from named categories', async () => {
    const questions = [
      ...makeQuestions('Boomers', 2),
      ...makeQuestions('Gen X', 2),
    ];
    mockGet.mockResolvedValue({ data: { questions } });
    const provider = await getProvider();

    // Consume 2 from "all" (full pool of 4, takes 2)
    await provider.getQuestions({ amount: 2 });

    // Named category should still have its full pool unseen
    const boomers = await provider.getQuestions({ amount: 2, categoryId: 'boomers' });
    expect(boomers.results).toHaveLength(2);
  });

  it('resets when amount requested exceeds remaining unseen questions', async () => {
    const questions = makeQuestions('Boomers', 3);
    mockGet.mockResolvedValue({ data: { questions } });
    const provider = await getProvider();

    // See 2 of 3
    await provider.getQuestions({ amount: 2, categoryId: 'boomers' });

    // Request 3 but only 1 unseen — should reset and return 3
    const result = await provider.getQuestions({ amount: 3, categoryId: 'boomers' });
    expect(result.results).toHaveLength(3);
  });
});

// Smoke test: allOfUsProvider export is unchanged
describe('allOfUsProvider', () => {
  it('has the correct id', () => {
    expect(allOfUsProvider.id).toBe('allofus');
  });
});
