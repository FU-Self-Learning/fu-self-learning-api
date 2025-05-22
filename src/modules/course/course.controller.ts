import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RolesGuard } from '../../config/guards/roles.guard';
import { Roles } from '../../config/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/config/jwt';
import { CustomRequest } from 'src/common/types/request.type';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(Role.Instructor)
  create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.courseService.create(createCourseDto, req.user);
  }

  @Get()
  @Roles(Role.Student, Role.Instructor)
  findAll(@Request() req) {
    return this.courseService.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.Student, Role.Instructor)
  findOne(@Param('id') id: string, @Request() req: CustomRequest) {
    return this.courseService.findOne(+id, req.userInfo.uid.toString());
  }

  @Patch(':id')
  @Roles(Role.Instructor)
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
  ) {
    return this.courseService.update(+id, updateCourseDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.Instructor)
  remove(@Param('id') id: string, @Request() req) {
    return this.courseService.remove(+id, req.user);
  }
}
