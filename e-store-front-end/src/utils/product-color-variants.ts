import type { Product } from '@/types/entities';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ColorImageVariant {
  color: string;
  imageUrl: string;
  stockQuantity: number;
  isPrimary: boolean;
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
 * First usable image for order/admin line items: frame `imageUrl`, color variants, then
 * `lensImageUrl` (contact lenses often leave `imageUrl` empty).
 */
export function getOrderLinePrimaryImageUrl(product: Product | null | undefined): string | null {
  if (!product) {
    return null;
  }
  const record = product as Product & { lens_image_url?: string | null };
  const candidates: (string | null | undefined)[] = [product.imageUrl];

  if (Array.isArray(product.colorVariantImages)) {
    for (const variant of product.colorVariantImages) {
      candidates.push(variant?.imageUrl);
    }
  }

  candidates.push(product.lensImageUrl, record.lens_image_url);

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) {
      return resolveProductImageUrl(trimmed);
    }
  }

  return null;
}

/**
 * Primary frame uses `frameColor` + `imageUrl`; additional pairs live in `colorVariantImages`.
 * Returns a list for swatches and image swapping.
 *
 * Note: We do NOT dedupe by color label alone, because admins may upload multiple
 * images for the same named color (e.g. "Silver") and still expect them to appear.
 */
export function getColorVariantDisplayList(product: Product): ColorImageVariant[] {
  const primaryColor = product.frameColor?.trim() || 'Color';
  const primary: ColorImageVariant | null = product.imageUrl?.trim()
    ? {
        color: primaryColor,
        imageUrl: product.imageUrl.trim(),
        stockQuantity: Math.max(0, Number(product.stockQuantity ?? 0)),
        isPrimary: true,
      }
    : null;

  const rawExtras = product.colorVariantImages;
  const extrasList = Array.isArray(rawExtras) ? rawExtras : [];

  const extras = extrasList
    .map((entry) => ({
      color: entry.color?.trim() ?? '',
      imageUrl: entry.imageUrl?.trim() ?? '',
      stockQuantity: Math.max(0, Number(entry.stockQuantity ?? 0)),
      isPrimary: false,
    }))
    .filter((entry) => entry.color.length > 0 && entry.imageUrl.length > 0);

  const seen = new Set<string>();
  const result: ColorImageVariant[] = [];

  if (primary) {
    result.push(primary);
    seen.add(`${primary.color.toLowerCase()}::${primary.imageUrl}`);
  }

  for (const extra of extras) {
    const key = `${extra.color.toLowerCase()}::${extra.imageUrl}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push({
      color: extra.color,
      imageUrl: extra.imageUrl,
      stockQuantity: extra.stockQuantity,
      isPrimary: false,
    });
  }

  return result;
}
