'use client';

import { useParams } from 'next/navigation';
import { useGetProductQuery } from '@/store/api/productsApi';
import { ProductDetails } from '@/features/products/components/ProductDetails';

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  const { data: product, isLoading, error } = useGetProductQuery(productId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">Product not found</p>
            <p className="mt-2 text-sm text-gray-600">
              The product you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetails product={product} />
    </div>
  );
}

