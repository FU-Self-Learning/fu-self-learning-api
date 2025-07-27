import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { CourseCertificate } from '../../entities/course-certificate.entity';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { TestAttempt } from '../../entities/test-attempt.entity';
import { Test } from '../../entities/test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseCertificate, User, Course, TestAttempt, Test])],
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificateModule {} 