import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { product } from 'src/core/db/entities/product';
import { Category } from 'src/core/db/entities/category.entity';
import { Brand } from 'src/core/db/entities/brand.entity';
import { FrameWidth } from 'src/core/enums/frame-width.enum';
import { ListProductsQueryDto } from 'src/core/services/product/list-products-query.dto';
import type { ProductFilterMetadata } from 'src/core/services/product/product-filter-metadata';

interface ProductPayload {
  price?: number | string;
  stockQuantity?: number;
  frameStyle?: string;
  frameColor?: string;
  shape?: string;
  description?: string;
  material?: string;
  frameWidth?: FrameWidth;
  categoryId?: string;
  brandId?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  colorVariantImages?: { color: string; imageUrl: string }[] | null;
  glbUrl?: string | null;
  lensImageUrl?: string | null;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(product)
    private readonly productRepository: Repository<product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  private async findOrCreateCategoryByName(name: string): Promise<Category> {
    const trimmed = name.trim();
    let entity = await this.categoryRepository
      .createQueryBuilder('c')
      .where('LOWER(c.name) = LOWER(:n)', { n: trimmed })
      .getOne();
    if (!entity) {
      entity = this.categoryRepository.create({ name: trimmed, description: null, parentCategoryId: null });
      entity = await this.categoryRepository.save(entity);
    }
    return entity;
  }

  private async findOrCreateBrandByName(name: string): Promise<Brand> {
    const trimmed = name.trim();
    let entity = await this.brandRepository
      .createQueryBuilder('b')
      .where('LOWER(b.name) = LOWER(:n)', { n: trimmed })
      .getOne();
    if (!entity) {
      entity = this.brandRepository.create({ name: trimmed, description: null, logoUrl: null });
      entity = await this.brandRepository.save(entity);
    }
    return entity;
  }

  async create(payload: ProductPayload) {
    let category: Category | null = null;
    let brand: Brand | null = null;

    if (payload.categoryId) {
      category = await this.categoryRepository.findOneBy({ id: payload.categoryId });
      if (!category) throw new NotFoundException(`Category with ID ${payload.categoryId} not found`);
    } else if (payload.category?.trim()) {
      category = await this.findOrCreateCategoryByName(payload.category);
    }

    if (payload.brandId) {
      brand = await this.brandRepository.findOneBy({ id: payload.brandId });
      if (!brand) throw new NotFoundException(`Brand with ID ${payload.brandId} not found`);
    } else if (payload.brand?.trim()) {
      brand = await this.findOrCreateBrandByName(payload.brand);
    }

    const variantImages =
      payload.colorVariantImages && payload.colorVariantImages.length > 0
        ? payload.colorVariantImages : null;

    const newProduct = this.productRepository.create({
      price:              Number(payload.price),
      stockQuantity:      payload.stockQuantity      ?? 1,
      frameStyle:         payload.frameStyle         ?? null,
      frameColor:         payload.frameColor         ?? null,
      shape:              payload.shape              ?? null,
      description:        payload.description        ?? null,
      material:           payload.material           ?? null,
      frameWidth:         payload.frameWidth         ?? null,
      category,
      brand,
      imageUrl:           payload.imageUrl           ?? null,
      colorVariantImages: variantImages,
      glbUrl:             payload.glbUrl             ?? null,
      lensImageUrl:       payload.lensImageUrl       ?? null,
    });

    return await this.productRepository.save(newProduct);
  }

