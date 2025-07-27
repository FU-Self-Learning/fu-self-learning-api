import { TestType } from '../../../entities/test.entity';

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
  requireVideoCompletion: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(test: any): TestResponseDto {
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
    dto.requireVideoCompletion = test.requireVideoCompletion;
    dto.order = test.order;
    dto.createdAt = test.createdAt;
    dto.updatedAt = test.updatedAt;
    return dto;
  }
}

export class TopicExamResponseDto extends TestResponseDto {
  topicId: number;
  topicTitle: string;
  isVideoCompleted: boolean;
  isAvailable: boolean;
  // Add attempt information for progress tracking
  currentAttempt?: {
    id: number;
    status: string;
    startedAt: Date;
    score?: number;
    isPassed?: boolean;
  };
  lastAttempt?: {
    id: number;
    status: string;
    completedAt: Date;
    score: number;
    isPassed: boolean;
  };
  canRetry: boolean;
  attemptCount: number;
}

export class FinalExamResponseDto extends TestResponseDto {
  isAllTopicExamsCompleted: boolean;
  completedTopicExams: number;
  totalTopicExams: number;
  isAvailable: boolean;
}

export class TestAttemptResponseDto {
  id: number;
  testId: number;
  testTitle: string;
  userId: number;
  status: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  startedAt: Date;
  completedAt: Date;
  isPassed: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: any): TestAttemptResponseDto {
    const dto = new TestAttemptResponseDto();
    dto.id = entity.id;
    dto.testId = entity.test?.id || 0;
    dto.testTitle = entity.test?.title || '';
    dto.userId = entity.user?.id || 0;
    dto.status = entity.status;
    dto.score = entity.score ? Number(entity.score) : 0;
    dto.correctAnswers = entity.correctAnswers;
    dto.totalQuestions = entity.totalQuestions;
    dto.timeSpent = entity.timeSpent;
    dto.startedAt = entity.startedAt;
    dto.completedAt = entity.completedAt;
    dto.isPassed = entity.isPassed;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
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

export class CourseProgressDto {
  courseId: number;
  courseTitle: string;
  totalTopics: number;
  completedTopics: number;
  totalLessons: number;
  completedLessons: number;
  totalTopicExams: number;
  completedTopicExams: number;
  finalExamCompleted: boolean;
  finalExamScore?: number;
  certificateEarned: boolean;
  certificateUrl?: string;
  progressPercentage: number;
}

export class TopicProgressDto {
  topicId: number;
  topicTitle: string;
  totalLessons: number;
  completedLessons: number;
  topicExamCompleted: boolean;
  topicExamScore?: number;
  progressPercentage: number;
  isAvailable: boolean;
} 