import type { NormalizedQuestion } from '../../types';

export type CardQuestion = { category: string; question: string; answer: string };
export type CategoryDef = { id: string; name: string };
export type SnapshotFile = { questions: NormalizedQuestion[] };

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
