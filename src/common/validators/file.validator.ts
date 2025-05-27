import { BadRequestException } from '@nestjs/common';

export class FileValidator {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
  ];

  static validateImage(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds the maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Check mime type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not supported. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
  }
} 