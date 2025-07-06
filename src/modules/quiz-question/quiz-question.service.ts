import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion } from '../../entities/quiz-question.entity';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
  ) {}

  async create(
    createQuizQuestionDto: CreateQuizQuestionDto,
  ): Promise<QuizQuestion> {
    const quizQuestion = this.quizQuestionRepository.create(
      createQuizQuestionDto,
    );
    return this.quizQuestionRepository.save(quizQuestion);
  }

  async findAll(): Promise<QuizQuestion[]> {
    return this.quizQuestionRepository.find({
      relations: ['topic', 'results'],
    });
  }

  async findOne(id: number): Promise<QuizQuestion | null> {
    return this.quizQuestionRepository.findOne({
      where: { id },
      relations: ['topic', 'results'],
    });
  }

  async update(
    id: number,
    updateQuizQuestionDto: UpdateQuizQuestionDto,
  ): Promise<QuizQuestion | null> {
    await this.quizQuestionRepository.update(id, updateQuizQuestionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.quizQuestionRepository.delete(id);
  }
}
