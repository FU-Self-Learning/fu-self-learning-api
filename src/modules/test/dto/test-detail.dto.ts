import { TestType } from '../../../entities/test.entity';

export class TestDetailDto {
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
  courseId: number;
  courseTitle: string;
  topics?: { id: number; title: string }[];
  questions?: { id: number; questionText: string; choices: string[] }[];
  createdAt: Date;
  updatedAt: Date;
} 