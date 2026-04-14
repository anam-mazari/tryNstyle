'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetProductsQuery } from '@/store/api/productsApi';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import Link from 'next/link';

export default function FavoritesPage() {
  const favoriteIds = useSelector((state: RootState) => state.favorites.ids);
  const { data: products, isLoading, error } = useGetProductsQuery();

  const favoriteProducts = useMemo(() => {
    if (!products?.length || !favoriteIds.length) return [];
    const set = new Set(favoriteIds);
    return products.filter((p) => set.has(p.id));
  }, [products, favoriteIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-normal text-neutral-900 md:text-4xl">Favorites</h1>
        <p className="mt-2 text-neutral-600">Frames you&apos;ve saved for later</p>
      </div>

      {favoriteIds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-16 text-center">
          <p className="text-neutral-600">You don&apos;t have any favorites yet.</p>
          <p className="mt-2 text-sm text-neutral-500">
            Use the heart on a product card to save frames here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-md bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <ProductGrid products={favoriteProducts} isLoading={isLoading} error={error} />
      )}
    </div>
  );
}
