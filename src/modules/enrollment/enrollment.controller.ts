import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
  Body,
  ValidationPipe,
  Req,
  Delete,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '../../config/jwt/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-courses')
  async getMyEnrollments(@Req() req: any) {
    return this.enrollmentService.getUserEnrollments(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('course/:courseId/check')
  async checkEnrollment(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const isEnrolled = await this.enrollmentService.isUserEnrolled(
      req.user.id,
      courseId,
    );
    return { isEnrolled };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('course/:courseId')
  async updateEnrollment(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body(ValidationPipe) updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    if (updateEnrollmentDto.progress === undefined) {
      throw new Error('Progress is required');
    }
    return this.enrollmentService.updateProgress(
      req.user.id,
      courseId,
      updateEnrollmentDto.progress,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('course/:courseId')
  async deleteEnrollment(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.enrollmentService.deleteEnrollment(req.user.id, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getEnrollmentById(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.getEnrollmentById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('course/:courseId/certificate')
  async setCertificate(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body('certificateUrl') certificateUrl: string,
  ) {
    const user = req.user as User;
    return this.enrollmentService.setCertificateUrl(
      user.id,
      courseId,
      certificateUrl,
    );
  }
}
