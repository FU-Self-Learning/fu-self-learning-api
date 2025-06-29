import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorRequest } from 'src/entities/instructor-request.entity';
import { InstructorRequestService } from './instructor-request.service';
import { InstructorRequestController } from './instructor-request.controller';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstructorRequest, User])],
  providers: [InstructorRequestService, CloudinaryService],
  controllers: [InstructorRequestController],
  exports: [],
})
export class InstructorRequestModule {}
