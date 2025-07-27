import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { TestService } from './test.service';
import { JwtAuthGuard } from 'src/config/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/config/guards/roles.guard';
import { Roles } from 'src/config/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/user.decorator';
import { Role } from 'src/common/enums/role.enum';
import {
  CreateTestDto,
  CreateTestWithQuestionsDto,
  CreateTopicExamDto,
  CreateFinalExamDto,
  StartTestDto,
  SubmitAnswerDto,
  CompleteTestDto,
  TestResponseDto,
  TestAttemptResponseDto,
  TestAttemptProgressDto,
  TestDetailDto,
  TestResultDetailDto,
  TopicExamResponseDto,
  FinalExamResponseDto,
  CourseProgressDto,
  TopicProgressDto,
} from './dto';
import { GeminiService } from '../ai-agent/gemini.service';

@Controller('tests')
@UseGuards(JwtAuthGuard)
export class TestController {
  constructor(
    private readonly testService: TestService,
    private readonly geminiService: GeminiService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Instructor, Role.Admin)
  async createTest(
    @Body() createTestDto: CreateTestDto,
    @GetUser() instructor: any,
  ): Promise<TestResponseDto> {
    return this.testService.createTest(createTestDto, Number(instructor.id));
  }

  @Post('with-questions')
  @UseGuards(RolesGuard)
  @Roles(Role.Instructor, Role.Admin)
  async createTestWithQuestions(
    @Body() createTestWithQuestionsDto: CreateTestWithQuestionsDto,
    @GetUser() instructor: any,
  ): Promise<TestResponseDto> {
    return this.testService.createTestWithQuestions(createTestWithQuestionsDto, Number(instructor.id));
  }

  @Post('topic-exam')
  @UseGuards(RolesGuard)
  @Roles(Role.Instructor, Role.Admin)
  async createTopicExam(
    @Body() createTopicExamDto: CreateTopicExamDto,
    @GetUser() instructor: any,
  ): Promise<TestResponseDto> {
    return this.testService.createTopicExam(createTopicExamDto, Number(instructor.id));
  }

  @Post('final-exam')
  @UseGuards(RolesGuard)
  @Roles(Role.Instructor, Role.Admin)
  async createFinalExam(
    @Body() createFinalExamDto: CreateFinalExamDto,
    @GetUser() instructor: any,
  ): Promise<TestResponseDto> {
    return this.testService.createFinalExam(createFinalExamDto, Number(instructor.id));
  }

  @Get('course/:courseId/instructor')
  @UseGuards(RolesGuard)
  @Roles(Role.Instructor, Role.Admin)
  async getTestsByCourseForInstructor(@Param('courseId') courseId: number): Promise<TestResponseDto[]> {
    return this.testService.getTestsByCourse(courseId, true);
  }

  @Get('course/:courseId')
  async getTestsByCourse(@Param('courseId') courseId: number): Promise<TestResponseDto[]> {
    return this.testService.getTestsByCourse(courseId, false);
  }

  @Get('course/:courseId/topic-exams')
  async getTopicExams(
    @Param('courseId') courseId: number,
    @GetUser() user: any,
  ): Promise<TopicExamResponseDto[]> {
    return this.testService.getTopicExams(courseId, user.id);
  }

  @Get('course/:courseId/final-exam')
  async getFinalExam(
    @Param('courseId') courseId: number,
    @GetUser() user: any,
  ): Promise<FinalExamResponseDto | null> {
    return this.testService.getFinalExam(courseId, user.id);
  }

  @Get('course/:courseId/progress')
  async getCourseProgress(
    @Param('courseId') courseId: number,
    @GetUser() user: any,
  ): Promise<CourseProgressDto> {
    return this.testService.getCourseProgress(courseId, user.id);
  }

  @Get('topic/:topicId/progress')
  async getTopicProgress(
    @Param('topicId') topicId: number,
    @GetUser() user: any,
  ): Promise<TopicProgressDto> {
    return this.testService.getTopicProgress(topicId, user.id);
  }

  @Get('topic/:topicId/can-start-exam')
  async canStartTopicExam(
    @Param('topicId') topicId: number,
    @GetUser() user: any,
  ): Promise<{ canStart: boolean }> {
    const canStart = await this.testService.canStartTopicExam(topicId, user.id);
    return { canStart };
  }

  @Get('course/:courseId/can-start-final-exam')
  async canStartFinalExam(
    @Param('courseId') courseId: number,
    @GetUser() user: any,
  ): Promise<{ canStart: boolean }> {
    const canStart = await this.testService.canStartFinalExam(courseId, user.id);
    return { canStart };
  }

  @Get('result/:testId')
  async getUserTestResultById(
    @Param('testId') testId: number,
    @GetUser() user: any,
  ): Promise<TestAttemptResponseDto> {
    return this.testService.getUserTestResultById(user.id, testId);
  }

  @Get(':id')
  async getTestDetail(
    @Param('id') testId: number,
    @GetUser() user: any,
  ): Promise<TestDetailDto> {
    return this.testService.getTestDetail(testId, user.id);
  }

  @Post('start')
  async startTest(
    @Body() startTestDto: StartTestDto,
    @GetUser() user: any,
  ): Promise<TestAttemptResponseDto> {
    return this.testService.startTest(startTestDto, user.id);
  }

  @Post('answer')
  async submitAnswer(
    @Body() submitAnswerDto: SubmitAnswerDto,
    @GetUser() user: any,
  ): Promise<{ message: string }> {
    await this.testService.submitAnswer(submitAnswerDto, user.id);
    return { message: 'Answer submitted successfully' };
  }

  @Post('complete')
  async completeTest(
    @Body() completeTestDto: CompleteTestDto,
    @GetUser() user: any,
  ): Promise<TestAttemptResponseDto> {
    return this.testService.completeTest(completeTestDto, user.id);
  }

  @Get('results/my')
  async getMyTestResults(
    @GetUser() user: any,
    @Query('courseId') courseId?: number,
  ): Promise<TestAttemptResponseDto[]> {
    const results = await this.testService.getUserTestResults(user.id, courseId);
    return results;
  }

  @Get('attempt/:attemptId/progress')
  async getAttemptProgress(
    @Param('attemptId') attemptId: number,
    @GetUser() user: any,
  ): Promise<TestAttemptProgressDto> {
    return this.testService.getAttemptProgress(attemptId, user.id);
  }

  @Get('result/:attemptId/detail')
  async getTestResultDetail(
    @Param('attemptId') attemptId: number,
    @GetUser() user: any,
  ): Promise<TestResultDetailDto> {
    return this.testService.getTestResultDetail(attemptId, user.id);
  }

  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(Role.Instructor, Role.Admin)
  async toggleStatus(@Param('id') id: number) {
    return this.testService.toggleStatus(id);
  }

  @Post('explain-answer')
  @UseGuards(JwtAuthGuard)
  async explainAnswer(
    @Body() body: {
      questionText: string;
      choices: string[];
      correctAnswers: string[];
      selectedAnswers: string[];
      isCorrect: boolean;
      topicContext?: string;
    },
    @GetUser() user: any,
  ) {
    return await this.geminiService.explainAnswer(
      body.questionText,
      body.choices,
      body.correctAnswers,
      body.selectedAnswers,
      body.isCorrect,
      body.topicContext,
    );
  }
} 