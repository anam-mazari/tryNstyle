import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { BrandService } from 'src/core/services/brand/brand.service';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Post()
  create(@Body() body: { name: string; description?: string; logoUrl?: string }) {
    return this.brandService.create(body.name, body.description, body.logoUrl);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; logoUrl?: string },
  ) {
    return this.brandService.update(id, body.name, body.description, body.logoUrl);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}