  async update(id: string, payload: ProductPayload) {
    const existing = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand'],
    });
    if (!existing) throw new NotFoundException('Product not found');

    if (payload.price            !== undefined) existing.price            = Number(payload.price);
    if (payload.stockQuantity    !== undefined) existing.stockQuantity    = payload.stockQuantity;
    if (payload.frameStyle       !== undefined) existing.frameStyle       = payload.frameStyle;
    if (payload.frameColor       !== undefined) existing.frameColor       = payload.frameColor;
    if (payload.shape            !== undefined) existing.shape            = payload.shape;
    if (payload.description      !== undefined) existing.description      = payload.description;
    if (payload.material         !== undefined) existing.material         = payload.material;
    if (payload.frameWidth       !== undefined) existing.frameWidth       = payload.frameWidth;
    if (payload.imageUrl         !== undefined) existing.imageUrl         = payload.imageUrl;
    if (payload.glbUrl           !== undefined) existing.glbUrl           = payload.glbUrl ?? null;
    if (payload.lensImageUrl     !== undefined) existing.lensImageUrl     = payload.lensImageUrl ?? null;

    if (payload.colorVariantImages !== undefined) {
      existing.colorVariantImages =
        payload.colorVariantImages && payload.colorVariantImages.length > 0
          ? payload.colorVariantImages : null;
    }

    if (payload.categoryId !== undefined) {
      if (payload.categoryId) {
        const cat = await this.categoryRepository.findOneBy({ id: payload.categoryId });
        if (!cat) throw new NotFoundException(`Category ${payload.categoryId} not found`);
        existing.category = cat;
      } else { existing.category = null; }
    } else if (payload.category !== undefined) {
      existing.category = payload.category.trim() === ''
        ? null
        : await this.findOrCreateCategoryByName(payload.category);
    }

    if (payload.brandId !== undefined) {
      if (payload.brandId) {
        const br = await this.brandRepository.findOneBy({ id: payload.brandId });
        if (!br) throw new NotFoundException(`Brand ${payload.brandId} not found`);
        existing.brand = br;
      } else { existing.brand = null; }
    } else if (payload.brand !== undefined) {
      existing.brand = payload.brand.trim() === ''
        ? null
        : await this.findOrCreateBrandByName(payload.brand);
    }

    return await this.productRepository.save(existing);
  }

  private createListQueryBuilder(): SelectQueryBuilder<product> {
    return this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.brand', 'brand')
      .orderBy('p.createdAt', 'DESC');
  }

  private applyListFilters(qb: SelectQueryBuilder<product>, query: ListProductsQueryDto): void {
    if (query.categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId: query.categoryId });
    } else if (query.category?.trim()) {
      qb.andWhere('LOWER(category.name) = LOWER(:categoryName)', { categoryName: query.category.trim() });
    }
    if (query.brandId) {
      qb.andWhere('brand.id = :brandId', { brandId: query.brandId });
    } else if (query.brand?.trim()) {
      qb.andWhere('LOWER(brand.name) = LOWER(:brandName)', { brandName: query.brand.trim() });
    }
    if (query.frameStyle?.trim()) qb.andWhere('p.frameStyle = :frameStyle', { frameStyle: query.frameStyle.trim() });
    if (query.frameColor?.trim()) qb.andWhere('p.frameColor = :frameColor', { frameColor: query.frameColor.trim() });
    if (query.shape?.trim())      qb.andWhere('p.shape = :shape',           { shape: query.shape.trim() });
    if (query.material?.trim())   qb.andWhere('p.material = :material',     { material: query.material.trim() });
    if (query.frameWidth)         qb.andWhere('p.frameWidth = :frameWidth', { frameWidth: query.frameWidth });
    if (query.minPrice !== undefined) qb.andWhere('p.price >= :minPrice', { minPrice: query.minPrice });
    if (query.maxPrice !== undefined) qb.andWhere('p.price <= :maxPrice', { maxPrice: query.maxPrice });
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere(new Brackets((sub) => {
        sub.where('brand.name ILIKE :term', { term })
          .orWhere('category.name ILIKE :term', { term })
          .orWhere('p.frameStyle ILIKE :term', { term })
          .orWhere('p.frameColor ILIKE :term', { term })
          .orWhere('p.shape ILIKE :term', { term })
          .orWhere('p.description ILIKE :term', { term })
          .orWhere('p.material ILIKE :term', { term })
          .orWhere('CAST(p.frameWidth AS text) ILIKE :term', { term });
      }));
    }
  }

  async findMany(query: ListProductsQueryDto): Promise<product[]> {
    const qb = this.createListQueryBuilder();
    this.applyListFilters(qb, query);
    return qb.getMany();
  }

  private async distinctTrimmedColumn(
    column: 'frameStyle' | 'frameColor' | 'shape' | 'material' | 'frameWidth',
  ): Promise<string[]> {
    const rows = await this.productRepository
      .createQueryBuilder('p')
      .select(`p.${column}`, 'value')
      .where(`p.${column} IS NOT NULL`)
      .andWhere(`TRIM(p.${column}) <> ''`)
      .distinct(true)
      .orderBy(`p.${column}`, 'ASC')
      .getRawMany();
    return rows.map((r: { value: string | null }) => String(r.value ?? '').trim()).filter((v) => v.length > 0);
  }

  async getProductFilterMetadata(): Promise<ProductFilterMetadata> {
    const [categories, brands, frameStyles, frameColors, shapes, materials, frameWidths, priceRow] =
      await Promise.all([
        this.categoryRepository.createQueryBuilder('c').innerJoin('c.products', 'p').select(['c.id', 'c.name']).orderBy('c.name', 'ASC').getMany(),
        this.brandRepository.createQueryBuilder('b').innerJoin('b.products', 'p').select(['b.id', 'b.name']).orderBy('b.name', 'ASC').getMany(),
        this.distinctTrimmedColumn('frameStyle'),
        this.distinctTrimmedColumn('frameColor'),
        this.distinctTrimmedColumn('shape'),
        this.distinctTrimmedColumn('material'),
        this.distinctTrimmedColumn('frameWidth'),
        this.productRepository.createQueryBuilder('p').select('MIN(p.price)', 'min').addSelect('MAX(p.price)', 'max').getRawOne<{ min: string | null; max: string | null }>(),
      ]);

    const minPrice = priceRow?.min != null ? Number(priceRow.min) : 0;
    const maxPrice = priceRow?.max != null ? Number(priceRow.max) : 10000;

    return {
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      brands:     brands.map((b) => ({ id: b.id, name: b.name })),
      frameStyles, frameColors, shapes, materials, frameWidths,
      priceRange: { min: minPrice, max: Math.max(minPrice, maxPrice, 100) },
    };
  }

  async findOne(id: string) {
    const found = await this.productRepository.findOne({ where: { id }, relations: ['category', 'brand'] });
    if (!found) throw new NotFoundException('Product not found');
    return found;
  }

  async remove(id: string) {
    const found = await this.productRepository.findOneBy({ id });
    if (!found) throw new NotFoundException('Product not found');
    return this.productRepository.remove(found);
  }
}
