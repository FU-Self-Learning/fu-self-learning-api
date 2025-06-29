import { Controller, Post, UseGuards, Request, UploadedFiles, UseInterceptors, BadRequestException, Body, Param, Patch, Get, Res } from '@nestjs/common';
import { JwtAuthGuard } from 'src/config/jwt';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { InstructorRequestService } from './instructor-request.service';
import { Roles } from 'src/config/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { storage } from 'src/common/constants/storage';
import axios from 'axios';
import { Response } from 'express';

@Controller('instructor-requests')
export class InstructorRequestController {
  constructor(private readonly instructorRequestService: InstructorRequestService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(Role.Student)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
      ],
      { storage },
    ),
  )
  async createRequest(
    @Request() req: any,
    @UploadedFiles() files: { pdf?: Express.Multer.File[] },
  ) {
    const pdf = files.pdf?.[0];
    if (!pdf || pdf.mimetype !== 'application/pdf') {
      throw new BadRequestException('PDF file is required');
    }
    return this.instructorRequestService.createRequest(req.user.id, pdf);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  @Roles(Role.Admin)
  async approveRequest(@Param('id') id: string) {
    return this.instructorRequestService.approveRequest(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  @Roles(Role.Admin)
  async rejectRequest(@Param('id') id: string, @Body('reason') reason: string) {
    return this.instructorRequestService.rejectRequest(Number(id), reason);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(Role.Admin)
  async viewAll() {
    return this.instructorRequestService.viewAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  @Roles(Role.Admin)
  async streamPdf(@Param('id') id: string, @Res() res: Response) {
    const request = await this.instructorRequestService.findById(Number(id));
    if (!request || !request.pdfUrl) {
      throw new BadRequestException('PDF not found');
    }
    const file = await axios.get(request.pdfUrl, { responseType: 'stream' });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="request.pdf"',
    });
    file.data.pipe(res);
  }
}
