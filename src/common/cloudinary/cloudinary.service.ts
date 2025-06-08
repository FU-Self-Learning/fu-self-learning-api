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

    validateFile(file: Express.Multer.File) {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExt = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            throw new BadRequestException('Unsupported file type');
        }
    }

    async uploadImage(filePath: string): Promise<any> {
        return await cloudinary.uploader.upload(filePath, {
            folder: 'post-image', 
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

    async deleteImage(publicId: string): Promise<any> {
        return await cloudinary.uploader.destroy(publicId);
    }
}
