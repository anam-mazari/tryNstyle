import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/core/db/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({ 
      where: { id },
      relations: ['products']
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(name: string, description?: string, parentCategoryId?: string) {
    const category = this.categoryRepository.create({
      name,
      description: description || null,
      parentCategoryId: parentCategoryId || null,
    });
    return await this.categoryRepository.save(category);
  }

  async update(id: string, name?: string, description?: string, parentCategoryId?: string) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (parentCategoryId !== undefined) category.parentCategoryId = parentCategoryId;

    return await this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');
    return this.categoryRepository.remove(category);
  }
}


