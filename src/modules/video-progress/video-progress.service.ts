import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoProgress } from '../../entities/video-progress.entity';
import { User } from '../../entities/user.entity';
import { Lesson } from '../../entities/lesson.entity';

@Injectable()
export class VideoProgressService {
  constructor(
    @InjectRepository(VideoProgress)
    private videoProgressRepository: Repository<VideoProgress>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async updateVideoProgress(
    userId: number,
    lessonId: number,
    watchedDuration: number,
    totalDuration: number,
  ): Promise<VideoProgress> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    let videoProgress = await this.videoProgressRepository.findOne({
      where: { user: { id: userId }, lesson: { id: lessonId } },
    });

    if (!videoProgress) {
      videoProgress = this.videoProgressRepository.create({
        user: { id: userId },
        lesson: { id: lessonId },
        watchedDuration: 0,
        totalDuration,
        progressPercentage: 0,
        isCompleted: false,
      });
    }

    videoProgress.watchedDuration = watchedDuration;
    videoProgress.totalDuration = totalDuration;
    videoProgress.progressPercentage = (watchedDuration / totalDuration) * 100;
    videoProgress.lastWatchedAt = new Date();

    // Check if video is completed (near the end: 5 seconds remaining or 8% of total duration)
    const remainingTime = totalDuration - watchedDuration;
    const completionThreshold = Math.min(5, totalDuration * 0.08);
    
    if (remainingTime <= completionThreshold && !videoProgress.isCompleted) {
      videoProgress.isCompleted = true;
      videoProgress.completedAt = new Date();
    }

    return this.videoProgressRepository.save(videoProgress);
  }

  async getVideoProgress(userId: number, lessonId: number): Promise<VideoProgress | null> {
    const videoProgress = await this.videoProgressRepository.findOne({
      where: { user: { id: userId }, lesson: { id: lessonId } },
    });

    return videoProgress || null;
  }

  async isVideoCompleted(userId: number, lessonId: number): Promise<boolean> {
    const videoProgress = await this.getVideoProgress(userId, lessonId);
    return videoProgress?.isCompleted || false;
  }

  async areAllTopicVideosCompleted(userId: number, topicId: number): Promise<boolean> {
    const lesson = await this.lessonRepository.findOne({
      where: { topic: { id: topicId } },
      relations: ['videoProgress'],
    });

    if (!lesson) {
      return false;
    }

    const videoProgress = await this.videoProgressRepository.findOne({
      where: { user: { id: userId }, lesson: { id: lesson.id } },
    });

    return videoProgress?.isCompleted || false;
  }

  async getTopicVideoProgress(userId: number, topicId: number): Promise<{
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
  }> {
    const lessons = await this.lessonRepository.find({
      where: { topic: { id: topicId } },
      relations: ['videoProgress'],
    });

    const totalLessons = lessons.length;
    let completedLessons = 0;

    for (const lesson of lessons) {
      const videoProgress = await this.videoProgressRepository.findOne({
        where: { user: { id: userId }, lesson: { id: lesson.id } },
      });

      if (videoProgress?.isCompleted) {
        completedLessons++;
      }
    }

    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      totalLessons,
      completedLessons,
      progressPercentage,
    };
  }
} 