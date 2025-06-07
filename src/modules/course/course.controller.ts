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
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { UpdateCourseDto } from './dto/request/update-course.dto';
import { RolesGuard } from '../../config/guards/roles.guard';
import { Roles } from '../../config/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/config/jwt';
import { CustomRequest } from 'src/common/types/request.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/common/constants/storage';
import { FileValidator } from 'src/common/validators/file.validator';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles(Role.Instructor)
  @UseInterceptors(FileInterceptor('image', { storage }))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      FileValidator.validateImage(file);
      this.cloudinaryService.validateFile(file);
    }
    
    const result = await this.cloudinaryService.uploadImage(file.path);
    return this.courseService.create(createCourseDto, req.user.id, result.secure_url);
  }

  @Get()
  @Roles(Role.Student, Role.Instructor)
  findAll(@Request() _req) {
    return this.courseService.findAllWithAdminRole();
  }

  @Get(':id')
  @Roles(Role.Student, Role.Instructor)
  findOne(@Param('id') id: string, @Request() req: CustomRequest) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Instructor)
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
  ) {
    return this.courseService.update(+id, updateCourseDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.Instructor)
  remove(@Param('id') id: string, @Request() _req) {
    return this.courseService.remove(+id);
  }
}
