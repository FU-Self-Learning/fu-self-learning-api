import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { tmpdir } from 'os';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../config/jwt';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

const storage = diskStorage({
  destination: tmpdir(),
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  @UseInterceptors(FileInterceptor('image', { storage }))
  async create(
    @Body() dto: CreatePostDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      this.cloudinaryService.validateFile(file, 'image');
    }

    return this.postService.create(dto, req.user.id, file);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      this.cloudinaryService.validateFile(file, 'image');
    }

    return this.postService.update(+id, dto, req.user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.postService.remove(+id, req.user.id);
  }
}
