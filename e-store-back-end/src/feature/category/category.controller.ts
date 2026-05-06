import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CategoryService } from 'src/core/services/category/category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      description?: string;
      parentCategoryId?: string;
    },
  ) {
    return this.categoryService.create(
      body.name,
      body.description,
      body.parentCategoryId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; parentCategoryId?: string },
  ) {
    return this.categoryService.update(
      id,
      body.name,
      body.description,
      body.parentCategoryId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
