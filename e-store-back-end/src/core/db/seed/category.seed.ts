import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const categoryRepository = dataSource.getRepository(Category);

  const categories = [
    // Prescription Glasses
    {
      name: 'Prescription Glasses',
      description: 'Prescription eyewear for vision correction',
      parentCategoryId: null,
    },
    {
      name: 'Single Vision',
      description: 'Single vision prescription lenses',
      parentCategoryId: null,
    },
    {
      name: 'Bifocal',
      description: 'Bifocal lenses with two focal points',
      parentCategoryId: null,
    },
    {
      name: 'Trifocal',
      description: 'Trifocal lenses with three focal points',
      parentCategoryId: null,
    },
    {
      name: 'Progressive Lenses',
      description: 'Progressive lenses without visible lines',
      parentCategoryId: null,
    },
    {
      name: 'Reading Glasses',
      description: 'Glasses specifically for reading',
      parentCategoryId: null,
    },
    {
      name: 'Computer Glasses',
      description: 'Glasses designed for computer use',
      parentCategoryId: null,
    },

    // Sunglasses
    {
      name: 'Sunglasses',
      description: 'Protective eyewear for sun protection',
      parentCategoryId: null,
    },
    {
      name: 'Polarized Sunglasses',
      description: 'Sunglasses with polarized lenses',
      parentCategoryId: null,
    },
    {
      name: 'Photochromic / Transition Lenses',
      description: 'Lenses that darken in sunlight',
      parentCategoryId: null,
    },
    {
      name: 'Sports Sunglasses',
      description: 'Sunglasses designed for sports activities',
      parentCategoryId: null,
    },
    {
      name: 'Fashion Sunglasses',
      description: 'Stylish sunglasses for fashion',
      parentCategoryId: null,
    },

    // Safety / Protective Glasses
    {
      name: 'Safety / Protective Glasses',
      description: 'Protective eyewear for safety',
      parentCategoryId: null,
    },
    {
      name: 'Industrial Safety Glasses',
      description: 'Safety glasses for industrial use',
      parentCategoryId: null,
    },
    {
      name: 'Laboratory Glasses',
      description: 'Protective glasses for laboratory use',
      parentCategoryId: null,
    },
    {
      name: 'Sports Goggles',
      description: 'Protective goggles for sports',
      parentCategoryId: null,
    },
    {
      name: 'Shooting / Tactical Glasses',
      description: 'Tactical glasses for shooting sports',
      parentCategoryId: null,
    },

    // Specialty Glasses
    {
      name: 'Specialty Glasses',
      description: 'Specialized eyewear for specific needs',
      parentCategoryId: null,
    },
    {
      name: '3D Glasses',
      description: 'Glasses for 3D viewing',
      parentCategoryId: null,
    },
    {
      name: 'Gaming Glasses',
      description: 'Glasses designed for gaming',
      parentCategoryId: null,
    },
    {
      name: 'Anti-Fatigue Lenses',
      description: 'Lenses to reduce eye fatigue',
      parentCategoryId: null,
    },
    {
      name: 'Prism Glasses',
      description: 'Glasses with prism correction',
      parentCategoryId: null,
    },
    {
      name: 'Magnifying Glasses / Loupes',
      description: 'Magnifying eyewear',
      parentCategoryId: null,
    },

    // Fashion / Non-Prescription Glasses
    {
      name: 'Fashion / Non-Prescription Glasses',
      description: 'Fashion eyewear without prescription',
      parentCategoryId: null,
    },
    {
      name: 'Clear Lens Fashion Glasses',
      description: 'Fashion glasses with clear lenses',
      parentCategoryId: null,
    },
    {
      name: 'Colored Lenses',
      description: 'Glasses with colored lenses',
      parentCategoryId: null,
    },
    {
      name: 'Retro / Vintage Frames',
      description: 'Vintage style frames',
      parentCategoryId: null,
    },

    // Sports & Activity Glasses
    {
      name: 'Sports & Activity Glasses',
      description: 'Eyewear for sports and activities',
      parentCategoryId: null,
    },
    {
      name: 'Cycling Glasses',
      description: 'Glasses designed for cycling',
      parentCategoryId: null,
    },
    {
      name: 'Ski / Snowboard Goggles',
      description: 'Goggles for skiing and snowboarding',
      parentCategoryId: null,
    },
    {
      name: 'Swimming Goggles',
      description: 'Goggles for swimming',
      parentCategoryId: null,
    },

    // Kids & Children Glasses
    {
      name: 'Kids & Children Glasses',
      description: 'Eyewear designed for children',
      parentCategoryId: null,
    },
    {
      name: 'Durable Frames',
      description: 'Durable frames for children',
      parentCategoryId: null,
    },
    {
      name: 'UV-Protective Sunglasses',
      description: 'UV protective sunglasses for children',
      parentCategoryId: null,
    },
  ];

  for (const categoryData of categories) {
    const existingCategory = await categoryRepository.findOne({
      where: { name: categoryData.name },
    });

    if (!existingCategory) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`Created category: ${categoryData.name}`);
    } else {
      console.log(`Category already exists: ${categoryData.name}`);
    }
  }
}
