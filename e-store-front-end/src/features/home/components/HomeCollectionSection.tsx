'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useGetProductsQuery } from '@/store/api/productsApi';
import type { Product } from '@/types/entities';
import { getProductCategoryName } from '@/utils/product-labels';
import { ProductCard } from '@/features/products/components/ProductCard';
import { LensProductCard } from '@/features/products/components/LensProductCard';

export function HomeCollectionSection() {
  // Exclude Contact Lenses from the home page — they live on /lenses
  // The backend supports ?category= filtering, so we fetch everything
  // and filter client-side since the API doesn't support "exclude category".
  const { data: allProducts, isLoading, error } = useGetProductsQuery();

  const products = useMemo((): Product[] => {
    // Filter out Contact Lenses so they don't appear on the home feed
    return (allProducts ?? []).filter((product) => {
      const categoryName = getProductCategoryName(product.category) ?? '';
      return categoryName.toLowerCase() !== 'contact lenses';
    });
  }, [allProducts]);

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const [page, setPage] = useState<number>(1);

  const visibleProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [page, products]);

  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            The collection
          </p>
          <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-neutral-900 md:text-4xl">
            Find your frames
          </h2>
          <p className="mt-4 text-neutral-600">
            Browse our full catalog—filter by brand, style, or search for your perfect pair.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/products"
            className="text-sm font-semibold text-neutral-900 underline-offset-4 transition hover:underline"
          >
            View all products
          </Link>
          <Link
            href="/lenses"
            className="text-sm font-semibold text-neutral-900 underline-offset-4 transition hover:underline"
          >
            Shop lenses →
          </Link>
        </div>
      </div>

      {/* Products area: 5 items per page, fills width on desktop, scrolls horizontally on small screens */}
      {isLoading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          Loading products…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
          Could not load products. Please try again.
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          No products yet.
        </div>
      ) : (
        <>
          <div
            className="overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300"
            role="region"
            aria-label="Home products"
          >
            <div className="min-w-[760px]">
              <div className="grid grid-cols-5 gap-4">
                {visibleProducts.map((product) => {
                  const isLens =
                    (getProductCategoryName(product.category) ?? '')
                      .toLowerCase() === 'contact lenses';
                  return isLens ? (
                    <LensProductCard key={product.id} product={product} />
                  ) : (
                    <ProductCard key={product.id} product={product} />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Arrow navigation (carousel-style) */}
          {pageCount > 1 ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-600">
                Page <span className="font-semibold text-neutral-900">{page}</span> of{' '}
                <span className="font-semibold text-neutral-900">{pageCount}</span>
              </p>
              <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-inset transition ${
                  canPrev
                    ? 'bg-white text-neutral-900 ring-neutral-300 hover:bg-neutral-50'
                    : 'cursor-not-allowed bg-neutral-100 text-neutral-400 ring-neutral-200'
                }`}
                aria-label="Scroll left"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-inset transition ${
                  canNext
                    ? 'bg-neutral-900 text-white ring-neutral-900 hover:bg-neutral-800'
                    : 'cursor-not-allowed bg-neutral-200 text-neutral-400 ring-neutral-200'
                }`}
                aria-label="Scroll right"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
