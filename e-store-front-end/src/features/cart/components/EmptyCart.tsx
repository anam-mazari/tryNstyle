'use client';

import Link from 'next/link';

export function EmptyCart() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
      <p className="mb-8 text-gray-600">Add some products to get started!</p>
      <Link
        href="/products"
        className="rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
      >
        Browse Products
      </Link>
    </div>
  );
}




