'use client';

import { useCreateProductMutation } from '@/store/api/productsApi';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { CreateProductDto, UpdateProductDto } from '@/types/api';
import { getRtkErrorMessage } from '@/utils/get-rtk-error-message';

export default function NewProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    try {
      await createProduct(data as CreateProductDto).unwrap();
      toast.success('Product created successfully');
      router.push('/dashboard/products');
    } catch (error: unknown) {
      toast.error(getRtkErrorMessage(error, 'Failed to create product'));
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard/products"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Products
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Create New Product</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}

