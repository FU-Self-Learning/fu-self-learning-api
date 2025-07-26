import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QuizQuestionService } from './quiz-question.service';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { JwtAuthGuard } from 'src/config/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/config/guards/roles.guard';
import { Roles } from 'src/config/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('quiz-questions')
@UseGuards(JwtAuthGuard)
export class QuizQuestionController {
  constructor(private readonly quizQuestionService: QuizQuestionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Instructor, Role.Admin)
  create(@Body() createQuizQuestionDto: CreateQuizQuestionDto) {
    return this.quizQuestionService.create(createQuizQuestionDto);
  }

  @Get()
  findAll() {
    return this.quizQuestionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizQuestionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {
    return this.quizQuestionService.update(+id, updateQuizQuestionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Instructor, Role.Admin)
  remove(@Param('id') id: string) {
    return this.quizQuestionService.remove(+id);
  }

  @Get('topic/:topicId')
  findByTopic(@Param('topicId') topicId: string) {
    return this.quizQuestionService.findByTopic(+topicId);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizQuestionService.findByCourse(+courseId);
  }
}
