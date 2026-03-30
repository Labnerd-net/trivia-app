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

  it('decodes &#039; to apostrophe', () => {
    expect(decodeHtml('it&#039;s')).toBe("it's");
  });

  it('decodes numeric decimal entities', () => {
    expect(decodeHtml('it&#8217;s')).toBe('it\u2019s');
  });

  it('decodes numeric hex entities', () => {
    expect(decodeHtml('it&#x2019;s')).toBe('it\u2019s');
  });

  it('leaves plain strings unchanged', () => {
    expect(decodeHtml('Hello World')).toBe('Hello World');
  });

  it('handles empty string', () => {
    expect(decodeHtml('')).toBe('');
  });

  it('decodes &nbsp; to non-breaking space', () => {
    expect(decodeHtml('Hello&nbsp;World')).toBe('Hello\u00A0World');
  });

  it('decodes &eacute; to é', () => {
    expect(decodeHtml('Caf&eacute;')).toBe('Café');
  });

  it('decodes &ndash; to –', () => {
    expect(decodeHtml('2010&ndash;2020')).toBe('2010\u20132020');
  });

  it('decodes &rsquo; to right single quotation mark', () => {
    expect(decodeHtml('Don&rsquo;t')).toBe('Don\u2019t');
  });

  it('decodes &mdash; to —', () => {
    expect(decodeHtml('yes&mdash;no')).toBe('yes\u2014no');
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

  it('returns [] for open questions', () => {
    const openQuestion: NormalizedQuestion = {
      question: 'Q?',
      correctAnswer: 'Some answer',
      incorrectAnswers: [],
      category: 'Test',
      difficulty: 'easy',
      type: 'open',
    };
    expect(shuffleAnswers(openQuestion)).toEqual([]);
  });

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
