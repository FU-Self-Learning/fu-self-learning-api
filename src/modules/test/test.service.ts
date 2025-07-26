import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Test, TestType } from 'src/entities/test.entity';
import { TestAttempt, AttemptStatus } from 'src/entities/test-attempt.entity';
import { TestAnswer } from 'src/entities/test-answer.entity';
import { Course } from 'src/entities/course.entity';
import { Topic } from 'src/entities/topic.entity';
import { QuizQuestion } from 'src/entities/quiz-question.entity';
import { User } from 'src/entities/user.entity';
import { QuizQuestionService } from '../quiz-question/quiz-question.service';
import {
  CreateTestDto,
  CreateTestWithQuestionsDto,
  TestResponseDto,
  TestDetailDto,
  TestAttemptResponseDto,
  TestAttemptProgressDto,
  TestAnswerProgressDto,
  StartTestDto,
  SubmitAnswerDto,
  CompleteTestDto,
  TestResultDetailDto,
  TestAnswerDetailDto,
} from './dto';
import { GeminiService } from '../ai-agent/gemini.service';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
    @InjectRepository(TestAttempt)
    private testAttemptRepository: Repository<TestAttempt>,
    @InjectRepository(TestAnswer)
    private testAnswerRepository: Repository<TestAnswer>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
    private quizQuestionService: QuizQuestionService,
    private readonly geminiService: GeminiService,
  ) {}

  async createTest(
    createTestDto: CreateTestDto,
    instructorId: number,
  ): Promise<TestResponseDto> {
    // Kiểm tra course tồn tại và instructor có quyền
    const course = await this.courseRepository.findOne({
      where: { id: createTestDto.courseId },
      relations: ['instructor'],
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructor.id !== instructorId) {
      throw new ForbiddenException(
        'You can only create tests for your own courses',
      );
    }

    // Tạo test mới
    const test = new Test();
    test.title = createTestDto.title;
    test.description = createTestDto.description || '';
    test.course = course;
    test.type = createTestDto.type || TestType.PRACTICE;
    test.duration = createTestDto.duration || 60;
    test.questionCount = createTestDto.questionCount || 10;
    test.passingScore = createTestDto.passingScore || 60;
    test.shuffleQuestions = createTestDto.shuffleQuestions || false;
    test.shuffleAnswers = createTestDto.shuffleAnswers || false;

    // Thêm topics nếu có
    if (createTestDto.topicIds?.length) {
      const topics = await this.topicRepository.findBy({
        id: In(createTestDto.topicIds),
        course: { id: course.id },
      });
      test.topics = topics;
    }

    // Thêm questions nếu có
    if (createTestDto.questionIds?.length) {
      const questions = await this.quizQuestionRepository.findBy({
        id: In(createTestDto.questionIds),
      });
      test.questions = questions;
    } else if (createTestDto.topicIds?.length) {
      // Auto-select questions from topics
      const questions = await this.quizQuestionRepository
        .createQueryBuilder('q')
        .where('q.topicId IN (:...topicIds)', {
          topicIds: createTestDto.topicIds,
        })
        .limit(test.questionCount)
        .orderBy('RANDOM()')
        .getMany();
      test.questions = questions;
    }

    const savedTest = await this.testRepository.save(test);
    return TestResponseDto.fromEntity(savedTest);
  }

  async createTestWithQuestions(
    createTestWithQuestionsDto: CreateTestWithQuestionsDto,
    instructorId: number,
  ): Promise<TestResponseDto> {
    // Kiểm tra course tồn tại và instructor có quyền
    const course = await this.courseRepository.findOne({
      where: { id: createTestWithQuestionsDto.courseId },
      relations: ['instructor'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructor.id !== instructorId) {
      throw new ForbiddenException('You can only create tests for your own courses');
    }

    // Tạo test mới
    const test = new Test();
    test.title = createTestWithQuestionsDto.title;
    test.description = createTestWithQuestionsDto.description || '';
    test.course = course;
    test.type = createTestWithQuestionsDto.type || TestType.PRACTICE;
    test.duration = createTestWithQuestionsDto.duration || 60;
    test.passingScore = createTestWithQuestionsDto.passingScore || 60;
    test.shuffleQuestions = createTestWithQuestionsDto.shuffleQuestions || false;
    test.shuffleAnswers = createTestWithQuestionsDto.shuffleAnswers || false;

    // Thêm topics nếu có
    if (createTestWithQuestionsDto.topicIds?.length) {
      const topics = await this.topicRepository.findBy({
        id: In(createTestWithQuestionsDto.topicIds),
        course: { id: course.id },
      });
      test.topics = topics;
    }

    let createdQuestions: QuizQuestion[] = [];

    // Tạo câu hỏi thủ công nếu có
    if (createTestWithQuestionsDto.questions?.length) {
      const questionDtos = createTestWithQuestionsDto.questions.map(q => ({
        question_text: q.question_text,
        correct_answer: q.correct_answer,
        choices: q.choices,
        topicId: q.topicId,
      }));
      
      createdQuestions = await this.quizQuestionService.createMany(questionDtos);
    }

    // TODO: Tích hợp AI để tự động tạo câu hỏi
    if (createTestWithQuestionsDto.autoGenerate && createTestWithQuestionsDto.autoGenerateCount && createTestWithQuestionsDto.topicIds?.length) {
      // Lấy thông tin topic để lấy tên topic làm prompt
      const topics = await this.topicRepository.findBy({ id: In(createTestWithQuestionsDto.topicIds) });
      const total = createTestWithQuestionsDto.autoGenerateCount;
      const base = Math.floor(total / topics.length);
      let remainder = total % topics.length;
      for (const topic of topics) {
        let count = base + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        const aiQuestionsRaw = await this.geminiService.generateQuestions(
          topic.title,
          topic.id,
          count
        );
        // Lưu vào DB và lấy về QuizQuestion entity
        const aiQuestions = await this.quizQuestionService.createMany(aiQuestionsRaw);
        createdQuestions = [...createdQuestions, ...aiQuestions];
      }
    }

    // Nếu không có câu hỏi mới được tạo, auto-select từ topics
    if (createdQuestions.length === 0 && createTestWithQuestionsDto.topicIds?.length) {
      const existingQuestions = await this.quizQuestionRepository
        .createQueryBuilder('q')
        .where('q.topicId IN (:...topicIds)', { topicIds: createTestWithQuestionsDto.topicIds })
        .limit(10) // default limit
        .orderBy('RANDOM()')
        .getMany();
      createdQuestions = existingQuestions;
    }

    test.questions = createdQuestions;
    test.questionCount = createdQuestions.length;

    const savedTest = await this.testRepository.save(test);
    return TestResponseDto.fromEntity(savedTest);
  }

  async getTestsByCourse(courseId: number, isInstructor = false): Promise<TestResponseDto[]> {
    const where: any = { course: { id: courseId } };
    if (!isInstructor) where.isActive = true;
    const tests = await this.testRepository.find({
      where,
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
    return tests.map((test) => TestResponseDto.fromEntity(test));
  }

  async getTestDetail(testId: number, userId: number): Promise<TestDetailDto> {
    const test = await this.testRepository.findOne({
      where: { id: testId },
      relations: ['course', 'questions', 'topics'],
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (!test.isActive) {
      throw new BadRequestException('Test is not active');
    }

    const dto = new TestDetailDto();
    Object.assign(dto, TestResponseDto.fromEntity(test));

    // Lấy câu hỏi (ẩn đáp án đúng)
    dto.questions = test.questions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      choices: test.shuffleAnswers
        ? this.shuffleArray([...q.choices])
        : q.choices,
      correct_answer: q.correct_answer,
    }));

    // Kiểm tra attempt hiện tại
    const currentAttempt = await this.testAttemptRepository.findOne({
      where: {
        user: { id: userId },
        test: { id: testId },
        status: AttemptStatus.IN_PROGRESS,
      },
      relations: ['test'],
    });

    if (currentAttempt) {
      dto.currentAttempt = TestAttemptResponseDto.fromEntity(currentAttempt);
    }

    return dto;
  }

  async startTest(
    startTestDto: StartTestDto,
    userId: number,
  ): Promise<TestAttemptResponseDto> {
    const test = await this.testRepository.findOne({
      where: { id: startTestDto.testId },
      relations: ['questions'],
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (!test.isActive) {
      throw new BadRequestException('Test is not active');
    }

    // Kiểm tra xem user có attempt đang progress không
    const existingAttempt = await this.testAttemptRepository.findOne({
      where: {
        user: { id: userId },
        test: { id: test.id },
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    if (existingAttempt) {
      throw new BadRequestException(
        'You already have an active attempt for this test',
      );
    }

    // Tạo attempt mới
    const attempt = new TestAttempt();
    attempt.user = { id: userId } as User;
    attempt.test = test;
    attempt.status = AttemptStatus.IN_PROGRESS;
    attempt.startedAt = new Date();
    attempt.totalQuestions = Math.min(
      test.questionCount,
      test.questions.length,
    );

    const savedAttempt = await this.testAttemptRepository.save(attempt);
    return TestAttemptResponseDto.fromEntity(savedAttempt);
  }

  async submitAnswer(
    submitAnswerDto: SubmitAnswerDto,
    userId: number,
  ): Promise<void> {
    const attempt = await this.testAttemptRepository.findOne({
      where: { id: submitAnswerDto.attemptId, user: { id: userId } },
      relations: ['test'],
    });

    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Test attempt is not in progress');
    }

    // Kiểm tra thời gian
    const now = new Date();
    const timeElapsed =
      (now.getTime() - attempt.startedAt.getTime()) / 1000 / 60; // phút
    if (timeElapsed > attempt.test.duration) {
      // Timeout
      attempt.status = AttemptStatus.TIMEOUT;
      await this.testAttemptRepository.save(attempt);
      throw new BadRequestException('Test time has expired');
    }

    const question = await this.quizQuestionRepository.findOne({
      where: { id: submitAnswerDto.questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Kiểm tra xem đã trả lời câu này chưa
    const existingAnswer = await this.testAnswerRepository.findOne({
      where: {
        attempt: { id: attempt.id },
        question: { id: question.id },
      },
    });

    // Nếu đã trả lời rồi thì xóa câu trả lời cũ
    if (existingAnswer) {
      await this.testAnswerRepository.remove(existingAnswer);
    }

    // Kiểm tra đáp án đúng
    const isCorrect = this.checkAnswer(
      question.correct_answer,
      submitAnswerDto.selectedAnswers,
    );

    // Lưu câu trả lời
    const answer = new TestAnswer();
    answer.attempt = attempt;
    answer.question = question;
    answer.selectedAnswers = submitAnswerDto.selectedAnswers;
    answer.isCorrect = isCorrect;
    answer.timeSpent = submitAnswerDto.timeSpent || 0;

    await this.testAnswerRepository.save(answer);
  }

  async completeTest(
    completeTestDto: CompleteTestDto,
    userId: number,
  ): Promise<TestAttemptResponseDto> {
    const attempt = await this.testAttemptRepository.findOne({
      where: { id: completeTestDto.attemptId, user: { id: userId } },
      relations: ['test', 'answers'],
    });

    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Test attempt is not in progress');
    }

    // Tính điểm
    const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
    const totalQuestions = attempt.answers.length;
    const score =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const isPassed = score >= attempt.test.passingScore;

    // Cập nhật attempt
    attempt.status = AttemptStatus.COMPLETED;
    attempt.completedAt = new Date();
    attempt.score = score;
    attempt.correctAnswers = correctCount;
    attempt.totalQuestions = totalQuestions;
    attempt.timeSpent = Math.floor(
      (attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000,
    );
    attempt.isPassed = isPassed;

    const savedAttempt = await this.testAttemptRepository.save(attempt);
    return TestAttemptResponseDto.fromEntity(savedAttempt);
  }

  async getUserTestResults(userId: number, courseId?: number): Promise<TestAttemptResponseDto[]> {
    const whereCondition: any = { user: { id: userId } };
    
    // Nếu có courseId thì lọc theo course
    if (courseId) {
      whereCondition.test = { course: { id: courseId } };
    }

    const attempts = await this.testAttemptRepository.find({
      where: whereCondition,
      relations: ['test', 'test.course'],
      order: { createdAt: 'DESC' },
    });

    return attempts.map((attempt) =>
      TestAttemptResponseDto.fromEntity(attempt),
    );
  }

  async getUserTestResultById(userId: number, testId: number): Promise<TestAttemptResponseDto> {
    const attempt = await this.testAttemptRepository.findOne({
      where: { user: { id: userId }, id: testId },
      relations: ['test'],
    });
    if (!attempt) {
      throw new BadRequestException('Test attempt not found');
    }
    return TestAttemptResponseDto.fromEntity(attempt);
  }

  async getAttemptProgress(attemptId: number, userId: number): Promise<TestAttemptProgressDto> {
    const attempt = await this.testAttemptRepository.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: ['test', 'answers', 'answers.question'],
    });

    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Test attempt is not in progress');
    }

    // Tính thời gian còn lại
    const now = new Date();
    const timeElapsedSeconds = (now.getTime() - attempt.startedAt.getTime()) / 1000;
    const durationSeconds = attempt.test.duration * 60;
    const timeRemaining = Math.max(0, durationSeconds - timeElapsedSeconds);
    const isExpired = timeRemaining <= 0;

    // Lấy thông tin các câu trả lời đã submit
    const answers: TestAnswerProgressDto[] = attempt.answers.map(answer => ({
      questionId: answer.question.id,
      questionText: answer.question.question_text,
      choices: answer.question.choices,
      selectedAnswers: answer.selectedAnswers,
      timeSpent: answer.timeSpent || 0,
      answeredAt: answer.answeredAt,
    }));

    const progressDto: TestAttemptProgressDto = {
      attemptId: attempt.id,
      testId: attempt.test.id,
      testTitle: attempt.test.title,
      status: attempt.status,
      startedAt: attempt.startedAt,
      duration: attempt.test.duration,
      totalQuestions: attempt.totalQuestions,
      answeredCount: attempt.answers.length,
      answers,
      timeRemaining: Math.floor(timeRemaining),
      isExpired,
    };

    return progressDto;
  }

  async getTestResultDetail(attemptId: number, userId: number): Promise<TestResultDetailDto> {
    const attempt = await this.testAttemptRepository.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: ['test', 'answers', 'answers.question'],
    });

    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    if (attempt.status !== AttemptStatus.COMPLETED) {
      throw new BadRequestException('Test attempt is not completed');
    }

    // Lấy thông tin chi tiết các câu trả lời
    const answers: TestAnswerDetailDto[] = attempt.answers.map(answer => ({
      id: answer.id,
      questionId: answer.question.id,
      questionText: answer.question.question_text,
      choices: answer.question.choices,
      correctAnswer: answer.question.correct_answer,
      selectedAnswers: answer.selectedAnswers,
      isCorrect: answer.isCorrect,
      timeSpent: answer.timeSpent || 0,
      answeredAt: answer.answeredAt,
    }));

    const resultDetail = new TestResultDetailDto();
    Object.assign(resultDetail, TestAttemptResponseDto.fromEntity(attempt));
    resultDetail.answers = answers;

    return resultDetail;
  }

  async toggleStatus(id: number): Promise<TestResponseDto> {
    const test = await this.testRepository.findOne({ where: { id } });
    if (!test) throw new Error('Test not found');
    test.isActive = !test.isActive;
    await this.testRepository.save(test);
    return TestResponseDto.fromEntity(test);
  }

  private checkAnswer(
    correctAnswers: string[],
    selectedAnswers: string[],
  ): boolean {
    if (correctAnswers.length !== selectedAnswers.length) {
      return false;
    }

    const sortedCorrect = [...correctAnswers].sort();
    const sortedSelected = [...selectedAnswers].sort();

    return sortedCorrect.every(
      (answer, index) => answer === sortedSelected[index],
    );
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
