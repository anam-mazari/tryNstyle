'use client';

import { ProductCard } from './ProductCard';
import { LensProductCard } from './LensProductCard';
import { ProductCardSkeleton } from '@/components/ui/LoadingSkeleton';
import type { Product } from '@/types/entities';
import { getProductCategoryName } from '@/utils/product-labels';

function getFetchErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Please try again later';
  }
  const record = error as Record<string, unknown>;
  const data = record.data;
  if (data && typeof data === 'object' && 'message' in data) {
    const nested = (data as Record<string, unknown>).message;
    if (typeof nested === 'string') {
      return nested;
    }
  }
  const top = record.message;
  if (typeof top === 'string') {
    return top;
  }
  return 'Please try again later';
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: unknown;
  emptyTitle?: string;
  emptyDescription?: string;
  /** `scroll` = single horizontal row with swipe / scrollbar (good for home). */
  layout?: 'grid' | 'scroll';
}

export function ProductGrid({
  products,
  isLoading,
  error,
  emptyTitle,
  emptyDescription,
  layout = 'grid',
}: ProductGridProps) {
  const isScroll = layout === 'scroll';

  if (isLoading) {
    if (isScroll) {
      return (
        <div className="flex gap-4 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:thin] sm:gap-6 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-[42vw] min-w-[150px] max-w-[220px] shrink-0 snap-start sm:w-[200px]"
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Error loading products</p>
          <p className="mt-2 text-sm text-gray-600">
            {getFetchErrorMessage(error)}
          </p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-600">
            {emptyTitle ?? 'No products found'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {emptyDescription ?? 'Check back later for new products'}
          </p>
        </div>
      </div>
    );
  }

  if (isScroll) {
    return (
      <div className="relative">
        <div
          className="flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:thin] snap-x snap-mandatory sm:gap-6 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300"
          role="region"
          aria-label="Product carousel"
        >
          {products.map((product) => {
            const isLens = getProductCategoryName(product.category)?.toLowerCase() === 'contact lenses';
            return (
              <div
                key={product.id}
                className="w-[42vw] min-w-[150px] max-w-[220px] shrink-0 snap-start sm:w-[200px]"
              >
                {isLens ? <LensProductCard product={product} /> : <ProductCard product={product} />}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-neutral-500 sm:hidden" aria-hidden>
          Swipe for more
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
      {products.map((product) => {
        const isLens = getProductCategoryName(product.category)?.toLowerCase() === 'contact lenses';
        return isLens
          ? <LensProductCard key={product.id} product={product} />
          : <ProductCard key={product.id} product={product} />;
      })}
    </div>
  );
}

