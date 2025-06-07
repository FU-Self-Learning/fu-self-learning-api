import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/config/jwt';
import { RolesGuard } from 'src/config/guards/roles.guard';
import { Roles } from 'src/config/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(Role.Instructor)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Roles(Role.Student, Role.Instructor)
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @Roles(Role.Student, Role.Instructor)
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Instructor)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(Role.Instructor)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
} 