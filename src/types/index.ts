export interface Category {
  id: string;
  name: string;
}

export type QuestionType = 'multiple' | 'boolean';

export interface NormalizedQuestion {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  category: string;
  difficulty: string;
  type: QuestionType;
}

export interface QuestionsResult {
  results: NormalizedQuestion[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface GetQuestionsOptions {
  amount?: number;
  categoryId?: string;
  difficulty?: string;
  type?: string;
  token?: string | null;
  signal?: AbortSignal;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  requiresToken: boolean;
  difficulties: SelectOption[];
  types: SelectOption[];
  getToken(): Promise<string | null>;
  getCategories(options?: { signal?: AbortSignal }): Promise<Category[]>;
  getQuestions(options: GetQuestionsOptions): Promise<QuestionsResult>;
}

export interface ProviderListItem {
  id: string;
  name: string;
  icon: string;
}
