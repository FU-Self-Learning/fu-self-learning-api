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
  BadRequestException,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { UpdateCourseDto } from './dto/request/update-course.dto';
import { RolesGuard } from '../../config/guards/roles.guard';
import { Roles } from '../../config/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/config/jwt';
import { CustomRequest } from 'src/common/types/request.type';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { storage } from 'src/common/constants/storage';
import { FileValidator } from 'src/common/validators/file.validator';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { DetailViewCourseDto } from './dto/response/detail-view-course.dto';
import { InstructorViewCourseDto } from './dto/response/instructor-view-course.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async validateAndUploadFile(
    file: Express.Multer.File | undefined,
    type: 'image' | 'video' | 'document',
  ): Promise<string | undefined> {
    if (!file) return undefined;

    switch (type) {
      case 'image':
        FileValidator.validateImage(file);
        break;
      case 'video':
        FileValidator.validateVideo(file);
        break;
      case 'document':
        FileValidator.validateDocument(file);
        break;
    }

    this.cloudinaryService.validateFile(file, type);

    let result;
    switch (type) {
      case 'image':
        result = await this.cloudinaryService.uploadImage(file.path);
        break;
      case 'video':
        result = await this.cloudinaryService.uploadVideo(file.path);
        break;
      case 'document':
        result = await this.cloudinaryService.uploadDocument(file.path);
        break;
    }

    if (!result?.secure_url) {
      throw new BadRequestException(`${type} upload failed`);
    }

    return result.secure_url;
  }

  @Post()
  @Roles(Role.Instructor)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
        { name: 'document', maxCount: 1 },
      ],
      { storage },
    ),
  )
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Request() req,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
      document?: Express.Multer.File[];
    },
  ) {
    const image = files.image?.[0];
    if (!image) {
      throw new BadRequestException('Image is required');
    }

    const [imageUrl, videoUrl, documentUrl] = await Promise.all([
      this.validateAndUploadFile(image, 'image'),
      this.validateAndUploadFile(files.video?.[0], 'video'),
      this.validateAndUploadFile(files.document?.[0], 'document'),
    ]);

    return this.courseService.create(
      createCourseDto,
      req.user.id,
      imageUrl,
      videoUrl,
      documentUrl,
    );
  }

  @Get()
  @Roles(Role.Student, Role.Instructor, Role.Admin)
  findAll(@Request() _req) {
    return this.courseService.findAllWithAdminRole();
  }

  @Get('instructor')
  @Roles(Role.Instructor)
  findAllOwn(@Request() req) {
    return this.courseService.findAllOwn(req.user.id);
  }

  @Get('instructor/:id')
  @Roles(Role.Instructor)
  findOneManage(@Param('id') id: string, @Request() req): Promise<InstructorViewCourseDto> {
    return this.courseService.findOneManage(+id, req.user.id);
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
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const image = files.find((f) => f.fieldname === 'image');
    const video = files.find((f) => f.fieldname === 'video');
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
  @Roles(Role.Instructor, Role.Admin)
  remove(@Param('id') id: string, @Request() _req) {
    return this.courseService.remove(+id);
  }
}
