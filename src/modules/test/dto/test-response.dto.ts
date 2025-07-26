import { TestType, Test } from 'src/entities/test.entity';
import { AttemptStatus, TestAttempt } from 'src/entities/test-attempt.entity';

export class TestResponseDto {
  id: number;
  title: string;
  description: string;
  type: TestType;
  duration: number;
  questionCount: number;
  passingScore: number;
  isActive: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  createdAt: Date;
  courseId: number;
  courseTitle: string;
  topics?: { id: number; title: string }[];

  static fromEntity(test: Test): TestResponseDto {
    const dto = new TestResponseDto();
    dto.id = test.id;
    dto.title = test.title;
    dto.description = test.description;
    dto.type = test.type;
    dto.duration = test.duration;
    dto.questionCount = test.questionCount;
    dto.passingScore = test.passingScore;
    dto.isActive = test.isActive;
    dto.shuffleQuestions = test.shuffleQuestions;
    dto.shuffleAnswers = test.shuffleAnswers;
    dto.createdAt = test.createdAt;
    dto.courseId = test.course?.id;
    dto.courseTitle = test.course?.title;
    dto.topics = (test.topics || []).map((t) => ({ id: t.id, title: t.title }));
    return dto;
  }
}

export class TestAttemptResponseDto {
  id: number;
  status: AttemptStatus;
  startedAt: Date;
  completedAt: Date;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  isPassed: boolean;
  testId: number;
  testTitle: string;

  static fromEntity(attempt: TestAttempt): TestAttemptResponseDto {
    const dto = new TestAttemptResponseDto();
    dto.id = attempt.id;
    dto.status = attempt.status;
    dto.startedAt = attempt.startedAt;
    dto.completedAt = attempt.completedAt;
    dto.score = attempt.score;
    dto.correctAnswers = attempt.correctAnswers;
    dto.totalQuestions = attempt.totalQuestions;
    dto.timeSpent = attempt.timeSpent;
    dto.isPassed = attempt.isPassed;
    dto.testId = attempt.test?.id;
    dto.testTitle = attempt.test?.title;
    return dto;
  }
}

export class TestQuestionDto {
  id: number;
  question_text: string;
  choices: string[];
  timeSpent?: number;
  selectedAnswers?: string[];
}

export class TestDetailDto extends TestResponseDto {
  questions: TestQuestionDto[];
  currentAttempt?: TestAttemptResponseDto;
}

export class TestAnswerDetailDto {
  id: number;
  questionId: number;
  questionText: string;
  choices: string[];
  correctAnswer: string[];
  selectedAnswers: string[];
  isCorrect: boolean;
  timeSpent: number;
  answeredAt: Date;
}

export class TestResultDetailDto extends TestAttemptResponseDto {
  answers: TestAnswerDetailDto[];
} 