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
import { OrderService } from '../order/order.service';
import { RevenueStatDto } from './dto/stats.dto';
import { UserRegistrationStatDto } from './dto/stats.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly orderService: OrderService,
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
    const courses = await this.courseService.findAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newSignups = users.filter(u => {
      const created = new Date(u.createdAt);
      return (
        created.getDate() === today.getDate() &&
        created.getMonth() === today.getMonth() &&
        created.getFullYear() === today.getFullYear()
      );
    });
    
    const totalRevenue = await this.orderService.calculateTotalRevenue();
    
    return {
      totalRevenue,
      totalUsers: users.length,
      activeCourses: courses.length, // Using all courses since we don't have getActiveCourses
      newSignups: newSignups.length,
    };
  }

  @Get('stats/revenue')
  @Roles(Role.Admin)
  async getRevenueStats(): Promise<RevenueStatDto[]> {
    const months: RevenueStatDto[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const currentDate = new Date(now);
      currentDate.setMonth(now.getMonth() - i);
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      const revenue = await this.orderService.calculateMonthlyRevenue(
        startOfMonth,
        endOfMonth
      );
      
      months.push(new RevenueStatDto(
        `${String(month + 1).padStart(2, '0')}/${year}`,
        Number(revenue)
      ));
    }
    
    return months;
  }

  @Get('stats/users')
  @Roles(Role.Admin)
  async getUserRegistrationStats(): Promise<UserRegistrationStatDto[]> {
    const months: UserRegistrationStatDto[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const currentDate = new Date(now);
      currentDate.setMonth(now.getMonth() - i);
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      const users = await this.usersService.findUsersByDateRange(
        startOfMonth,
        endOfMonth
      );
      
      months.push(new UserRegistrationStatDto(
        `${String(month + 1).padStart(2, '0')}/${year}`,
        users.length
      ));
    }
    
    return months;
  }
}
