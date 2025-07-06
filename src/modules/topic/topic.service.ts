import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../../entities/topic.entity';
import { CreateTopicDto } from './dto/request/create-topic.dto';
import { UpdateTopicDto } from './dto/request/update-topic.dto';
import { CourseService } from '../course/course.service';
import { ViewAllTopicDto } from './dto/response/view-all-topic.dto';
import { plainToInstance } from 'class-transformer';
import { Lesson } from 'src/entities/lesson.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    private courseService: CourseService,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async create(
    courseId: number,
    createTopicDto: CreateTopicDto,
  ): Promise<Topic> {
    const isCourseExist = await this.courseService.isCourseExist(courseId);
    if (!isCourseExist) {
      throw new NotFoundException(`Course not found`);
    }

    const topic = this.topicRepository.create({
      ...createTopicDto,
      course: { id: courseId },
    });
    return this.topicRepository.save(topic);
  }

  async createMany(
    courseId: number,
    createTopicDtos: CreateTopicDto[],
  ): Promise<Topic[]> {
    const isCourseExist = await this.courseService.isCourseExist(courseId);
    if (!isCourseExist) {
      throw new NotFoundException(`Course not found`);
    }

    const topics = createTopicDtos.map((dto) =>
      this.topicRepository.create({
        ...dto,
        course: { id: courseId },
      }),
    );
    return this.topicRepository.save(topics);
  }

  async findAll(): Promise<Topic[]> {
    return this.topicRepository.find({
      relations: ['course', 'flashcards', 'studySessions', 'quizQuestions'],
    });
  }

  async findAllByCourse(courseId: number): Promise<ViewAllTopicDto[]> {
    const isCourseExist = await this.courseService.isCourseExist(courseId);
    if (!isCourseExist) {
      throw new NotFoundException(`Course not found`);
    }

    const topics = await this.topicRepository.find({
      where: { course: { id: courseId } },
      relations: ['studySessions', 'quizQuestions', 'lessons'],
    });

    return Promise.all(
      topics.map(async (topic) => {
        const totalDuration = await this.calculateTotalDuration(topic);
        return plainToInstance(
          ViewAllTopicDto,
          {
            ...topic,
            totalDuration,
          },
          {
            excludeExtraneousValues: true,
          },
        );
      }),
    );
  }

  async findOne(id: number): Promise<Topic | null> {
    const isTopicExist = await this.topicRepository.findOne({ where: { id } });
    if (!isTopicExist) {
      throw new NotFoundException(`Topic not found`);
    }

    return this.topicRepository.findOne({
      where: { id },
      relations: ['course', 'flashcards', 'studySessions', 'quizQuestions'],
    });
  }

  async findOneByCourse(courseId: number, id: number): Promise<Topic> {
    const isCourseExist = await this.courseService.isCourseExist(courseId);
    if (!isCourseExist) {
      throw new NotFoundException(`Course not found`);
    }

    const topic = await this.topicRepository.findOne({
      where: { id, course: { id: courseId } },
      relations: ['course', 'flashcards', 'studySessions', 'quizQuestions'],
    });

    if (!topic) {
      throw new NotFoundException(
        `Topic #${id} not found in course #${courseId}`,
      );
    }

    return topic;
  }

  async update(
    id: number,
    updateTopicDto: UpdateTopicDto,
  ): Promise<Topic | null> {
    const isTopicExist = await this.topicRepository.findOne({ where: { id } });
    if (!isTopicExist) {
      throw new NotFoundException(`Topic not found`);
    }

    await this.topicRepository.update(id, updateTopicDto);
    return this.findOne(id);
  }

  async updateByCourse(
    courseId: number,
    id: number,
    updateTopicDto: UpdateTopicDto,
  ): Promise<Topic> {
    const isCourseExist = await this.courseService.isCourseExist(courseId);
    if (!isCourseExist) {
      throw new NotFoundException(`Course not found`);
    }

    const topic = await this.findOneByCourse(courseId, id);
    Object.assign(topic, updateTopicDto);
    return this.topicRepository.save(topic);
  }

  async remove(id: number): Promise<void> {
    const isTopicExist = await this.topicRepository.findOne({ where: { id } });
    if (!isTopicExist) {
      throw new NotFoundException(`Topic not found`);
    }

    await this.topicRepository.delete(id);
  }

  async removeByCourse(courseId: number, id: number): Promise<void> {
    const topic = await this.findOneByCourse(courseId, id);
    await this.topicRepository.remove(topic);
  }

  async calculateTotalDuration(topic: Topic): Promise<number> {
    const lessons = await this.lessonRepository.find({
      where: { topic: { id: topic.id } },
    });
    const totalDuration = lessons.reduce(
      (acc, lesson) => acc + (lesson.videoDuration || 0),
      0,
    );
    return totalDuration;
  }
}
