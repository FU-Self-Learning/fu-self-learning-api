import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common/exceptions';
import { extname } from 'path';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  private readonly allowedImageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.svg',
    '.jfif',
  ];
  private readonly allowedVideoExtensions = ['.mp4', '.webm', '.mov', '.avi'];
  private readonly allowedDocumentExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
  ];

  validateFile(
    file: Express.Multer.File,
    type: 'image' | 'video' | 'document',
  ) {
    const fileExt = extname(file.originalname).toLowerCase();

    let allowed;
    switch (type) {
      case 'image':
        allowed = this.allowedImageExtensions;
        break;
      case 'video':
        allowed = this.allowedVideoExtensions;
        break;
      case 'document':
        allowed = this.allowedDocumentExtensions;
        break;
      default:
        throw new BadRequestException('Invalid file type for validation');
    }

    if (!allowed.includes(fileExt)) {
      throw new BadRequestException(
        `Unsupported file type. Allowed: ${allowed.join(', ')}`,
      );
    }
  }

  async uploadImage(filePath: string): Promise<any> {
    return await cloudinary.uploader.upload(filePath, {
      folder: 'post-image',
    });
  }

  async uploadImageFromBuffer(
    buffer: Buffer,
    folder: string = 'post-image',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });
  }

  async uploadVideo(filePath: string): Promise<any> {
    return await cloudinary.uploader.upload(filePath, {
      folder: 'post-video',
      resource_type: 'video',
      eager: [
        {
          width: 854,
          crop: 'scale',
          format: 'mp4',
        },
      ],
    });
  }

  async uploadVideoFromBuffer(
    buffer: Buffer,
    folder: string = 'post-video',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video',
          eager: [
            {
              width: 854,
              crop: 'scale',
              format: 'mp4',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });
  }

  async uploadDocument(filePath: string): Promise<any> {
    return await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: 'upload-pdf',
      use_filename: true,
      unique_filename: false,
      type: 'upload',
    });
  }

  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<any> {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }
}
