import {
  Controller,
  Patch,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Delete,
  Req,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/config/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/config/jwt';
import { RolesGuard } from 'src/config/guards/roles.guard';
import { CourseService } from '../course/course.service';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
  ) {}
  // --- TOP COURSES ---
  @Get('courses/top-purchased')
  @Roles(Role.Admin)
  async getTopPurchasedCourses() {
    const topCourses = await this.enrollmentService.getTopPurchasedCourses(5);
    return topCourses;
  }

  // --- USER MANAGEMENT ---
  @Get('users')
  @Roles(Role.Admin)
  async getAllUsers(@Req() req) {
    const currentUserId = req.user?.userId || req.user?.id;
    const users = await this.usersService.findAll();
    return users.filter((u) => u.id !== currentUserId);
  }

  @Get('users/:id')
  @Roles(Role.Admin)
  getUserDetail(@Param('id') id: string) {
    return this.usersService.findUserById(Number(id));
  }

  @Patch('ban/:userId')
  @Roles(Role.Admin)
  async banUser(@Param('userId') userId: string) {
    try {
      await this.usersService.updateUserStatus(Number(userId), false);
      return { message: 'User banned successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('unban/:userId')
  @Roles(Role.Admin)
  async unbanUser(@Param('userId') userId: string) {
    try {
      await this.usersService.updateUserStatus(Number(userId), true);
      return { message: 'User unbanned successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('users/:id')
  @Roles(Role.Admin)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.remove(Number(id));
    return { message: 'User deleted successfully' };
  }

  // --- DASHBOARD STATISTICS ---
  @Get('dashboard-stats')
  @Roles(Role.Admin)
  async getDashboardStats() {
    const users = await this.usersService.findAll();
    const activeCourses = await this.courseService.findAll();
    const newSignups = users.filter((u) => {
      const today = new Date();
      const created = new Date(u.createdAt);
      return (
        created.getDate() === today.getDate() &&
        created.getMonth() === today.getMonth() &&
        created.getFullYear() === today.getFullYear()
      );
    }).length;
    return {
      totalRevenue: 0,
      totalUsers: users.length,
      activeCourses: activeCourses.length,
      newSignups,
    };
  }
}
