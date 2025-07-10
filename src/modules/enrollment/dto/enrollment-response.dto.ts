export class InstructorDto {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;

  constructor(instructor: any) {
    this.id = instructor.id;
    this.username = instructor.username;
    this.email = instructor.email;
    this.avatarUrl = instructor.avatarUrl;
  }
}

export class CourseDto {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  instructor: InstructorDto | null;

  constructor(course: any) {
    this.id = course.id;
    this.title = course.title;
    this.description = course.description;
    this.imageUrl = course.imageUrl;
    this.price = course.price;
    this.instructor = course.instructor ? new InstructorDto(course.instructor) : null;
  }
}

export class EnrollmentDto {
  enrollmentId: number;
  course: CourseDto;
  progress: number;
  enrolledAt: Date;
  completedAt: Date | null;
  isCompleted: boolean;

  constructor(enrollment: any) {
    this.enrollmentId = enrollment.id;
    this.course = new CourseDto(enrollment.course);
    this.progress = enrollment.progress;
    this.enrolledAt = enrollment.enrolledAt;
    this.completedAt = enrollment.completedAt;
    this.isCompleted = enrollment.progress === 100;
  }
}

export class EnrollmentSummaryStatsDto {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  averageProgress: number;
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
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  progress: number;
  enrolledAt: Date;
  isCompleted: boolean;

  constructor(enrollment: any) {
    this.enrollmentId = enrollment.id;
    this.courseId = enrollment.course.id;
    this.courseTitle = enrollment.course.title;
    this.progress = enrollment.progress;
    this.enrolledAt = enrollment.enrolledAt;
    this.isCompleted = enrollment.progress === 100;
  }
}

export class EnrollmentSummaryResponseDto {
  summary: EnrollmentSummaryStatsDto;
  recentEnrollments: RecentEnrollmentDto[];

  constructor(enrollments: any[]) {
    this.summary = new EnrollmentSummaryStatsDto(enrollments);
    this.recentEnrollments = enrollments.slice(0, 5).map(enrollment => new RecentEnrollmentDto(enrollment));
  }
}

export class FilteredCoursesResponseDto {
  status: string;
  count: number;
  courses: EnrollmentDto[];

  constructor(status: string, filteredEnrollments: any[]) {
    this.status = status.toLowerCase();
    this.count = filteredEnrollments.length;
    this.courses = filteredEnrollments.map(enrollment => new EnrollmentDto(enrollment));
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
  id: number;
  username: string;
  email: string;

  constructor(user: any) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
  }
}

export class SimpleCourseDto {
  id: number;
  title: string;
  description: string;

  constructor(course: any) {
    this.id = course.id;
    this.title = course.title;
    this.description = course.description;
  }
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
        user: new UserDto(enrollment.user),
        course: new SimpleCourseDto(enrollment.course)
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
