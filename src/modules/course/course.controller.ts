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
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { UpdateCourseDto } from './dto/request/update-course.dto';
import { RolesGuard } from '../../config/guards/roles.guard';
import { Roles } from '../../config/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/config/jwt';
import { CustomRequest } from 'src/common/types/request.type';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/common/constants/storage';
import { FileValidator } from 'src/common/validators/file.validator';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { DetailViewCourseDto } from './dto/response/detail-view-course.dto';

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
  @UseInterceptors(FileInterceptor('video', { storage }))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @UploadedFile() video: Express.Multer.File,
  ) {
    if (file) {
      FileValidator.validateImage(file);
      this.cloudinaryService.validateFile(file);
    }
    if (video) {
      FileValidator.validateVideo(video);
      this.cloudinaryService.validateFile(video);
    }
    const result = await this.cloudinaryService.uploadImage(file.path);
    const videoResult = await this.cloudinaryService.uploadVideo(video.path);
    return this.courseService.create(
      createCourseDto,
      req.user.id,
      result.secure_url,
      videoResult.secure_url,
    );
  }

  @Get()
  @Roles(Role.Student, Role.Instructor)
  findAll(@Request() _req) {
    return this.courseService.findAllWithAdminRole();
  }

  @Get(':id')
  @Roles(Role.Student, Role.Instructor)
  findOne(
    @Param('id') id: string,
    @Request() req: CustomRequest,
  ): Promise<DetailViewCourseDto> {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Instructor)
  @UseInterceptors(AnyFilesInterceptor({ storage }))
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const image = files.find(f => f.fieldname === 'image');
    const video = files.find(f => f.fieldname === 'video');
    let imageUrl = undefined;
    let videoUrl = undefined;
  
    if (image) {
      FileValidator.validateImage(image);
      const result = await this.cloudinaryService.uploadImage(image.path);
      imageUrl = result.secure_url;
    }
  
    if (video) {
      FileValidator.validateVideo(video);
      const result = await this.cloudinaryService.uploadVideo(video.path);
      videoUrl = result.eager?.[0]?.secure_url || result.secure_url;
    }
  
    return this.courseService.update(
      +id,
      updateCourseDto,
      req.user.id,
      imageUrl,
      videoUrl,
    );
  }

  @Delete(':id')
  @Roles(Role.Instructor)
  remove(@Param('id') id: string, @Request() _req) {
    return this.courseService.remove(+id);
  }
}
