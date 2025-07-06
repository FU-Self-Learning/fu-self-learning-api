import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { Topic } from '../../entities/topic.entity';
import { Lesson } from '../../entities/lesson.entity';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { PdfService } from '../pdf/pdf.service';
import { GeminiService } from '../ai-agent/gemini.service';
import { GeneratedCourseDto, GeneratedTopicDto, GenerateCourseFromPdfResponseDto } from './dto/request/generate-course-from-pdf.dto';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { CreateTopicDto } from '../../modules/topic/dto/request/create-topic.dto';
import { CreateLessonDto } from '../../modules/lesson/dto/request/create-lesson.dto';
import { ErrorMessage } from 'src/common/constants/error-message.constant';

@Injectable()
export class CourseGenerationService {
  private readonly logger = new Logger(CourseGenerationService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private pdfService: PdfService,
    private geminiService: GeminiService,
  ) {}

  async generateCourseFromPdf(
    pdfBuffer: Buffer,
    instructorId: string,
  ): Promise<GenerateCourseFromPdfResponseDto> {
    try {
      // Extract text from PDF
      const pdfText = await this.pdfService.extractTextFromBuffer(pdfBuffer);
      
      if (!pdfText || pdfText.trim().length === 0) {
        throw new BadRequestException({
          message: ErrorMessage.INVALID_REQUEST_INPUT,
          description: 'PDF content could not be extracted or is empty',
        });
      }

      // Analyze content with AI
      const aiResult = await this.geminiService.analyzePdfContent(pdfText);

      // Validate instructor
      const instructor = await this.userRepository.findOne({
        where: { id: Number(instructorId) },
      });

      if (!instructor) {
        throw new BadRequestException({
          message: ErrorMessage.INVALID_REQUEST_INPUT,
          description: 'Instructor not found',
        });
      }

      // Validate categories
      const categories = await this.validateCategories(aiResult.course.categoryIds);

      return {
        course: {
          ...aiResult.course,
          categoryIds: categories.map(cat => cat.id),
        },
        topics: aiResult.topics,
      };
    } catch (error) {
      this.logger.error('Error generating course from PDF:', error);
      throw error;
    }
  }

  async createCourseWithStructure(
    courseData: GeneratedCourseDto,
    topicsData: GeneratedTopicDto[],
    instructorId: string,
    imageUrl?: string,
    videoIntroUrl?: string,
  ): Promise<Course> {
    try {
      // Validate instructor
      const instructor = await this.userRepository.findOne({
        where: { id: Number(instructorId) },
      });

      if (!instructor) {
        throw new BadRequestException({
          message: ErrorMessage.INVALID_REQUEST_INPUT,
          description: 'Instructor not found',
        });
      }

      // Validate categories
      const categories = await this.validateCategories(courseData.categoryIds);

      // Create course
      const course = this.courseRepository.create({
        title: courseData.title,
        description: courseData.description,
        instructor,
        categories,
        imageUrl,
        videoIntroUrl,
      });

      const savedCourse = await this.courseRepository.save(course);

      // Create topics and lessons
      for (const topicData of topicsData) {
        const topic = this.topicRepository.create({
          title: topicData.title,
          description: topicData.description,
          course: savedCourse,
        });

        const savedTopic = await this.topicRepository.save(topic);

        // Create lessons for this topic
        for (const lessonData of topicData.lessons) {
          const lesson = this.lessonRepository.create({
            title: lessonData.title,
            description: lessonData.description,
            topic: savedTopic,
            videoUrl: '', // Placeholder for instructor to upload later
          });

          await this.lessonRepository.save(lesson);
        }
      }

      return savedCourse;
    } catch (error) {
      this.logger.error('Error creating course with structure:', error);
      throw error;
    }
  }

  private async validateCategories(categoryIds: number[]): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { id: In(categoryIds) },
    });

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException({
        message: ErrorMessage.INVALID_REQUEST_INPUT,
        description: 'Some categories not found',
      });
    }

    return categories;
  }
} 