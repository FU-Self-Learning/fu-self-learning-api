import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CourseService } from '../course/course.service';
import { OrderStatsService } from '../order/order-stats.service';
import { UserStatsService } from '../users/user-stats.service';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly courseService: CourseService,
    private readonly orderStatsService: OrderStatsService,
    private readonly userStatsService: UserStatsService,
  ) {}

  async getAllUsers(currentUserId: number) {
    const users = await this.usersService.findAll();
    return users.filter((u) => u.id !== currentUserId);
  }

  async getUserDetail(id: string) {
    return this.usersService.findUserById(Number(id));
  }

  async banUser(userId: string) {
    try {
      await this.usersService.updateUserStatus(Number(userId), false);
      return { message: 'User banned successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async unbanUser(userId: string) {
    try {
      await this.usersService.updateUserStatus(Number(userId), true);
      return { message: 'User unbanned successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUser(id: string) {
    await this.usersService.remove(Number(id));
    return { message: 'User deleted successfully' };
  }

  async changeUserRole(_id: string, _body: { role: Role }) {
    // TODO: Implement change user role in UsersService
    return { message: 'TODO: Change user role' };
  }

  async getAllCourses() {
    // TODO: Inject CourseService and use findAll/findAllWithAdminRole
    return { message: 'TODO: Get all courses' };
  }

  async getCourseDetail(id: string) {
    // TODO: Get course detail for admin
    return { message: 'TODO: Get course detail' };
  }

  async getPendingCourses() {
    // TODO: Get pending courses
    return { message: 'TODO: Get pending courses' };
  }

  async activateCourse(id: string) {
    // TODO: Activate course
    return { message: 'TODO: Activate course' };
  }

  async deactivateCourse(id: string) {
    // TODO: Deactivate course
    return { message: 'TODO: Deactivate course' };
  }

  async deleteCourse(id: string) {
    try {
      await this.courseService.remove(Number(id));
      return { message: 'Course deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllPosts() {
    // TODO: Inject PostService and use findAll
    return { message: 'TODO: Get all posts' };
  }

  async deletePost(id: string) {
    // TODO: Delete post as admin
    return { message: 'TODO: Delete post' };
  }

  async getAllComments() {
    // TODO: Inject CommentPostService and use findAll
    return { message: 'TODO: Get all comments' };
  }

  async deleteComment(id: string) {
    // TODO: Delete comment as admin
    return { message: 'TODO: Delete comment' };
  }

  async getAllCategories() {
    // TODO: Inject CategoryService and use findAll
    return { message: 'TODO: Get all categories' };
  }

  async createCategory(_body: any) {
    // TODO: Create category
    return { message: 'TODO: Create category' };
  }

  async updateCategory(id: string, _body: any) {
    // TODO: Update category
    return { message: 'TODO: Update category' };
  }

  async deleteCategory(id: string) {
    // TODO: Delete category
    return { message: 'TODO: Delete category' };
  }

  async getDashboardStats() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const [revenueByMonth, usersByMonth] = await Promise.all([
      this.orderStatsService.getRevenueByMonth(year),
      this.userStatsService.getUsersByMonth(year),
    ]);

    // Tổng doanh thu
    const totalRevenue = revenueByMonth.data.reduce((a, b) => a + b, 0);
    // Tổng số người dùng
    const totalUsers = usersByMonth.data.reduce((a, b) => a + b, 0);

    // Số khoá học đang hoạt động
    const activeCourses = (await this.courseService.findAll()).length;

    // Số lượng tài khoản tạo trong tháng hiện tại
    const newSignups =
      usersByMonth.data[
        usersByMonth.labels.findIndex((l) => l === `Tháng ${month}`)
      ] || 0;

    return {
      revenueByMonth,
      usersByMonth,
      totalRevenue,
      totalUsers,
      activeCourses,
      newSignups,
    };
  }
}
