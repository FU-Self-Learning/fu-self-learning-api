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
  Logger,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseGenerationService } from './course-generation.service';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { UpdateCourseDto } from './dto/request/update-course.dto';
import {
  GeneratedCourseDto,
  GeneratedTopicDto,
} from './dto/request/generate-course-from-pdf.dto';
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
  private readonly logger = new Logger(CourseController.name);

  constructor(
    private readonly courseService: CourseService,
    private readonly courseGenerationService: CourseGenerationService,
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

  @Patch(':id/approve')
  @Roles(Role.Admin)
  async approveCourse(@Param('id') id: string, @Request() req) {
    return this.courseService.approveCourse(+id);
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
  findOneManage(
    @Param('id') id: string,
    @Request() req,
  ): Promise<InstructorViewCourseDto> {
    return this.courseService.findOneManage(+id, req.user.id);
  }

  @Get(':id')
  @Roles(Role.Student, Role.Instructor, Role.Admin)
  findOne(
    @Param('id') id: string,
    @Request() _req: CustomRequest,
  ): Promise<DetailViewCourseDto> {
    return this.courseService.findOne(+id);
  }

  @Get('category/:id')
  @Roles(Role.Student, Role.Instructor)
  findCoursesByCategory(@Param('id') id: string) {
    return this.courseService.findCoursesByCategory(+id);
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

  @Patch(':id/ban')
  @Roles(Role.Admin)
  async banCourse(@Param('id') id: string, @Request() req) {
    return this.courseService.banCourse(+id);
  }

  @Patch(':id/reject')
  @Roles(Role.Admin)
  async rejectCourse(@Param('id') id: string, @Request() req) {
    return this.courseService.rejectCourse(+id, 'Course is already rejected');
  }

  @Delete(':id')
  @Roles(Role.Instructor, Role.Admin)
  remove(@Param('id') id: string, @Request() _req) {
    return this.courseService.remove(+id);
  }

  // PDF Course Generation Endpoints
  @Post('generate-from-pdf')
  @Roles(Role.Instructor)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'pdf', maxCount: 1 }]))
  async generateCourseFromPdf(
    @UploadedFiles() files: { pdf?: Express.Multer.File[] },
    @Request() req: any,
  ) {
    if (!files.pdf || files.pdf.length === 0) {
      throw new BadRequestException('PDF file is required');
    }

    const pdfFile = files.pdf[0];

    // Validate file type
    if (!pdfFile.mimetype.includes('pdf')) {
      throw new BadRequestException('File must be a PDF');
    }

    // Validate file size (max 10MB)
    if (pdfFile.size > 10 * 1024 * 1024) {
      throw new BadRequestException('PDF file size must be less than 10MB');
    }
    return this.courseGenerationService.generateCourseFromPdf(
      pdfFile.buffer,
      req.user.id.toString(),
    );
  }

  @Post('create-with-structure')
  @Roles(Role.Instructor)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'videoIntro', maxCount: 1 },
    ]),
  )
  async createCourseWithStructure(
    @Body() body: { course: GeneratedCourseDto; topics: GeneratedTopicDto[] },
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      videoIntro?: Express.Multer.File[];
    },
    @Request() req: CustomRequest,
  ) {
    // Validate request body
    if (!body.course || !body.topics) {
      throw new BadRequestException('Course and topics data are required');
    }

    // Validate file sizes
    if (files.thumbnail && files.thumbnail.length > 0) {
      const thumbnailFile = files.thumbnail[0];
      if (thumbnailFile.size > 5 * 1024 * 1024) {
        // 5MB limit for images
        throw new BadRequestException(
          'Thumbnail image size must be less than 5MB',
        );
      }
    }

    if (files.videoIntro && files.videoIntro.length > 0) {
      const videoFile = files.videoIntro[0];
      if (videoFile.size > 100 * 1024 * 1024) {
        // 100MB limit for videos
        throw new BadRequestException(
          'Video intro size must be less than 100MB',
        );
      }
    }

    let imageUrl: string | undefined;
    let videoIntroUrl: string | undefined;

    // Upload thumbnail if provided
    if (files.thumbnail && files.thumbnail.length > 0) {
      const thumbnailFile = files.thumbnail[0];

      // Validate file type
      this.cloudinaryService.validateFile(thumbnailFile, 'image');

      try {
        const uploadedThumbnail =
          await this.cloudinaryService.uploadImageFromBuffer(
            thumbnailFile.buffer,
            'course-thumbnails',
          );
        imageUrl = uploadedThumbnail.secure_url;
      } catch (error) {
        this.logger.error('Error uploading thumbnail:', error);
        throw new BadRequestException('Failed to upload thumbnail image');
      }
    }

    // Upload video intro if provided
    if (files.videoIntro && files.videoIntro.length > 0) {
      const videoFile = files.videoIntro[0];

      // Validate file type
      this.cloudinaryService.validateFile(videoFile, 'video');

      try {
        const uploadedVideo =
          await this.cloudinaryService.uploadVideoFromBuffer(
            videoFile.buffer,
            'course-videos',
          );
        videoIntroUrl = uploadedVideo.secure_url;
      } catch (error) {
        this.logger.error('Error uploading video intro:', error);
        throw new BadRequestException('Failed to upload video intro');
      }
    }

    const course = await this.courseGenerationService.createCourseWithStructure(
      body.course,
      body.topics,
      req.user.sub.toString(),
      imageUrl,
      videoIntroUrl,
    );

    return {
      message: 'Course created successfully with generated structure',
      course,
    };
  }
}
