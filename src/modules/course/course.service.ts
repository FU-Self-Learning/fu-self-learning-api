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

  async create(createCourseDto: CreateCourseDto, currentUser: User): Promise<Course> {
    const instructor = await this.userRepository.findOne({
      where: { id: createCourseDto.instructorId },
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

  async findOne(id: number, currentUser: User): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'topics'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, currentUser: User): Promise<Course> {
    const course = await this.findOne(id, currentUser);

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

  async remove(id: number, currentUser: User): Promise<void> {
    const course = await this.findOne(id, currentUser);
    await this.courseRepository.remove(course);
  }
} 