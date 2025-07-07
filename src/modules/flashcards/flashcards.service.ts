import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Flashcard } from '../../entities/flashcard.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import {
  GenerateFlashcardDto,
  GenerationSource,
} from './dto/generate-flashcard.dto';
import { Topic } from '../../entities/topic.entity';
import { Lesson } from '../../entities/lesson.entity';
import { LessonService } from '../lesson/lesson.service';
import { TopicService } from '../topic/topic.service';
import { CourseService } from '../course/course.service';
import { GeminiService } from '../ai-agent/gemini.service';
import { Course } from 'src/entities/course.entity';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(Flashcard)
    private readonly flashcardRepo: Repository<Flashcard>,
    private readonly lessonService: LessonService,
    private readonly topicService: TopicService,
    private readonly courseService: CourseService,
    private readonly geminiService: GeminiService,
  ) {}

  async create(dto: CreateFlashcardDto): Promise<Flashcard> {
    if (!dto.topicId && !dto.lessonId) {
      throw new BadRequestException(
        'Either topicId or lessonId must be provided',
      );
    }

    const flashcardData: Partial<Flashcard> = {
      front_text: dto.front_text,
      back_text: dto.back_text,
      is_auto_generated: dto.is_auto_generated || false,
      generation_source: dto.generation_source,
    };

    if (dto.topicId) {
      flashcardData.topic = { id: dto.topicId } as Topic;
    }

    if (dto.lessonId) {
      flashcardData.lesson = { id: dto.lessonId } as Lesson;
    }

    const flashcard = this.flashcardRepo.create(flashcardData);
    return this.flashcardRepo.save(flashcard);
  }

  async findAll(): Promise<Flashcard[]> {
    return this.flashcardRepo
      .createQueryBuilder('flashcard')
      .leftJoinAndSelect('flashcard.topic', 'topic')
      .leftJoinAndSelect('flashcard.lesson', 'lesson')
      .leftJoinAndSelect('flashcard.course', 'course')
      .select([
        'flashcard.id',
        'flashcard.front_text',
        'flashcard.back_text',
        'flashcard.is_auto_generated',
        'flashcard.generation_source',
        'flashcard.created_at',
        'flashcard.updated_at',

        'topic.id',
        'topic.title',

        'lesson.id',
        'lesson.title',

        'course.id',
        'course.title',
      ])
      .getMany();
  }

  async findOne(id: number): Promise<Flashcard> {
    const flashcard = await this.flashcardRepo.findOne({
      where: { id },
      relations: ['topic', 'lesson', 'course'],
    });
    if (!flashcard) throw new NotFoundException('Flashcard not found');
    return flashcard;
  }

  async findByTopic(topicId: number): Promise<Flashcard[]> {
    const lessons = await this.lessonService.findAllByTopic(topicId);
    const lessonIds = lessons.map((lesson) => lesson.id);
    const flashcards = await this.flashcardRepo.find({
      where: [{ lesson: { id: In(lessonIds) } }, { topic: { id: topicId } }],
      relations: ['topic', 'lesson', 'course'],
    });

    if (flashcards.length === 0)
      throw new NotFoundException('No flashcards found for this topic');
    return flashcards;
  }

  async findByLesson(lessonId: number): Promise<Flashcard[]> {
    const flashcards = await this.flashcardRepo.find({
      where: { lesson: { id: lessonId } },
      relations: ['topic', 'lesson'],
    });
    if (flashcards.length === 0)
      throw new NotFoundException('No flashcards found for this lesson');
    return flashcards;
  }

  async findByCourse(courseId: number): Promise<Flashcard[]> {
    const topics = await this.topicService.findAllByCourse(courseId);
    const topicIds = topics.map((topic) => topic.id);
    const lessons = await this.lessonService.findAllByCourse(courseId);
    const lessonIds = lessons.map((lesson) => lesson.id);

    const flashcards = await this.flashcardRepo.find({
      where: [
        { course: { id: courseId } },
        { topic: { id: In(topicIds) } },
        { lesson: { id: In(lessonIds) } },
      ],
      relations: ['topic', 'lesson', 'course'],
    });
    if (flashcards.length === 0)
      throw new NotFoundException('No flashcards found for this course');
    return flashcards;
  }

  async update(id: number, dto: UpdateFlashcardDto): Promise<Flashcard> {
    const flashcard = await this.findOne(id);
    Object.assign(flashcard, dto);
    return this.flashcardRepo.save(flashcard);
  }

  async remove(id: number): Promise<void> {
    const result = await this.flashcardRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Flashcard not found');
  }

  async generateFlashcards(dto: GenerateFlashcardDto): Promise<Flashcard[]> {
    let content = '';
    switch (dto.source) {
      case GenerationSource.LESSON:
        const lesson = await this.lessonService.findOne(dto.sourceId);
        content = `${lesson.title}\n${lesson.description}`;
        break;

      case GenerationSource.TOPIC:
        const topic = await this.topicService.findOne(dto.sourceId);
        if (!topic) {
          throw new NotFoundException(`Topic #${dto.sourceId} not found`);
        }
        const topicLessons = await this.lessonService.findAllByTopic(
          dto.sourceId,
        );
        content = `${topic.title}\n${topic.description}\n\nLessons:\n${topicLessons.map((l) => `${l.title}: ${l.description}`).join('\n')}`;
        break;

      case GenerationSource.COURSE:
        const course = await this.courseService.findOne(dto.sourceId);
        const courseTopics = await this.topicService.findAllByCourse(
          dto.sourceId,
        );
        content = `${course.title}\n${course.description}\n\nTopics:\n${courseTopics.map((t) => `${t.title}: ${t.description}`).join('\n')}`;
        break;

      default:
        throw new BadRequestException('Invalid generation source');
    }

    // Sử dụng AI để generate flashcards
    const generatedFlashcards = await this.generateFlashcardsWithAI(
      content,
      dto.prompt,
    );

    // Lưu flashcards vào database
    const savedFlashcards: Flashcard[] = [];

    for (const card of generatedFlashcards) {
      const flashcardData: Partial<Flashcard> = {
        front_text: card.front_text,
        back_text: card.back_text,
        is_auto_generated: true,
        generation_source: dto.source,
      };

      if (dto.source === GenerationSource.LESSON) {
        flashcardData.lesson = { id: dto.sourceId } as Lesson;
      } else if (dto.source === GenerationSource.TOPIC) {
        flashcardData.topic = { id: dto.sourceId } as Topic;
      } else {
        flashcardData.course = { id: dto.sourceId } as Course;
      }

      const flashcard = this.flashcardRepo.create(flashcardData);
      savedFlashcards.push(await this.flashcardRepo.save(flashcard));
    }

    return savedFlashcards;
  }

  private async generateFlashcardsWithAI(
    content: string,
    customPrompt?: string,
  ): Promise<Array<{ front_text: string; back_text: string }>> {
    const prompt =
      customPrompt ||
      `
    You are an AI that generates educational flashcards. 
    Your task is to analyze the following educational content and generate 5-10 flashcards.

    **Requirements:**
    - Each flashcard must have a clear question as 'front_text' and a concise answer as 'back_text'.
    - Focus on key concepts, definitions, and important facts.
    - Return only valid JSON. Do not include any explanation or additional text.
    - The JSON must be a single array of objects with this exact format:

    [
      {"front_text": "Question 1", "back_text": "Answer 1"},
      {"front_text": "Question 2", "back_text": "Answer 2"},
      ...
    ]

    **Content to use:**
    ${content}
    `;
    try {
      const response = await this.geminiService.generateFlashcards(prompt);
      return response;
    } catch (error) {
      throw new Error('Failed to generate flashcards with Gemini AI');
    }
  }
}
