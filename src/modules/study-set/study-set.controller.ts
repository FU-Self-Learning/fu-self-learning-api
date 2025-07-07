import { Controller, Post, Body, Get, Param, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { StudySetService } from './study-set.service';
import { CreateStudySetDto } from './dto/create-study-set.dto';
import { UpdateStudySetDto } from './dto/update-study-set.dto';
import { JwtAuthGuard } from 'src/config/jwt';

@Controller('study-sets')
@UseGuards(JwtAuthGuard)
export class StudySetController {
  constructor(private readonly studySetService: StudySetService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateStudySetDto) {
    return this.studySetService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.studySetService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: number) {
    return this.studySetService.findOneById(id, req.user.id);
  }

  @Put(':id')
  update(@Req() req, @Param('id') id: number, @Body() dto: UpdateStudySetDto) {
    return this.studySetService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: number) {
    return this.studySetService.remove(id, req.user.id);
  }
} 