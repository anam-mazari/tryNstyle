import type { Product } from '@/types/entities';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ColorImageVariant {
  color: string;
  imageUrl: string;
}

/** Absolute URL for Next/Image or `<img>` (handles relative API paths and Cloudinary). */
export function resolveProductImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl?.trim()) {
    return null;
  }
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('http')) {
    return trimmed;
  }
  return `${API_URL}${trimmed}`;
}

/**
 * Primary frame uses `frameColor` + `imageUrl`; additional pairs live in `colorVariantImages`.
 * Returns a de-duplicated list for swatches and image swapping.
 */
export function getColorVariantDisplayList(product: Product): ColorImageVariant[] {
  const primaryColor = product.frameColor?.trim() || 'Color';
  const primary: ColorImageVariant | null = product.imageUrl?.trim()
    ? { color: primaryColor, imageUrl: product.imageUrl.trim() }
    : null;

  const rawExtras = product.colorVariantImages;
  const extrasList = Array.isArray(rawExtras) ? rawExtras : [];

  const extras = extrasList
    .map((entry) => ({
      color: entry.color?.trim() ?? '',
      imageUrl: entry.imageUrl?.trim() ?? '',
    }))
    .filter((entry) => entry.color.length > 0 && entry.imageUrl.length > 0);

  const seen = new Set<string>();
  const result: ColorImageVariant[] = [];

  if (primary) {
    result.push(primary);
    seen.add(primary.color.toLowerCase());
  }

  for (const extra of extras) {
    const key = extra.color.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push({ color: extra.color, imageUrl: extra.imageUrl });
  }

  return result;
}
