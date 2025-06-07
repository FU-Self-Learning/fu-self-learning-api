import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';

@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post()
  create(@Body() dto: CreateFlashcardDto) {
    return this.flashcardsService.create(dto);
  }

  @Get()
  findAll() {
    return this.flashcardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flashcardsService.findOne(id);
  }

  @Get('topic/:topicId')
  findByTopic(@Param('topicId', ParseIntPipe) topicId: number) {
    return this.flashcardsService.findByTopic(topicId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashcardDto,
  ) {
    return this.flashcardsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.flashcardsService.remove(id);
  }
}
