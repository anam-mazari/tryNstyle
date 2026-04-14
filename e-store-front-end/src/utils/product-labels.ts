import type { Product } from '@/types/entities';

/**
 * API may return `brand` as a string (legacy/mocks) or `{ id, name, ... }`.
 */
export function getProductBrandName(brand: Product['brand']): string | null {
  if (brand == null) {
    return null;
  }
  if (typeof brand === 'string') {
    return brand;
  }
  if (typeof brand === 'object' && brand !== null && 'name' in brand) {
    const name = (brand as { name: unknown }).name;
    return typeof name === 'string' ? name : null;
  }
  return null;
}

/**
 * API may return `category` as a string or `{ id, name, ... }`.
 */
export function getProductCategoryName(category: Product['category']): string | null {
  if (category == null) {
    return null;
  }
  if (typeof category === 'string') {
    return category;
  }
  if (typeof category === 'object' && category !== null && 'name' in category) {
    const name = (category as { name: unknown }).name;
    return typeof name === 'string' ? name : null;
  }
  return null;
}
