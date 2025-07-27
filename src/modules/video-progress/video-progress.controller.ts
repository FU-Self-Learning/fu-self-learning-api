import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { VideoProgressService } from './video-progress.service';
import { JwtAuthGuard } from '../../config/jwt/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('video-progress')
@UseGuards(JwtAuthGuard)
export class VideoProgressController {
  constructor(private readonly videoProgressService: VideoProgressService) {}

  @Post('update')
  async updateVideoProgress(
    @Body() body: {
      lessonId: number;
      watchedDuration: number;
      totalDuration: number;
    },
    @GetUser() user: any,
  ) {
    return this.videoProgressService.updateVideoProgress(
      user.id,
      body.lessonId,
      body.watchedDuration,
      body.totalDuration,
    );
  }

  @Get('lesson/:lessonId')
  async getVideoProgress(
    @Param('lessonId') lessonId: number,
    @GetUser() user: any,
  ) {
    return this.videoProgressService.getVideoProgress(user.id, lessonId);
  }

  @Get('topic/:topicId/progress')
  async getTopicVideoProgress(
    @Param('topicId') topicId: number,
    @GetUser() user: any,
  ) {
    return this.videoProgressService.getTopicVideoProgress(user.id, topicId);
  }

  @Get('topic/:topicId/completed')
  async areAllTopicVideosCompleted(
    @Param('topicId') topicId: number,
    @GetUser() user: any,
  ) {
    return {
      completed: await this.videoProgressService.areAllTopicVideosCompleted(user.id, topicId),
    };
  }
} 