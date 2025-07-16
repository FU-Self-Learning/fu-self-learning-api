import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
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
  StartTestDto,
  SubmitAnswerDto,
  CompleteTestDto,
  TestResponseDto,
  TestAttemptResponseDto,
  TestAttemptProgressDto,
  TestDetailDto,
} from './dto';

@Controller('tests')
@UseGuards(JwtAuthGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

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

  @Get('course/:courseId')
  async getTestsByCourse(@Param('courseId') courseId: number): Promise<TestResponseDto[]> {
    return this.testService.getTestsByCourse(courseId);
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

  @Get('results/me')
  async getMyTestResults(@GetUser() user: any): Promise<TestAttemptResponseDto[]> {
    return this.testService.getUserTestResults(user.id);
  }
  

  @Get('attempt/:attemptId/progress')
  async getAttemptProgress(
    @Param('attemptId') attemptId: number,
    @GetUser() user: any,
  ): Promise<TestAttemptProgressDto> {
    return this.testService.getAttemptProgress(attemptId, user.id);
  }
} 