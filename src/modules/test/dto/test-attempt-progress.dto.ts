import { AttemptStatus } from 'src/entities/test-attempt.entity';

export class TestAnswerProgressDto {
  questionId: number;
  questionText: string;
  choices: string[];
  selectedAnswers: string[];
  timeSpent: number;
  answeredAt: Date;
}

export class TestAttemptProgressDto {
  attemptId: number;
  testId: number;
  testTitle: string;
  status: AttemptStatus;
  startedAt: Date;
  duration: number; // phút
  totalQuestions: number;
  answeredCount: number;
  answers: TestAnswerProgressDto[];
  timeRemaining: number; // giây còn lại
  isExpired: boolean;
}
