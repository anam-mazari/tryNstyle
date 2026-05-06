'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import type { Product } from '@/types/entities';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  product: Product;
  maxQtyOverride?: number;
  unavailableLabel?: string;
  variantColor?: string;
  className?: string;
}

export function AddToCartButton({
  product,
  maxQtyOverride,
  unavailableLabel = 'Unavailable',
  variantColor,
  className = '',
}: AddToCartButtonProps) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  const maxQty = Math.max(0, maxQtyOverride ?? product.stockQuantity);
  const unavailable = maxQty === 0;

  useEffect(() => {
    setQuantity(1);
  }, [product.id]);

  const clampQty = (value: number): number => {
    if (unavailable) {
      return 1;
    }
    return Math.max(1, Math.min(maxQty, value));
  };

  const handleAddToCart = () => {
    if (unavailable) {
      toast.error('This item is unavailable right now.');
      return;
    }

    const qty = clampQty(quantity);
    dispatch(addToCart({ product, quantity: qty, variantColor }));
    toast.success(qty === 1 ? 'Added to cart' : `Added ${qty} to cart`);
  };

  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center ${className}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setQuantity((previous) => clampQty(previous - 1))}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 text-neutral-800 transition hover:bg-neutral-50"
          aria-label="Decrease quantity"
          disabled={unavailable}
        >
          −
        </button>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => {
            const parsed = parseInt(event.target.value, 10);
            if (Number.isNaN(parsed)) {
              setQuantity(1);
              return;
            }
            setQuantity(clampQty(parsed));
          }}
          onBlur={() => setQuantity((previous) => clampQty(previous))}
          className="h-11 w-20 rounded-lg border border-neutral-300 bg-white px-3 text-center text-sm font-medium tabular-nums text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          aria-label="Quantity"
          disabled={unavailable}
        />
        <button
          type="button"
          onClick={() => setQuantity((previous) => clampQty(previous + 1))}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
          disabled={unavailable || quantity >= maxQty}
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={unavailable}
        className="min-h-[2.75rem] flex-1 rounded-xl bg-neutral-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {unavailable ? unavailableLabel : 'Add to cart'}
      </button>
    </div>
  );
}
