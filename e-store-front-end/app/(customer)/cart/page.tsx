'use client';

import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { clearCart } from '@/store/slices/cartSlice';
import { CartItem } from '@/features/cart/components/CartItem';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { EmptyCart } from '@/features/cart/components/EmptyCart';
import toast from 'react-hot-toast';

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-neutral-200 pb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          Your cart
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Review your items and continue when you&apos;re ready to check out.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2">
          <div className="space-y-5">
            {cart.items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              dispatch(clearCart());
              toast.success('Cart cleared');
            }}
            className="mt-6 text-sm font-medium text-red-600 transition hover:text-red-700"
          >
            Clear cart
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

