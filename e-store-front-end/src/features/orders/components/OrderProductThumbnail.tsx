'use client';

import Image from 'next/image';
import type { Product } from '@/types/entities';
import { getOrderLineDisplayName } from '@/utils/product-labels';
import { getOrderLinePrimaryImageUrl } from '@/utils/product-color-variants';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function resolveImageSrc(imageUrl: string | null | undefined): string | null {
  const trimmed = imageUrl?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.startsWith('http') ? trimmed : `${API_BASE}${trimmed}`;
}

interface OrderProductThumbnailProps {
  imageUrl: string | null | undefined;
  alt: string;
  size?: number;
}

export function OrderProductThumbnail({
  imageUrl,
  alt,
  size = 72,
}: OrderProductThumbnailProps) {
  const src = resolveImageSrc(imageUrl);

  if (!src) {
    return (
      <div
        className="flex flex-shrink-0 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 text-gray-300"
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.22) }}
        aria-hidden
      >
        —
      </div>
    );
  }

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-contain"
        unoptimized
      />
    </div>
  );
}

interface OrderLineThumbnailsProps {
  items: { id: string; product?: Product | null }[];
  max?: number;
  size?: number;
}

/** Compact row of thumbnails for order list views (e.g. admin table). */
export function OrderLineThumbnails({ items, max = 3, size = 40 }: OrderLineThumbnailsProps) {
  const slice = items.slice(0, max);
  if (slice.length === 0) {
    return (
      <span className="text-xs text-gray-400" aria-hidden>
        —
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1" aria-label="Order line preview images">
      {slice.map((line) => {
        const label = getOrderLineDisplayName(line.product ?? undefined);
        const resolvedUrl = getOrderLinePrimaryImageUrl(line.product ?? undefined);
        return (
          <OrderProductThumbnail
            key={line.id}
            imageUrl={resolvedUrl}
            alt={label}
            size={size}
          />
        );
      })}
    </div>
  );
}
