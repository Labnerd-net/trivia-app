import { describe, it, expect } from 'vitest';
import { decodeHtml, shuffleAnswers } from '../src/utils';
import type { NormalizedQuestion } from '../src/types';

describe('decodeHtml', () => {
  it('decodes &amp; to &', () => {
    expect(decodeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  it('decodes &lt; and &gt;', () => {
    expect(decodeHtml('1 &lt; 2 &gt; 0')).toBe('1 < 2 > 0');
  });

  it('decodes &quot;', () => {
    expect(decodeHtml('Say &quot;hello&quot;')).toBe('Say "hello"');
  });

  it('leaves plain strings unchanged', () => {
    expect(decodeHtml('Hello World')).toBe('Hello World');
  });
});

describe('shuffleAnswers', () => {
  const multipleQuestion: NormalizedQuestion = {
    question: 'Q?',
    correctAnswer: 'Correct',
    incorrectAnswers: ['Wrong A', 'Wrong B', 'Wrong C'],
    category: 'Test',
    difficulty: 'easy',
    type: 'multiple',
  };

  const booleanQuestion: NormalizedQuestion = {
    question: 'Q?',
    correctAnswer: 'True',
    incorrectAnswers: ['False'],
    category: 'Test',
    difficulty: 'easy',
    type: 'boolean',
  };

  it('returns ["True", "False"] for boolean questions regardless of correct answer', () => {
    expect(shuffleAnswers(booleanQuestion)).toEqual(['True', 'False']);
    expect(shuffleAnswers({ ...booleanQuestion, correctAnswer: 'False', incorrectAnswers: ['True'] })).toEqual(['True', 'False']);
  });

  it('returns all four answers for a multiple choice question', () => {
    const result = shuffleAnswers(multipleQuestion);
    expect(result).toHaveLength(4);
    expect(result).toContain('Correct');
    expect(result).toContain('Wrong A');
    expect(result).toContain('Wrong B');
    expect(result).toContain('Wrong C');
  });

  it('does not mutate the original question object', () => {
    const original = { ...multipleQuestion, incorrectAnswers: ['Wrong A', 'Wrong B', 'Wrong C'] };
    shuffleAnswers(original);
    expect(original.incorrectAnswers).toEqual(['Wrong A', 'Wrong B', 'Wrong C']);
  });
});
