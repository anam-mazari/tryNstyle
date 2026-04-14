'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddToCartButton } from './AddToCartButton';
import type { Product } from '@/types/entities';
import { getFrameWidthLabel } from '@/types/frame-width';
import { getFrameColorCss } from '@/utils/frame-color-display';
import { getColorVariantDisplayList, resolveProductImageUrl } from '@/utils/product-color-variants';
import { getProductBrandName, getProductCategoryName } from '@/utils/product-labels';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import type { RootState } from '@/store/store';
import { HeartIcon } from '@/components/icons/CommerceIcons';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const dispatch = useDispatch();
  const brandLabel = getProductBrandName(product.brand);
  const categoryLabel = getProductCategoryName(product.category);
  const isFavorite = useSelector((state: RootState) =>
    state.favorites.ids.includes(product.id),
  );

  const colorVariants = useMemo(() => getColorVariantDisplayList(product), [product]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  useEffect(() => {
    setSelectedVariantIndex(0);
  }, [product.id]);

  const selectedVariant = colorVariants[selectedVariantIndex];
  const displayImageUrl = resolveProductImageUrl(selectedVariant?.imageUrl ?? product.imageUrl);
  const selectedColorLabel = selectedVariant?.color ?? product.frameColor;

  const headline = brandLabel || categoryLabel || 'Product';

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
      <div>
        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200/80">
          {displayImageUrl ? (
            <Image
              src={displayImageUrl}
              alt={headline}
              width={600}
              height={600}
              className="h-full w-full object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-neutral-400">No image available</span>
            </div>
          )}
        </div>

        {colorVariants.length > 1 && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Color</p>
            <div className="flex flex-wrap gap-2">
              {colorVariants.map((variant, index) => {
                const swatchColor = getFrameColorCss(variant.color);
                const isSelected = index === selectedVariantIndex;
                return (
                  <button
                    key={`${variant.color}-${index}`}
                    type="button"
                    className={`h-11 w-11 rounded-full border-2 shadow-inner transition focus:outline-none focus:ring-2 focus:ring-neutral-400 ${
                      isSelected ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2' : 'border-neutral-200'
                    }`}
                    style={{ backgroundColor: swatchColor }}
                    title={variant.color}
                    aria-label={`Color ${variant.color}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedVariantIndex(index)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-6">
          <div className="min-w-0 space-y-2">
            {brandLabel ? (
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{brandLabel}</p>
            ) : null}
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
              {headline}
            </h1>
            {categoryLabel ? (
              <p className="text-sm text-neutral-600 capitalize">{categoryLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => dispatch(toggleFavorite(product.id))}
            className="flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon
              className={`h-5 w-5 ${isFavorite ? 'text-red-500' : 'text-neutral-600'}`}
              filled={isFavorite}
            />
            {isFavorite ? 'Saved' : 'Save'}
          </button>
        </div>

        {product.description ? (
          <div className="mb-8">
            <h2 className="mb-2 text-sm font-semibold text-neutral-900">Description</h2>
            <p className="leading-relaxed text-neutral-700">{product.description}</p>
          </div>
        ) : null}

        <div className="mb-8">
          <p className="font-serif text-4xl font-semibold tabular-nums text-neutral-900">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>

        <div className="mb-10">
          <AddToCartButton product={product} />
        </div>

        <div className="mt-auto rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">Specifications</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {brandLabel ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Brand</dt>
                <dd className="mt-1 text-sm text-neutral-900">{brandLabel}</dd>
              </div>
            ) : null}
            {categoryLabel ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Category</dt>
                <dd className="mt-1 text-sm capitalize text-neutral-900">{categoryLabel}</dd>
              </div>
            ) : null}
            {product.frameStyle ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Frame style</dt>
                <dd className="mt-1 text-sm text-neutral-900">{product.frameStyle}</dd>
              </div>
            ) : null}
            {(selectedColorLabel || product.frameColor) ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Frame color</dt>
                <dd className="mt-1 text-sm text-neutral-900">{selectedColorLabel ?? product.frameColor}</dd>
              </div>
            ) : null}
            {product.shape ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Shape</dt>
                <dd className="mt-1 text-sm text-neutral-900">{product.shape}</dd>
              </div>
            ) : null}
            {product.material ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Material</dt>
                <dd className="mt-1 text-sm text-neutral-900">{product.material}</dd>
              </div>
            ) : null}
            {product.frameWidth ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Frame width</dt>
                <dd className="mt-1 text-sm text-neutral-900">{getFrameWidthLabel(product.frameWidth)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </div>
  );
}
