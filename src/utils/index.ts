import type { NormalizedQuestion } from '../types';

/**
 * Decodes HTML entities in a string to prevent XSS while displaying special characters
 */
export function decodeHtml(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export function shuffleAnswers(question: NormalizedQuestion): string[] {
  if (question.type !== 'multiple') {
    return ['True', 'False'];
  }

  const answers = [question.correctAnswer, ...question.incorrectAnswers];

  // Fisher-Yates shuffle
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }

  return answers;
}
