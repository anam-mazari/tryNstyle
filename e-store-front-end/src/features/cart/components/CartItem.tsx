'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '@/store/slices/cartSlice';
import type { CartItem as CartItemType } from '@/store/slices/cartSlice';
import { getProductBrandName, getProductCategoryName } from '@/utils/product-labels';
import { resolveProductImageUrl } from '@/utils/product-color-variants';
import toast from 'react-hot-toast';

interface CartItemProps {
  item: CartItemType;
}

function buildDetailLines(product: CartItemType['product']): string[] {
  const lines: string[] = [];
  const addLine = (raw: string): void => {
    const trimmed = raw.trim();
    if (!trimmed || lines.includes(trimmed)) {
      return;
    }
    lines.push(trimmed);
  };
  if (product.frameStyle?.trim()) {
    addLine(product.frameStyle);
  }
  if (product.frameColor?.trim()) {
    addLine(`Color: ${product.frameColor.trim()}`);
  }
  if (product.shape?.trim()) {
    addLine(product.shape);
  }
  if (product.material?.trim()) {
    addLine(product.material);
  }
  return lines;
}

function getCartThumbnailUrl(product: CartItemType['product']): string | null {
  const primary = product.imageUrl ?? null;
  const variantImage =
    Array.isArray(product.colorVariantImages) && product.colorVariantImages.length > 0
      ? product.colorVariantImages[0]?.imageUrl ?? null
      : null;
  const lensFallback = product.lensImageUrl ?? null;
  return resolveProductImageUrl(primary ?? variantImage ?? lensFallback);
}

export function CartItem({ item }: CartItemProps) {
  const dispatch = useDispatch();
  const { product } = item;
  const brandLabel = getProductBrandName(product.brand);
  const categoryLabel = getProductCategoryName(product.category);
  const title = brandLabel || categoryLabel || 'Product';
  const imageSrc = getCartThumbnailUrl(product);
  const detailLines = buildDetailLines(product);
  const unitPrice = Number(product.price);
  const lineTotal = unitPrice * item.quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart({ productId: product.id, variantColor: item.variantColor }));
      toast.success('Item removed from cart');
    } else if (newQuantity > product.stockQuantity) {
      toast.error("You've reached the maximum quantity for this item.");
    } else {
      dispatch(
        updateQuantity({
          productId: product.id,
          quantity: newQuantity,
          variantColor: item.variantColor,
        }),
      );
    }
  };

  return (
    <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <Link
          href={`/products/${product.id}`}
          className="relative mx-auto shrink-0 sm:mx-0"
          aria-label={`View ${title}`}
        >
          <div className="relative h-28 w-28 overflow-hidden rounded-lg bg-neutral-100 sm:h-32 sm:w-32">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt=""
                fill
                className="object-contain"
                sizes="128px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                No image
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1">
            <Link
              href={`/products/${product.id}`}
              className="font-serif text-lg font-semibold leading-snug text-neutral-900 hover:underline"
            >
              {title}
            </Link>
            {categoryLabel ? (
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{categoryLabel}</p>
            ) : null}
            {detailLines.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                {detailLines.map((line, lineIndex) => (
                  <li key={`${lineIndex}-${line}`}>{line}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-2 text-sm tabular-nums text-neutral-700">
              ${unitPrice.toFixed(2)}{' '}
              <span className="text-neutral-500">each</span>
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-4 border-t border-neutral-100 pt-4 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 transition hover:bg-white"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums text-neutral-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= product.stockQuantity}
              className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <p className="text-base font-semibold tabular-nums text-neutral-900">${lineTotal.toFixed(2)}</p>
            <button
              type="button"
              onClick={() => {
                dispatch(
                  removeFromCart({
                    productId: product.id,
                    variantColor: item.variantColor,
                  }),
                );
                toast.success('Item removed from cart');
              }}
              className="mt-1 text-sm font-medium text-red-600 transition hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
