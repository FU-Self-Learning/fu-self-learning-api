import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../entities/enrollment.entity';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { 
  UpdateEnrollmentDto
} from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async enrollUser(user: User, course: Course): Promise<Enrollment> {
    if (!user?.id || !course?.id) {
      throw new Error('Invalid user or course data');
    }

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { 
        user: { id: user.id }, 
        course: { id: course.id } 
      }
    });

    if (existingEnrollment) {
      this.logger.warn(`User ${user.id} already enrolled in course ${course.id}`);
      return existingEnrollment;
    }

    const enrollment = this.enrollmentRepository.create({
      user,
      course,
      progress: 0,
      enrollAt: new Date(),
    });

    const savedEnrollment = await this.enrollmentRepository.save(enrollment);
    this.logger.log(`User ${user.id} enrolled in course ${course.id}`);
    
    return savedEnrollment;
  }

  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { 
        user: { id: userId }
      },
      relations: ['course', 'course.instructor'],
      order: { enrolledAt: 'DESC' }
    });
  }

  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { 
        course: { id: courseId }
      },
      relations: ['user'],
      order: { enrolledAt: 'DESC' }
    });
  }

  async updateProgress(userId: number, courseId: number, progress: number): Promise<Enrollment> {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { 
          user: { id: userId },
          course: { id: courseId }
        },
        relations: ['course']
      });

      if (!enrollment) {
        throw new NotFoundException('Enrollment not found');
      }

      const oldProgress = enrollment.progress;
      enrollment.progress = Math.min(Math.max(progress, 0), 100);
      
      if (enrollment.progress === 100 && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
        this.logger.log(`User ${userId} completed course ${courseId}`);
      }

      const updatedEnrollment = await this.enrollmentRepository.save(enrollment);
      this.logger.log(`Progress updated for user ${userId}, course ${courseId}: ${oldProgress}% -> ${progress}%`);
      
      return updatedEnrollment;
    } catch (error) {
      this.logger.error(`Failed to update progress for user ${userId}, course ${courseId}: ${error.message}`);
      throw error;
    }
  }

  async isUserEnrolled(userId: number, courseId: number): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { 
        user: { id: userId },
        course: { id: courseId }
      }
    });

    return !!enrollment;
  }

  async hasAccessToCourse(userId: number, courseId: number): Promise<boolean> {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { 
          user: { id: userId },
          course: { id: courseId }
        }
      });
      return !!enrollment;
    } catch (error) {
      this.logger.error(`Failed to check course access for user ${userId}, course ${courseId}: ${error.message}`);
      return false;
    }
  }

  async getEnrollmentDetails(userId: number, courseId: number): Promise<Enrollment | null> {
    try {
      return await this.enrollmentRepository.findOne({
        where: { 
          user: { id: userId },
          course: { id: courseId }
        },
        relations: ['course', 'user']
      });
    } catch (error) {
      this.logger.error(`Failed to get enrollment details for user ${userId}, course ${courseId}: ${error.message}`);
      return null;
    }
  }

  async updateEnrollment(id: number, updateData: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'course']
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    Object.assign(enrollment, updateData);
    return this.enrollmentRepository.save(enrollment);
  }

  async deleteEnrollment(userId: number, courseId: number): Promise<boolean> {
    try {
      const result = await this.enrollmentRepository.delete({
        user: { id: userId },
        course: { id: courseId }
      });
      return !!(result.affected && result.affected > 0);
    } catch (error) {
      this.logger.error(`Failed to delete enrollment for user ${userId}, course ${courseId}: ${error.message}`);
      throw error;
    }
  }

  async getEnrollmentById(id: number): Promise<Enrollment | null> {
    return this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'course']
    });
  }

  async setCertificateUrl(userId: number, courseId: number, certificateUrl: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { 
        user: { id: userId },
        course: { id: courseId }
      }
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.certificateUrl = certificateUrl;
    return this.enrollmentRepository.save(enrollment);
  }
}
