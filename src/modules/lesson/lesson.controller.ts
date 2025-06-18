import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/request/create-lesson.dto';
import { UpdateLessonDto } from './dto/request/update-lesson.dto';
import { ViewLessonDto } from './dto/response/view-lesson.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { FileValidator } from 'src/common/validators/file.validator';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/common/constants/storage';
import { TopicService } from '../topic/topic.service';

@Controller('topics/:topicId/lessons')
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly topicService: TopicService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('video', { storage }))
  async create(
    @Param('topicId') topicId: string,
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ViewLessonDto> {
    
    const topic = await this.topicService.findOne(+topicId);
    if (!topic) {
      throw new NotFoundException(`Topic #${topicId} not found`);
    }
    if (!file) {
      throw new BadRequestException({
        message: 'Video file is required',
        description: 'Video file is required',
      });
    }
    FileValidator.validateVideo(file);
    const result = await this.cloudinaryService.uploadVideo(file.path);
    return this.lessonService.create(
      createLessonDto,
      topic,
      result.eager?.[0]?.secure_url || result.secure_url,
      Math.round(result.duration),
    );
  }

  @Post('many')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'videos', maxCount: 10 },
      ],
      { storage },
    ),
  )
  async createManyWithVideos(
    @Param('topicId') topicId: string,
    @Body('createLessonsData') createLessonsDataRaw: string,
    @UploadedFiles() files: { videos?: Express.Multer.File[] },
  ): Promise<ViewLessonDto[]> {
    let createLessonsData: CreateLessonDto[];
    try {
      createLessonsData = JSON.parse(createLessonsDataRaw);
    } catch (e) {
      throw new BadRequestException('Invalid createLessonsData format');
    }
    const videos = files.videos || [];
    
    if (videos.length === 0) {
      throw new BadRequestException('At least one video file is required');
    }

    if (videos.length !== createLessonsData.length) {
      throw new BadRequestException(
        `Number of videos (${videos.length}) must match number of lessons (${createLessonsData.length})`,
      );
    }

    const topic = await this.topicService.findOne(+topicId);
    if (!topic) {
      throw new NotFoundException(`Topic #${topicId} not found`);
    }

    const videoUploadPromises = videos.map(async (video) => {
      FileValidator.validateVideo(video);
      const result = await this.cloudinaryService.uploadVideo(video.path);
      return {
        url: result.eager?.[0]?.secure_url || result.secure_url,
        duration: Math.round(result.duration),
      };
    });

    const videoResults = await Promise.all(videoUploadPromises);

    const lessonsWithVideos = createLessonsData.map((lessonData, index) => ({
      topicId: +topicId,
      data: lessonData,
      videoUrl: videoResults[index].url,
      videoDuration: videoResults[index].duration,
    }));

    return this.lessonService.createMany(lessonsWithVideos);
  }

  @Get()
  findAll(@Param('topicId') topicId: string): Promise<ViewLessonDto[]> {
    return this.lessonService.findAllByTopic(+topicId);
  }

  @Get(':id')
  findOne(
    @Param('topicId') topicId: string,
    @Param('id') id: string,
  ): Promise<ViewLessonDto> {
    return this.lessonService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('video', { storage }))
  async update(
    @Param('topicId') topicId: string,
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ViewLessonDto> {
    if (!file) {
      throw new BadRequestException({
        message: 'Video file is required',
        description: 'Video file is required',
      });
    }
    FileValidator.validateVideo(file);
    const result = await this.cloudinaryService.uploadVideo(file.path);
    return this.lessonService.update(
      +id,
      updateLessonDto,
      +topicId,
      result.eager?.[0]?.secure_url || result.secure_url,
      Math.round(result.duration),
    );
  }

  @Delete(':id')
  remove(
    @Param('topicId') topicId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.lessonService.remove(+id);
  }
}
