import {
  Controller,
  Patch,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Delete,
  Body,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/config/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/config/jwt';
import { RolesGuard } from 'src/config/guards/roles.guard';
import { CourseService } from '../course/course.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly courseService: CourseService,
  ) {}

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

  @Patch('users/:id/role')
  @Roles(Role.Admin)
  changeUserRole(@Param('id') _id: string, @Body() _body: { role: Role }) {
    // TODO: Implement change user role in UsersService
    return { message: 'TODO: Change user role' };
  }

  // --- COURSE MANAGEMENT ---
  @Get('courses')
  @Roles(Role.Admin)
  getAllCourses() {
    // TODO: Inject CourseService and use findAll/findAllWithAdminRole
    return { message: 'TODO: Get all courses' };
  }

  @Get('courses/:id')
  @Roles(Role.Admin)
  getCourseDetail(@Param('id') id: string) {
    // TODO: Get course detail for admin
    return { message: 'TODO: Get course detail' };
  }

  @Get('courses/pending')
  @Roles(Role.Admin)
  getPendingCourses() {
    // TODO: Get pending courses
    return { message: 'TODO: Get pending courses' };
  }

  @Patch('courses/:id/activate')
  @Roles(Role.Admin)
  activateCourse(@Param('id') id: string) {
    // TODO: Activate course
    return { message: 'TODO: Activate course' };
  }

  @Patch('courses/:id/deactivate')
  @Roles(Role.Admin)
  deactivateCourse(@Param('id') id: string) {
    // TODO: Deactivate course
    return { message: 'TODO: Deactivate course' };
  }

  @Delete('courses/:id')
  @Roles(Role.Admin)
  deleteCourse(@Param('id') id: string) {
    // TODO: Delete course as admin
    return { message: 'TODO: Delete course' };
  }

  // --- POST MANAGEMENT ---
  @Get('posts')
  @Roles(Role.Admin)
  getAllPosts() {
    // TODO: Inject PostService and use findAll
    return { message: 'TODO: Get all posts' };
  }

  @Delete('posts/:id')
  @Roles(Role.Admin)
  deletePost(@Param('id') id: string) {
    // TODO: Delete post as admin
    return { message: 'TODO: Delete post' };
  }

  // --- COMMENT MANAGEMENT ---
  @Get('comments')
  @Roles(Role.Admin)
  getAllComments() {
    // TODO: Inject CommentPostService and use findAll
    return { message: 'TODO: Get all comments' };
  }

  @Delete('comments/:id')
  @Roles(Role.Admin)
  deleteComment(@Param('id') id: string) {
    // TODO: Delete comment as admin
    return { message: 'TODO: Delete comment' };
  }

  // --- CATEGORY MANAGEMENT ---
  @Get('categories')
  @Roles(Role.Admin)
  getAllCategories() {
    // TODO: Inject CategoryService and use findAll
    return { message: 'TODO: Get all categories' };
  }

  @Post('categories')
  @Roles(Role.Admin)
  createCategory(@Body() _body: any) {
    // TODO: Create category
    return { message: 'TODO: Create category' };
  }

  @Put('categories/:id')
  @Roles(Role.Admin)
  updateCategory(@Param('id') id: string, @Body() _body: any) {
    // TODO: Update category
    return { message: 'TODO: Update category' };
  }

  @Delete('categories/:id')
  @Roles(Role.Admin)
  deleteCategory(@Param('id') id: string) {
    // TODO: Delete category
    return { message: 'TODO: Delete category' };
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
