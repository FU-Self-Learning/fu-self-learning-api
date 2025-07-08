import { Controller, Get, Param, ParseIntPipe, UseGuards, Req, Patch, Body, ValidationPipe } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '../../config/jwt/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { IsNumber, Min, Max } from 'class-validator';

class UpdateProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;
}

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-courses')
  async getMyEnrollments(@Req() req: any) {
    const user = req.user as User;
    const enrollments = await this.enrollmentService.getUserEnrollments(user.id);
    
    return enrollments.map(enrollment => ({
      enrollmentId: enrollment.id,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        imageUrl: enrollment.course.imageUrl,
        price: enrollment.course.price,
        instructor: enrollment.course.instructor ? {
          id: enrollment.course.instructor.id,
          username: enrollment.course.instructor.username,
          email: enrollment.course.instructor.email,
          avatarUrl: enrollment.course.instructor.avatarUrl
        } : null
      },
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      isCompleted: enrollment.progress === 100,
      isActive: enrollment.isActive
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('course/:courseId/check')
  async checkEnrollment(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number
  ) {
    const user = req.user as User;
    const isEnrolled = await this.enrollmentService.isUserEnrolled(user.id, courseId);
    return { isEnrolled };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('course/:courseId/progress')
  async updateProgress(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body(ValidationPipe) updateProgressDto: UpdateProgressDto
  ) {
    const user = req.user as User;
    return this.enrollmentService.updateProgress(user.id, courseId, updateProgressDto.progress);
  }

  @Get('course/:courseId/stats')
  async getCourseStats(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.enrollmentService.getEnrollmentStats(courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('course/:courseId/details')
  async getEnrollmentDetails(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number
  ) {
    const user = req.user as User;
    const enrollment = await this.enrollmentService.getEnrollmentDetails(user.id, courseId);
    if (!enrollment) {
      return { enrolled: false, message: 'Not enrolled in this course' };
    }
    return {
      enrolled: true,
      enrollment: {
        id: enrollment.id,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        isActive: enrollment.isActive
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-courses/summary')
  async getMyCoursesSummary(@Req() req: any) {
    const user = req.user as User;
    const enrollments = await this.enrollmentService.getUserEnrollments(user.id);
    
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    const notStartedCourses = enrollments.filter(e => e.progress === 0).length;
    const averageProgress = totalCourses > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses * 100) / 100 
      : 0;

    return {
      summary: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        averageProgress,
        completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100 * 100) / 100 : 0
      },
      recentEnrollments: enrollments.slice(0, 5).map(enrollment => ({
        enrollmentId: enrollment.id,
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        isCompleted: enrollment.progress === 100
      }))
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-courses/filter/:status')
  async getMyCoursesFiltered(
    @Req() req: any,
    @Param('status') status: string
  ) {
    const user = req.user as User;
    const enrollments = await this.enrollmentService.getUserEnrollments(user.id);
    
    let filteredEnrollments = enrollments;
    
    switch (status.toLowerCase()) {
      case 'completed':
        filteredEnrollments = enrollments.filter(e => e.progress === 100);
        break;
      case 'in-progress':
        filteredEnrollments = enrollments.filter(e => e.progress > 0 && e.progress < 100);
        break;
      case 'not-started':
        filteredEnrollments = enrollments.filter(e => e.progress === 0);
        break;
      case 'all':
      default:
        filteredEnrollments = enrollments;
        break;
    }
    
    return {
      status: status.toLowerCase(),
      count: filteredEnrollments.length,
      courses: filteredEnrollments.map(enrollment => ({
        enrollmentId: enrollment.id,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          imageUrl: enrollment.course.imageUrl,
          price: enrollment.course.price,
          instructor: enrollment.course.instructor ? {
            id: enrollment.course.instructor.id,
            username: enrollment.course.instructor.username,
            avatarUrl: enrollment.course.instructor.avatarUrl
          } : null
        },
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        isCompleted: enrollment.progress === 100
      }))
    };
  }
}
