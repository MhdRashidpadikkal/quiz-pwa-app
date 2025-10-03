
export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

export type QuizStatus = 'idle' | 'active' | 'finished';

export interface QuizState {
  status: QuizStatus;
  questions: Question[];
  currentIndex: number;
  answers: (string | null)[];
}

export type QuizAction =
  | { type: 'START_QUIZ' }
  | { type: 'SELECT_ANSWER'; payload: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'RESTART_QUIZ' };
