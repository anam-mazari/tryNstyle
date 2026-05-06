'use client';

import Link from 'next/link';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import type { Product } from '@/types/entities';
import { getProductBrandName, getProductCategoryName } from '@/utils/product-labels';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

export function ProductTable({ products, onDelete, deletingId }: ProductTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Product</TableHeader>
          <TableHeader>Price</TableHeader>
          <TableHeader>Stock</TableHeader>
          <TableHeader>Category</TableHeader>
          <TableHeader className="text-right">Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="text-sm font-medium text-gray-900">
                {getProductBrandName(product.brand) || getProductCategoryName(product.category) || 'Product'}
              </div>
              <div className="text-sm text-gray-500">{product.frameStyle}</div>
            </TableCell>
            <TableCell className="text-gray-900">
              ${Number(product.price).toFixed(2)}
            </TableCell>
            <TableCell className="text-gray-500">
              {product.stockQuantity}
            </TableCell>
            <TableCell className="text-gray-500 capitalize">
              {getProductCategoryName(product.category) || '-'}
            </TableCell>
            <TableCell className="text-right">
              <Link
                href={`/dashboard/products/${product.id}`}
                className="text-gray-900 hover:text-gray-700"
              >
                Edit
              </Link>
              <button
                onClick={() => onDelete(product.id)}
                disabled={deletingId === product.id}
                className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {deletingId === product.id ? 'Deleting...' : 'Delete'}
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}




