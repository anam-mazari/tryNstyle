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

/** Display name for an order line; contact lenses often omit `frameStyle`. */
export function getOrderLineDisplayName(product: Product | null | undefined): string {
  if (!product) {
    return 'Product';
  }
  const categoryName = getProductCategoryName(product.category);
  if (categoryName?.toLowerCase() === 'contact lenses') {
    const descriptionSnippet = product.description?.trim();
    const shortDescription =
      descriptionSnippet && descriptionSnippet.length > 48
        ? `${descriptionSnippet.slice(0, 48)}…`
        : descriptionSnippet;
    return (
      getProductBrandName(product.brand) ||
      product.frameStyle?.trim() ||
      product.frameColor?.trim() ||
      shortDescription ||
      'Contact lenses'
    );
  }
  return (
    product.frameStyle ||
    getProductBrandName(product.brand) ||
    categoryName ||
    'Product'
  );
}
