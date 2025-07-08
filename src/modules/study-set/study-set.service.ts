import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StudySet } from '../../entities/study-set.entity';
import { User } from '../../entities/user.entity';
import { Flashcard } from '../../entities/flashcard.entity';
import { CreateStudySetDto } from './dto/create-study-set.dto';
import { UpdateStudySetDto } from './dto/update-study-set.dto';
import { ResponseStudySetDto } from './dto/response-study-set.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class StudySetService {
  constructor(
    @InjectRepository(StudySet)
    private readonly studySetRepo: Repository<StudySet>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Flashcard)
    private readonly flashcardRepo: Repository<Flashcard>,
  ) {}

  async create(userId: number, dto: CreateStudySetDto): Promise<StudySet> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let flashcards: Flashcard[] = [];
    if (dto.type === 'course') {
      // Từ 1 course
      flashcards = await this.flashcardRepo.find({
        where: { course: { id: dto.courseId } },
        relations: ['course', 'topic', 'lesson'],
      });
    } else if (dto.type === 'multi-course') {
      const allFlashcards = await this.flashcardRepo.find({
        where: { course: { id: In(dto.courseIds || []) } },
        relations: ['course', 'topic', 'lesson'],
      });
      flashcards = this.shuffleArray(allFlashcards).slice(0, dto.limit || 20);
    } else if (dto.type === 'random') {
      const allFlashcards = await this.flashcardRepo.find();
      flashcards = this.shuffleArray(allFlashcards).slice(0, dto.limit || 20);
    } else if (dto.type === 'custom') {
      flashcards = await this.flashcardRepo.find({
        where: { id: In(dto.flashcardIds || []) },
      });
    } else {
      throw new BadRequestException('Invalid study set type');
    }

    const studySet = this.studySetRepo.create({
      name: dto.name,
      description: dto.description,
      tags: dto.tags,
      isPublic: dto.isPublic,
      user,
      flashcards,
    });
    return this.studySetRepo.save(studySet);
  }

  async findAllByUser(userId: number): Promise<ResponseStudySetDto[]> {
    const studySets = await this.studySetRepo.find({
      where: { user: { id: userId } },
      relations: ['flashcards', 'user'],
      order: { createdAt: 'DESC' },
    });
    return plainToInstance(ResponseStudySetDto, studySets, {
      excludeExtraneousValues: true,
    });
  }

  async findOneById(id: number, userId: number): Promise<StudySet> {
    const studySet = await this.studySetRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['flashcards'],
    });
    if (!studySet) throw new NotFoundException('Study set not found');
    return studySet;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateStudySetDto,
  ): Promise<StudySet> {
    const studySet = await this.findOneById(id, userId);
    Object.assign(studySet, dto);
    return this.studySetRepo.save(studySet);
  }

  async remove(id: number, userId: number): Promise<void> {
    const studySet = await this.findOneById(id, userId);
    await this.studySetRepo.remove(studySet);
  }

  private shuffleArray<T>(array: T[]): T[] {
    return array
      .map((a) => [Math.random(), a] as [number, T])
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[1]);
  }
}
