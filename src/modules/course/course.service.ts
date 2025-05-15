import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createCourseDto: CreateCourseDto, uid: string): Promise<Course> {
    const instructor = await this.userRepository.findOne({
      where: { id: Number(uid) },
    });

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      instructor,
    });

    return this.courseRepository.save(course);
  }

  async findAll(currentUser: User): Promise<Course[]> {
    return this.courseRepository.find({
      relations: ['instructor', 'topics'],
    });
  }

  async findOne(id: number, userId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'topics'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, userId: string): Promise<Course> {
    const course = await this.findOne(id, userId);

    if (updateCourseDto.instructorId) {
      const instructor = await this.userRepository.findOne({
        where: { id: updateCourseDto.instructorId },
      });

      if (!instructor) {
        throw new NotFoundException('Instructor not found');
      }

      course.instructor = instructor;
    }

    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: number, userId: string): Promise<void> {
    const course = await this.findOne(id, userId);
    await this.courseRepository.remove(course);
  }
} 