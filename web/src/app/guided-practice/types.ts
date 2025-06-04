export interface Problem {
  id: string;
  exam: string;
  questionNumber: number;
  statement: string;
  choices: Choice[];
  correctAnswer: string;
  explanation: string;
  syllabusCategory: string;
  severity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Choice {
  letter: string;
  content: string;
}

export interface Answer {
  problemId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface SessionConfig {
  problemCount: number;
  focusArea: 'recommended' | 'weakest' | 'exam' | 'specific';
  specificTopic?: string;
  timeLimit: number;
  examType: string;
}
