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
import { DetailViewCourseDto } from './dto/response/detail-view-course.dto';
import { Topic } from 'src/entities/topic.entity';
import { InstructorViewCourseDto } from './dto/response/instructor-view-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    uid: string,
    file?: string,
    video?: string,
    document?: string,
  ): Promise<Course> {
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
      videoIntroUrl: video ? video : undefined,
      documentUrl: document ? document : undefined,
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

  async findOne(id: number): Promise<DetailViewCourseDto> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'categories', 'topics'],
    });

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    const totalDuration = await this.calculateTotalDuration(course);
    const totalLessons = await this.calculateTotalLessons(course);
    return plainToInstance(
      DetailViewCourseDto,
      {
        ...course,
        totalDuration,
        totalLessons,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    userId: string,
    imageUrl?: string,
    videoIntroUrl?: string,
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

    if (imageUrl) {
      course.imageUrl = imageUrl;
    }

    if (videoIntroUrl) {
      course.videoIntroUrl = videoIntroUrl;
    }
    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: number): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new BadRequestException('Course not found');
    }

    await this.courseRepository.remove(course);
  }

  async isCourseExist(id: number): Promise<boolean> {
    const course = await this.courseRepository.findOne({ where: { id } });
    return !!course;
  }

  async calculateTotalDuration(course: Course): Promise<number> {
    const topics = await this.topicRepository.find({
      where: { course: { id: course.id } },
      relations: ['lessons'],
    });
    const totalDuration = topics.reduce(
      (acc, topic) =>
        acc +
        topic.lessons.reduce(
          (acc, lesson) => acc + (lesson.videoDuration || 0),
          0,
        ),
      0,
    );
    return totalDuration;
  }

  async calculateTotalLessons(course: Course): Promise<number> {
    const topics = await this.topicRepository.find({
      where: { course: { id: course.id } },
      relations: ['lessons'],
    });
    return topics.reduce((acc, topic) => acc + topic.lessons.length, 0);
  }

  async findCoursesByCategory(id: number): Promise<Course[]> {
    const courses = await this.courseRepository.find({
      where: { categories: { id } },
    });
    return courses;
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

  async findAllOwn(userId: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: { instructor: { id: Number(userId) } },
    });
  }

  async findOneManage(
    id: number,
    userId: string,
  ): Promise<InstructorViewCourseDto> {
    const course = await this.courseRepository.findOne({
      where: { id, instructor: { id: Number(userId) } },
    });
    if (!course) {
      throw new BadRequestException('Course not found');
    }
    return plainToInstance(InstructorViewCourseDto, course, {
      excludeExtraneousValues: true,
    });
  }
}
