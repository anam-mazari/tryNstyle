'use client';

import Link from 'next/link';
import { useGetProductsQuery } from '@/store/api/productsApi';
import { ProductGrid } from '@/features/products/components/ProductGrid';

export function HomeCollectionSection() {
  // Exclude Contact Lenses from the home page — they live on /lenses
  // The backend supports ?category= filtering, so we fetch everything
  // and filter client-side since the API doesn't support "exclude category".
  const { data: allProducts, isLoading, error } = useGetProductsQuery();

  // Filter out Contact Lenses so they don't appear on the home feed
  const products = (allProducts ?? []).filter((p) => {
    const cat =
      typeof p.category === "string"
        ? p.category
        : (p.category as { name?: string } | null)?.name ?? "";
    return cat.toLowerCase() !== "contact lenses";
  });

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
      <ProductGrid
        products={products}
        isLoading={isLoading}
        error={error}
        layout="scroll"
      />
    </section>
  );
}
