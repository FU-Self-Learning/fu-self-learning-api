import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../../entities/lesson.entity';
import { CreateLessonDto } from './dto/request/create-lesson.dto';
import { UpdateLessonDto } from './dto/request/update-lesson.dto';
import { ViewLessonDto } from './dto/response/view-lesson.dto';
import { TopicService } from '../topic/topic.service';
import { plainToInstance } from 'class-transformer';
import { CreateLessonsWithTopic } from './dto/request/create-many-lessons.dto';
import { Topic } from 'src/entities/topic.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    private topicService: TopicService,
  ) {}

  async create(
    createLessonDto: CreateLessonDto,
    topic: Topic,
    videoUrl: string,
    videoDuration: number,
  ): Promise<ViewLessonDto> {

    const lesson = this.lessonRepository.create({
      ...createLessonDto,
      topic,
      videoUrl,
      videoDuration,
    });

    const savedLesson = await this.lessonRepository.save(lesson);
    return plainToInstance(ViewLessonDto, savedLesson, {
      excludeExtraneousValues: true,
    });
  }

  async createMany(createLessonsWithTopic: CreateLessonsWithTopic[]): Promise<ViewLessonDto[]> {
    const lessons = createLessonsWithTopic.map(async (lesson) => {
      const topic = await this.topicService.findOne(lesson.topicId);
      if (!topic) {
        throw new NotFoundException(`Topic #${lesson.topicId} not found`);
      }
      return this.create(lesson.data, topic, lesson.videoUrl, lesson.videoDuration);
    });

    return Promise.all(lessons);
  }

  async findAllByTopic(topicId: number): Promise<ViewLessonDto[]> {
    const lessons = await this.lessonRepository.find({
      where: { topic: { id: topicId } },
      relations: ['topic'],
      order: { createdAt: 'ASC' },
    });

    return plainToInstance(ViewLessonDto, lessons, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number): Promise<ViewLessonDto> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson #${id} not found`);
    }

    return plainToInstance(ViewLessonDto, lesson, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    updateLessonDto: UpdateLessonDto,
    topicId: number,
    videoUrl: string,
    videoDuration: number,
  ): Promise<ViewLessonDto> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson #${id} not found`);
    }

    if (topicId) {
      const topic = await this.topicService.findOne(topicId);
      if (!topic) {
        throw new NotFoundException(`Topic #${topicId} not found`);
      }
      lesson.topic = topic;
    }

    Object.assign(lesson, {
      ...updateLessonDto,
      videoUrl,
      videoDuration,
    });

    const updatedLesson = await this.lessonRepository.save(lesson);

    return plainToInstance(ViewLessonDto, updatedLesson, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number): Promise<void> {
    await this.lessonRepository.delete(id);
  }
}
