import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from 'src/core/db/entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async findAll() {
    return this.brandRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(name: string, description?: string, logoUrl?: string) {
    const brand = this.brandRepository.create({
      name,
      description: description || null,
      logoUrl: logoUrl || null,
    });
    return await this.brandRepository.save(brand);
  }

  async update(
    id: string,
    name?: string,
    description?: string,
    logoUrl?: string,
  ) {
    const brand = await this.brandRepository.findOneBy({ id });
    if (!brand) throw new NotFoundException('Brand not found');

    if (name !== undefined) brand.name = name;
    if (description !== undefined) brand.description = description;
    if (logoUrl !== undefined) brand.logoUrl = logoUrl;

    return await this.brandRepository.save(brand);
  }

  async remove(id: string) {
    const brand = await this.brandRepository.findOneBy({ id });
    if (!brand) throw new NotFoundException('Brand not found');
    return this.brandRepository.remove(brand);
  }
}
