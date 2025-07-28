import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseCertificate } from '../../entities/course-certificate.entity';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { TestAttempt, AttemptStatus } from '../../entities/test-attempt.entity';
import { Test, TestType } from '../../entities/test.entity';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(CourseCertificate)
    private certificateRepository: Repository<CourseCertificate>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(TestAttempt)
    private testAttemptRepository: Repository<TestAttempt>,
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
  ) {}

  async generateCertificate(userId: number, courseId: number): Promise<CourseCertificate> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const course = await this.courseRepository.findOne({ where: { id: courseId } });

    if (!user || !course) {
      throw new NotFoundException('User or course not found');
    }

    // Check if user has completed final exam
    const finalExam = await this.testRepository.findOne({
      where: { course: { id: courseId }, type: TestType.FINAL_EXAM },
    });

    if (!finalExam) {
      throw new NotFoundException('Final exam not found for this course');
    }

    const finalExamAttempt = await this.testAttemptRepository.findOne({
      where: {
        test: { id: finalExam.id },
        user: { id: userId },
        status: AttemptStatus.COMPLETED,
        isPassed: true,
      },
    });

    if (!finalExamAttempt) {
      throw new NotFoundException('User has not completed the final exam');
    }

    // Check if certificate already exists
    const existingCertificate = await this.certificateRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    if (existingCertificate) {
      return existingCertificate;
    }

    // Generate certificate number
    const certificateNumber = `CERT-${courseId}-${userId}-${Date.now()}`;

    // Create certificate
    const certificate = this.certificateRepository.create({
      user,
      course,
      certificateNumber,
      finalScore: finalExamAttempt.score,
      issuedAt: new Date(),
      certificateUrl: `/certificates/${courseId}/${userId}/download`,
      isActive: true,
    });

    return this.certificateRepository.save(certificate);
  }

  async getUserCertificates(userId: number): Promise<CourseCertificate[]> {
    return this.certificateRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
      order: { issuedAt: 'DESC' },
    });
  }

  async getCertificate(userId: number, courseId: number): Promise<CourseCertificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
      relations: ['course', 'user'],
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async hasCertificate(userId: number, courseId: number): Promise<boolean> {
    const certificate = await this.certificateRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    return !!certificate;
  }

  async getCertificateById(certificateId: number, userId: number): Promise<CourseCertificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId, user: { id: userId } },
      relations: ['course', 'user'],
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }
} 