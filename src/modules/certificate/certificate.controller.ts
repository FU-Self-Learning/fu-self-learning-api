import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { JwtAuthGuard } from '../../config/jwt/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('certificates')
@UseGuards(JwtAuthGuard)
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get('user')
  async getUserCertificates(@GetUser() user: any) {
    return this.certificateService.getUserCertificates(user.id);
  }

  @Get('course/:courseId')
  async getCourseCertificate(
    @Param('courseId') courseId: number,
    @GetUser() user: any,
  ) {
    return this.certificateService.getCertificate(user.id, courseId);
  }

  @Post('course/:courseId/generate')
  async generateCertificate(
    @Param('courseId') courseId: number,
    @GetUser() user: any,
  ) {
    return this.certificateService.generateCertificate(user.id, courseId);
  }

  @Get('course/:courseId/has-certificate')
  async hasCertificate(
    @Param('courseId') courseId: number,
    @GetUser() user: any,
  ) {
    return {
      hasCertificate: await this.certificateService.hasCertificate(user.id, courseId),
    };
  }

  @Get(':certificateId')
  async getCertificateById(
    @Param('certificateId') certificateId: number,
    @GetUser() user: any,
  ) {
    return this.certificateService.getCertificateById(certificateId, user.id);
  }
} 