import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorRequest } from 'src/entities/instructor-request.entity';
import { User } from 'src/entities/user.entity';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class InstructorRequestService {
  constructor(
    @InjectRepository(InstructorRequest)
    private readonly instructorRequestRepo: Repository<InstructorRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createRequest(userId: number, pdf: Express.Multer.File): Promise<InstructorRequest> {
    if (!pdf || pdf.mimetype !== 'application/pdf') {
      throw new BadRequestException('PDF file is required');
    }
    this.cloudinaryService.validateFile(pdf, 'document');
    const result = await this.cloudinaryService.uploadDocument(pdf.path);
    if (!result?.secure_url) {
      throw new BadRequestException('PDF upload failed');
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const request = this.instructorRequestRepo.create({ user, pdfUrl: result.secure_url });
    return this.instructorRequestRepo.save(request);
  }

  async approveRequest(id: number): Promise<InstructorRequest> {
    const req = await this.instructorRequestRepo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    req.status = 'approved';
    req.user.role = Role.Instructor;
    this.userRepo.save(req.user);
    return this.instructorRequestRepo.save(req);
  }

  async rejectRequest(id: number, reason: string): Promise<InstructorRequest> {
    const req = await this.instructorRequestRepo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    req.status = 'rejected';
    req.rejectReason = reason;
    return this.instructorRequestRepo.save(req);
  }

  async viewAll(): Promise<InstructorRequest[]> {
    return this.instructorRequestRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<InstructorRequest | null> {
    return this.instructorRequestRepo.findOne({ where: { id } });
  }
}
