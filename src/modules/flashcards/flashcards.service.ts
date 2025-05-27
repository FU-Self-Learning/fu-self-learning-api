import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard } from '../../entities/flashcard.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { Topic } from '../../entities/topic.entity';
@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(Flashcard)
    private readonly flashcardRepo: Repository<Flashcard>,
  ) {}

  async create(dto: CreateFlashcardDto): Promise<Flashcard> {
    const flashcard = this.flashcardRepo.create({
      front_text: dto.front_text,
      back_text: dto.back_text,
      topic: { id: dto.topicId } as Topic,
    });
    return this.flashcardRepo.save(flashcard);
  }

  async findAll(): Promise<Flashcard[]> {
    return this.flashcardRepo.find({ relations: ['topic'] });
  }

  async findOne(id: number): Promise<Flashcard> {
    const flashcard = await this.flashcardRepo.findOne({ where: { id }, relations: ['topic'] });
    if (!flashcard) throw new NotFoundException('Flashcard not found');
    return flashcard;
  }

  async findByTopic(topicId: number): Promise<Flashcard[]> {
    const flashcards = await this.flashcardRepo.find({
      where: { topic: { id: topicId } },
      relations: ['topic'],
    });
    if (flashcards.length === 0) throw new NotFoundException('No flashcards found for this topic');
    return flashcards;
  }

  async update(id: number, dto: UpdateFlashcardDto): Promise<Flashcard> {
    const flashcard = await this.findOne(id);
    Object.assign(flashcard, dto);
    return this.flashcardRepo.save(flashcard);
  }

  async remove(id: number): Promise<void> {
    const result = await this.flashcardRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Flashcard not found');
  }
}
