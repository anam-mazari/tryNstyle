'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import Link from 'next/link';

export function CartSummary() {
  const cart = useSelector((state: RootState) => state.cart);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 font-serif text-lg font-semibold text-neutral-900">Order summary</h2>
      <div className="space-y-3 border-b border-neutral-200 pb-5">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Subtotal</span>
          <span className="tabular-nums text-neutral-900">${cart.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Shipping</span>
          <span className="text-right text-neutral-700">At checkout</span>
        </div>
      </div>
      <div className="mt-5 flex justify-between border-b border-neutral-200 pb-5">
        <span className="text-base font-semibold text-neutral-900">Total</span>
        <span className="text-base font-semibold tabular-nums text-neutral-900">${cart.total.toFixed(2)}</span>
      </div>
      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-xl bg-neutral-900 px-4 py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}




