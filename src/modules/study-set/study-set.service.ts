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
import { CreateStudySetEmptyDto } from './dto/create-study-set-empty.dto';
import { AddFlashcardsManualDto } from './dto/create-study-set-empty.dto';
import { UpdateFlashcardDto } from '../flashcards/dto/update-flashcard.dto';

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

    const newFlashcards = dto.flashcards.map((flashcardData) => {
      const flashcard = this.flashcardRepo.create({
        front_text: flashcardData.front_text,
        back_text: flashcardData.back_text,
        generation_source: flashcardData.generation_source || 'manual',
        is_auto_generated: false,
      });
      return flashcard;
    });

    const studySet = this.studySetRepo.create({
      name: dto.name,
      description: dto.description,
      tags: dto.tags,
      isPublic: dto.isPublic,
      user,
      flashcards: newFlashcards,
    });
    return this.studySetRepo.save(studySet);
  }

  async createEmpty(
    userId: number,
    dto: CreateStudySetEmptyDto,
  ): Promise<StudySet> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const studySet = this.studySetRepo.create({
      name: dto.name,
      description: dto.description,
      tags: dto.tags,
      isPublic: dto.isPublic,
      user,
    });
    return this.studySetRepo.save(studySet);
  }

  async addFlashcardsManual(
    studySetId: number,
    userId: number,
    dto: AddFlashcardsManualDto,
  ): Promise<StudySet> {
    // Find the study set and verify ownership
    const studySet = await this.studySetRepo.findOne({
      where: { id: studySetId, user: { id: userId } },
      relations: ['flashcards'],
    });

    if (!studySet) {
      throw new NotFoundException('Study set not found');
    }

    // Create new flashcards from the provided data
    const newFlashcards = dto.flashcards.map((flashcardData) => {
      const flashcard = this.flashcardRepo.create({
        front_text: flashcardData.front_text,
        back_text: flashcardData.back_text,
        generation_source: flashcardData.generation_source || 'manual',
        is_auto_generated: false,
        studySet: studySet,
      });
      return flashcard;
    });

    // Save all new flashcards
    await this.flashcardRepo.save(newFlashcards);

    // Return the updated study set with all flashcards
    const updatedStudySet = await this.studySetRepo.findOne({
      where: { id: studySetId },
      relations: ['flashcards'],
    });

    if (!updatedStudySet) {
      throw new NotFoundException('Study set not found after update');
    }

    return updatedStudySet;
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

  async replaceFlashcards(
    studySetId: number,
    userId: number,
    dto: { flashcards: UpdateFlashcardDto[] },
  ): Promise<StudySet> {
    const studySet = await this.studySetRepo.findOne({
      where: { id: studySetId, user: { id: userId } },
      relations: ['flashcards'],
    });

    if (!studySet) throw new NotFoundException('Study set not found');

    if (studySet.flashcards.length > 0) {
      const oldFlashcardIds = studySet.flashcards.map((f) => f.id);
      await this.flashcardRepo.delete({ id: In(oldFlashcardIds) });
    }

    const newFlashcards = dto.flashcards.map((fc) =>
      this.flashcardRepo.create({
        front_text: fc.front_text,
        back_text: fc.back_text,
        generation_source: fc.generation_source || 'manual',
        is_auto_generated: false,
        studySet: studySet,
      }),
    );

    await this.flashcardRepo.save(newFlashcards);

    const updatedStudySet = await this.studySetRepo.findOne({
      where: { id: studySetId },
      relations: ['flashcards'],
    });

    return updatedStudySet!;
  }
}
