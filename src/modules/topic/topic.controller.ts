import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/request/create-topic.dto';
import { UpdateTopicDto } from './dto/request/update-topic.dto';
import { ViewAllTopicDto } from './dto/response/view-all-topic.dto';

@Controller('courses/:courseId/topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  create(
    @Param('courseId') courseId: string,
    @Body() createTopicDto: CreateTopicDto,
  ) {
    return this.topicService.create(+courseId, createTopicDto);
  }

  @Post('batch')
  createMany(
    @Param('courseId') courseId: string,
    @Body() createTopicDtos: CreateTopicDto[],
  ) {
    return this.topicService.createMany(+courseId, createTopicDtos);
  }

  @Get()
  findAll(@Param('courseId') courseId: string): Promise<ViewAllTopicDto[]> {
    return this.topicService.findAllByCourse(+courseId);
  }

  @Get(':id')
  findOne(@Param('courseId') courseId: string, @Param('id') id: string) {
    return this.topicService.findOneByCourse(+courseId, +id);
  }

  @Patch(':id')
  update(
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return this.topicService.updateByCourse(+courseId, +id, updateTopicDto);
  }

  @Delete(':id')
  remove(@Param('courseId') courseId: string, @Param('id') id: string) {
    return this.topicService.removeByCourse(+courseId, +id);
  }
}
