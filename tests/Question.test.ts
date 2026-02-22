import { describe, it, expect } from 'vitest';
import { shuffleAnswers } from '../src/utils';
import type { NormalizedQuestion } from '../src/types';

const multipleQuestion: NormalizedQuestion = {
  question: 'What is 2 + 2?',
  correctAnswer: '4',
  incorrectAnswers: ['1', '2', '3'],
  category: 'Math',
  difficulty: 'easy',
  type: 'multiple',
};

const booleanQuestion: NormalizedQuestion = {
  question: 'Is the sky blue?',
  correctAnswer: 'True',
  incorrectAnswers: ['False'],
  category: 'Science',
  difficulty: 'easy',
  type: 'boolean',
};

describe('shuffleAnswers', () => {
  it('returns 4 answers for multiple choice', () => {
    const answers = shuffleAnswers(multipleQuestion);
    expect(answers).toHaveLength(4);
    expect(answers).toContain('4');
    expect(answers).toContain('1');
    expect(answers).toContain('2');
    expect(answers).toContain('3');
  });

  it('returns [True, False] for boolean type', () => {
    const answers = shuffleAnswers(booleanQuestion);
    expect(answers).toEqual(['True', 'False']);
  });
});
