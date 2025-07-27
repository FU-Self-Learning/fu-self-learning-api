import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoProgressService } from './video-progress.service';
import { VideoProgressController } from './video-progress.controller';
import { VideoProgress } from '../../entities/video-progress.entity';
import { Lesson } from '../../entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VideoProgress, Lesson])],
  controllers: [VideoProgressController],
  providers: [VideoProgressService],
  exports: [VideoProgressService],
})
export class VideoProgressModule {} 