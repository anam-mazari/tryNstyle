'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetProductQuery, useUpdateProductMutation } from '@/store/api/productsApi';
import { ProductForm } from '@/features/admin/components/ProductForm';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { CreateProductDto, UpdateProductDto } from '@/types/api';
import { getRtkErrorMessage } from '@/utils/get-rtk-error-message';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params.id === 'string' ? params.id : '';
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetProductQuery(productId, { skip: !productId });
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  
  const handleSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    try {
      await updateProduct({ id: productId, data: data as UpdateProductDto }).unwrap();
      toast.success('Product updated successfully');
      router.push('/dashboard/products');
    } catch (error: unknown) {
      toast.error(getRtkErrorMessage(error, 'Failed to update product'));
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  if (!productId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Invalid product link</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    const message =
      error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object'
        ? String((error.data as { message?: string }).message ?? '')
        : '';
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-red-600">Could not load product</p>
          <p className="mt-2 text-sm text-gray-600">
            {message || 'Check that the API is running and database migrations are applied (e.g. npm run migration:run in the backend).'}
          </p>
          <Link href="/dashboard/products" className="mt-4 inline-block text-sm font-medium text-gray-900 underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard/products"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Products
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProductForm
          key={product.id}
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isUpdating}
        />
      </div>
    </>
  );
}

