import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../../entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const topic = this.topicRepository.create(createTopicDto);
    return this.topicRepository.save(topic);
  }

  async findAll(): Promise<Topic[]> {
    return this.topicRepository.find({
      relations: ['course', 'flashcards', 'studySessions', 'quizQuestions'],
    });
  }

  async findOne(id: number): Promise<Topic | null> {
    return this.topicRepository.findOne({
      where: { id },
      relations: ['course', 'flashcards', 'studySessions', 'quizQuestions'],
    });
  }

  async update(id: number, updateTopicDto: UpdateTopicDto): Promise<Topic | null> {
    await this.topicRepository.update(id, updateTopicDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.topicRepository.delete(id);
  }
} 