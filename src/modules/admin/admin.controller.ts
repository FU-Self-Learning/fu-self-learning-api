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
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // --- USER MANAGEMENT ---
  @Get('users')
  @Roles(Role.Admin)
  async getAllUsers(@Req() req) {
    const currentUserId = req.user?.userId || req.user?.id;
    return this.adminService.getAllUsers(currentUserId);
  }

  @Get('users/:id')
  @Roles(Role.Admin)
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('ban/:userId')
  @Roles(Role.Admin)
  async banUser(@Param('userId') userId: string) {
    return this.adminService.banUser(userId);
  }

  @Patch('unban/:userId')
  @Roles(Role.Admin)
  async unbanUser(@Param('userId') userId: string) {
    return this.adminService.unbanUser(userId);
  }

  @Delete('users/:id')
  @Roles(Role.Admin)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/role')
  @Roles(Role.Admin)
  changeUserRole(@Param('id') _id: string, @Body() _body: { role: Role }) {
    return this.adminService.changeUserRole(_id, _body);
  }

  // --- COURSE MANAGEMENT ---
  @Get('courses')
  @Roles(Role.Admin)
  getAllCourses() {
    return this.adminService.getAllCourses();
  }

  @Get('courses/:id')
  @Roles(Role.Admin)
  getCourseDetail(@Param('id') id: string) {
    return this.adminService.getCourseDetail(id);
  }

  @Get('courses/pending')
  @Roles(Role.Admin)
  getPendingCourses() {
    return this.adminService.getPendingCourses();
  }

  @Patch('courses/:id/activate')
  @Roles(Role.Admin)
  activateCourse(@Param('id') id: string) {
    return this.adminService.activateCourse(id);
  }

  @Patch('courses/:id/deactivate')
  @Roles(Role.Admin)
  deactivateCourse(@Param('id') id: string) {
    return this.adminService.deactivateCourse(id);
  }

  @Delete('courses/:id')
  @Roles(Role.Admin)
  async deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourse(id);
  }

  // --- POST MANAGEMENT ---
  @Get('posts')
  @Roles(Role.Admin)
  getAllPosts() {
    return this.adminService.getAllPosts();
  }

  @Delete('posts/:id')
  @Roles(Role.Admin)
  deletePost(@Param('id') id: string) {
    return this.adminService.deletePost(id);
  }

  // --- COMMENT MANAGEMENT ---
  @Get('comments')
  @Roles(Role.Admin)
  getAllComments() {
    return this.adminService.getAllComments();
  }

  @Delete('comments/:id')
  @Roles(Role.Admin)
  deleteComment(@Param('id') id: string) {
    return this.adminService.deleteComment(id);
  }

  // --- CATEGORY MANAGEMENT ---
  @Get('categories')
  @Roles(Role.Admin)
  getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Post('categories')
  @Roles(Role.Admin)
  createCategory(@Body() _body: any) {
    return this.adminService.createCategory(_body);
  }

  @Put('categories/:id')
  @Roles(Role.Admin)
  updateCategory(@Param('id') id: string, @Body() _body: any) {
    return this.adminService.updateCategory(id, _body);
  }

  @Delete('categories/:id')
  @Roles(Role.Admin)
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // --- DASHBOARD STATISTICS ---
  @Get('dashboard-stats')
  @Roles(Role.Admin)
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
