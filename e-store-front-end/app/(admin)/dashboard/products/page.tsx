'use client';

import { useGetProductsQuery, useDeleteProductMutation } from '@/store/api/productsApi';
import { ProductTable } from '@/features/admin/components/ProductTable';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getRtkErrorMessage } from '@/utils/get-rtk-error-message';

export default function AdminProductsPage() {
  const { data: products, isLoading, error } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setDeletingId(id);
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted successfully');
      } catch (error: unknown) {
        toast.error(getRtkErrorMessage(error, 'Failed to delete product'));
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">Manage your product catalog</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Add New Product
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] items-center justify-center px-4">
          <div className="max-w-lg text-center">
            <p className="text-lg font-semibold text-red-600">Error loading products</p>
            <p className="mt-2 text-sm text-gray-600">
              Ensure the backend is running and migrations are up to date. From{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">e-store-back-end</code> run:{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">npm run migration:run</code>
            </p>
          </div>
        </div>
      ) : products && products.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <ProductTable
            products={products}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>
      ) : (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-600">No products found</p>
            <Link
              href="/dashboard/products/new"
              className="mt-4 inline-block rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
            >
              Add Your First Product
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

