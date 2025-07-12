import { Expose, Transform, Type, plainToClass } from 'class-transformer';

export class InstructorDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  avatarUrl: string;
}

export class CourseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  imageUrl: string;

  @Expose()
  price: number;

  @Expose()
  @Type(() => InstructorDto)
  instructor: InstructorDto | null;
}

export class EnrollmentDto {
  @Expose()
  @Transform(({ obj }) => obj.id)
  enrollmentId: number;

  @Expose()
  @Type(() => CourseDto)
  course: CourseDto;

  @Expose()
  progress: number;

  @Expose()
  enrolledAt: Date;

  @Expose()
  completedAt: Date | null;

  @Expose()
  @Transform(({ obj }) => obj.progress === 100)
  isCompleted: boolean;
}

export class EnrollmentSummaryStatsDto {
  @Expose()
  totalCourses: number;

  @Expose()
  completedCourses: number;

  @Expose()
  inProgressCourses: number;

  @Expose()
  notStartedCourses: number;

  @Expose()
  averageProgress: number;

  @Expose()
  completionRate: number;

  constructor(enrollments: any[]) {
    this.totalCourses = enrollments.length;
    this.completedCourses = enrollments.filter(e => e.progress === 100).length;
    this.inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    this.notStartedCourses = enrollments.filter(e => e.progress === 0).length;
    this.averageProgress = this.totalCourses > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / this.totalCourses * 100) / 100 
      : 0;
    this.completionRate = this.totalCourses > 0 
      ? Math.round((this.completedCourses / this.totalCourses) * 100 * 100) / 100 
      : 0;
  }
}

export class RecentEnrollmentDto {
  @Expose()
  @Transform(({ obj }) => obj.id)
  enrollmentId: number;

  @Expose()
  @Transform(({ obj }) => obj.course.id)
  courseId: number;

  @Expose()
  @Transform(({ obj }) => obj.course.title)
  courseTitle: string;

  @Expose()
  progress: number;

  @Expose()
  enrolledAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.progress === 100)
  isCompleted: boolean;
}

export class EnrollmentSummaryResponseDto {
  summary: EnrollmentSummaryStatsDto;
  recentEnrollments: RecentEnrollmentDto[];

  constructor(enrollments: any[]) {
    this.summary = new EnrollmentSummaryStatsDto(enrollments);
    this.recentEnrollments = enrollments.slice(0, 5).map(enrollment => 
      plainToClass(RecentEnrollmentDto, enrollment, { excludeExtraneousValues: true })
    );
  }
}

export class FilteredCoursesResponseDto {
  status: string;
  count: number;
  courses: EnrollmentDto[];

  constructor(status: string, filteredEnrollments: any[]) {
    this.status = status.toLowerCase();
    this.count = filteredEnrollments.length;
    this.courses = filteredEnrollments.map(enrollment => 
      plainToClass(EnrollmentDto, enrollment, { excludeExtraneousValues: true })
    );
  }
}

export class EnrollmentDetailsResponseDto {
  enrolled: boolean;
  message?: string;
  enrollment?: {
    id: number;
    progress: number;
    enrolledAt: Date;
    completedAt: Date | null;
  };

  constructor(enrollment: any | null) {
    if (!enrollment) {
      this.enrolled = false;
      this.message = 'Not enrolled in this course';
    } else {
      this.enrolled = true;
      this.enrollment = {
        id: enrollment.id,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt
      };
    }
  }
}

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;
}

export class SimpleCourseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;
}

export class EnrollmentByIdResponseDto {
  found: boolean;
  message?: string;
  enrollment?: {
    id: number;
    progress: number;
    enrolledAt: Date;
    completedAt: Date | null;
    certificateUrl: string | null;
    user: UserDto;
    course: SimpleCourseDto;
  };

  constructor(enrollment: any | null) {
    if (!enrollment) {
      this.found = false;
      this.message = 'Enrollment not found';
    } else {
      this.found = true;
      this.enrollment = {
        id: enrollment.id,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        certificateUrl: enrollment.certificateUrl,
        user: plainToClass(UserDto, enrollment.user, { excludeExtraneousValues: true }),
        course: plainToClass(SimpleCourseDto, enrollment.course, { excludeExtraneousValues: true })
      };
    }
  }
}

export class DeleteEnrollmentResponseDto {
  success: boolean;
  message: string;

  constructor(deleted: boolean) {
    this.success = deleted;
    this.message = deleted ? 'Enrollment deleted successfully' : 'Enrollment not found';
  }
}
