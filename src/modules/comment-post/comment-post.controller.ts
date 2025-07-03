import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentPostService } from './comment-post.service';
import { CreateCommentPostDto } from './dto/create-comment-post.dto';
import { UpdateCommentPostDto } from './dto/update-comment-post.dto';
import { JwtAuthGuard } from '../../config/jwt';

@Controller('commentsPost')
export class CommentPostController {
  constructor(private readonly commentService: CommentPostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCommentPostDto, @Request() req) {
    return this.commentService.create(dto, req.user.id);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findPostComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() dto: UpdateCommentPostDto,
    @Request() req,
  ) {
    return this.commentService.update(+id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentService.remove(id, req.user.id);
  }
}
