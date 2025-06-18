import { BadRequestException } from '@nestjs/common';

export class FileValidator {
  private static readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  private static readonly MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB

  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
  ];

  private static readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ];

  private static readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

  static validateImage(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `File size exceeds the maximum limit of ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not supported. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }
  }

  static validateVideo(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > this.MAX_VIDEO_SIZE) {
      throw new BadRequestException(
        `Video size exceeds the maximum limit of ${this.MAX_VIDEO_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!this.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Video type not supported. Allowed types: ${this.ALLOWED_VIDEO_TYPES.join(', ')}`,
      );
    }
  }

  static validateDocument(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > this.MAX_DOCUMENT_SIZE) {
      throw new BadRequestException(
        `Document size exceeds the maximum limit of ${this.MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!this.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Document type not supported. Only PDF files are allowed.`,
      );
    }
  }
}
