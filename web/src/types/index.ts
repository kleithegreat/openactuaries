import { Prisma } from '@prisma/client';

export interface Choice {
  letter: string;
  content: string;
}

export type ProblemWithTypedChoices = Omit<
  Prisma.ProblemGetPayload<{
    select: {
      id: true;
      exam: true;
      questionNumber: true;
      statement: true;
      choices: true;
      correctAnswer: true;
      explanation: true;
      syllabusCategory: true;
      severity: true;
      createdAt: true;
      updatedAt: true;
    };
  }>,
  'choices'
> & {
  choices: Choice[];
};

export type Problem = ProblemWithTypedChoices;

export * from '../archive/analytics/types/analytics';
