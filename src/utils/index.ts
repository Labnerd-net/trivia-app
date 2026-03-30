import he from 'he';
import type { NormalizedQuestion } from '../types';

export function decodeHtml(html: string): string {
  return he.decode(html);
}

export function shuffleAnswers(question: NormalizedQuestion): string[] {
  if (question.type === 'open') return [];
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
