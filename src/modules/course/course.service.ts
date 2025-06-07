import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { UpdateCourseDto } from './dto/request/update-course.dto';
import { Role } from 'src/common/enums/role.enum';
import { Category } from 'src/entities/category.entity';
import { ErrorMessage } from 'src/common/constants/error-message.constant';
import { AdminViewCourseDto } from './dto/response/admin-view-courses.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCourseDto: CreateCourseDto, uid: string, file?: string): Promise<Course> {
    const instructor = await this.userRepository.findOne({
      where: { id: Number(uid) },
    });

    if (!instructor) {
      throw new BadRequestException({
        message: ErrorMessage.INVALID_REQUEST_INPUT,
        description: 'Instructor not found',
      });
    }
    const categories = await this.findCategoriesByIds(
      createCourseDto.categoryIds,
    );

    if (categories.length !== createCourseDto.categoryIds.length) {
      throw new BadRequestException({
        message: ErrorMessage.INVALID_REQUEST_INPUT,
        description: 'Some categories not found',
      });
    }
    
    const course = this.courseRepository.create({
      ...createCourseDto,
      instructor,
      categories,
      imageUrl: file ? file : undefined,
    });

    return this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      relations: ['instructor', 'topics'],
    });
  }

  async findAllWithAdminRole(): Promise<AdminViewCourseDto[]> {
    const courses = await this.courseRepository.find({
      relations: ['instructor', 'categories', 'topics'],
    });
  
    return plainToInstance(AdminViewCourseDto, courses, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'topics'],
    });

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    return course;
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    userId: string,
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (userId) {
      const instructor = await this.userRepository.findOne({
        where: { id: Number(userId) },
      });

      if (!instructor || instructor.role !== Role.Instructor) {
        throw new BadRequestException('Instructor not found or not authorized');
      }

      course.instructor = instructor;
    }

    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  // ================================ Category ================================

  async createCategory(name: string): Promise<Category> {
    const category = this.categoryRepository.create({ name });
    return this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findOneCategory(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return category;
  }

  async findCategoriesByIds(ids: number[]): Promise<Category[]> {
    const validIds = ids
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id)); // hoặc !isNaN(id) && Number.isFinite(id)
  
    if (validIds.length !== ids.length) {
      throw new BadRequestException('Invalid category ID(s) provided');
    }
  
    return this.categoryRepository.findBy({ id: In(validIds) });
  }
}
