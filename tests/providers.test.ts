import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getProvider } from '../src/api/providers';

vi.mock('axios');
const mockGet = vi.mocked(axios.get);

describe('OpenTDB getQuestions response codes', () => {
  const provider = getProvider('opentdb');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns results when response_code is 0', async () => {
    mockGet.mockResolvedValue({
      data: {
        response_code: 0,
        results: [{
          question: 'Q?',
          correct_answer: 'A',
          incorrect_answers: ['B', 'C', 'D'],
          category: 'Test',
          difficulty: 'easy',
          type: 'multiple',
        }],
      },
    });
    const result = await provider.getQuestions({ amount: 1 });
    expect(result.results).toHaveLength(1);
    expect(result.results[0].correctAnswer).toBe('A');
  });

  it('throws on response_code 1 (no results)', async () => {
    mockGet.mockResolvedValue({ data: { response_code: 1, results: [] } });
    await expect(provider.getQuestions({ amount: 10 })).rejects.toThrow('No results found');
  });

  it('throws on response_code 2 (invalid parameter)', async () => {
    mockGet.mockResolvedValue({ data: { response_code: 2, results: [] } });
    await expect(provider.getQuestions({ amount: 10 })).rejects.toThrow('Invalid query parameters');
  });

  it('throws on response_code 3 (token not found)', async () => {
    mockGet.mockResolvedValue({ data: { response_code: 3, results: [] } });
    await expect(provider.getQuestions({ amount: 10 })).rejects.toThrow('Session token not found');
  });

  it('throws on response_code 4 (token exhausted)', async () => {
    mockGet.mockResolvedValue({ data: { response_code: 4, results: [] } });
    await expect(provider.getQuestions({ amount: 10 })).rejects.toThrow('Session token exhausted');
  });

  it('throws on response_code 5 (rate limit)', async () => {
    mockGet.mockResolvedValue({ data: { response_code: 5, results: [] } });
    await expect(provider.getQuestions({ amount: 10 })).rejects.toThrow('Too many requests');
  });
});

describe('getProvider', () => {
  it('returns opentdb provider for id "opentdb"', () => {
    const provider = getProvider('opentdb');
    expect(provider.id).toBe('opentdb');
  });

  it('returns triviaapi provider for id "triviaapi"', () => {
    const provider = getProvider('triviaapi');
    expect(provider.id).toBe('triviaapi');
  });

  it('falls back to opentdb for unknown id', () => {
    const provider = getProvider('unknown');
    expect(provider.id).toBe('opentdb');
  });
});
