import type { NormalizedQuestion } from '../types';

/**
 * Decodes HTML entities in a string (e.g. &amp;amp; → &amp;, &#8217; → ')
 */
const NAMED_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
};

export function decodeHtml(html: string): string {
  return html
    .replace(/&(?:amp|lt|gt|quot|#039|apos);/g, (m) => NAMED_ENTITIES[m])
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
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
