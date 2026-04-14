'use client';

import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import type { Product } from '@/types/entities';
import { getFrameColorCss } from '@/utils/frame-color-display';
import { getColorVariantDisplayList, resolveProductImageUrl } from '@/utils/product-color-variants';
import { getProductBrandName } from '@/utils/product-labels';
import TryOn, { type GlassesColorVariant } from '@/components/TryOn';
import { HeartIcon } from '@/components/icons/CommerceIcons';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import type { RootState } from '@/store/store';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const brandLabel = getProductBrandName(product.brand);
  const isFavorite = useSelector((state: RootState) =>
    state.favorites.ids.includes(product.id),
  );

  const colorVariants = useMemo(() => getColorVariantDisplayList(product), [product]);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  useEffect(() => {
    setActiveVariantIndex(0);
  }, [product.id]);

  const activeVariant = colorVariants[activeVariantIndex];
  const imageSrc = resolveProductImageUrl(activeVariant?.imageUrl ?? product.imageUrl);
  const price = Number(product.price);
  const displayPrice = Number.isFinite(price) ? price.toFixed(0) : '—';

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(toggleFavorite(product.id));
  };

  // Build the GlassesColorVariant list for TryOn's color switcher
  // Each entry maps a color name to its overlay PNG image URL
  const tryOnColorVariants: GlassesColorVariant[] = useMemo(() => {
    return colorVariants.map((v) => ({
      color:    v.color,
      imageUrl: v.imageUrl ?? null,
    }));
  }, [colorVariants]);

  return (
    <div className="group flex flex-col">
      <div className="relative">
        <Link
          href={`/products/${product.id}`}
          className="relative block aspect-square w-full overflow-hidden rounded-md bg-neutral-100"
          aria-label={`View product, ${displayPrice} dollars`}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm text-neutral-400">
              No image
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/95 p-2 shadow-md ring-1 ring-black/5 transition hover:bg-white"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <HeartIcon
            className={`h-5 w-5 ${isFavorite ? 'text-red-500' : 'text-neutral-600'}`}
            filled={isFavorite}
          />
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 px-0.5">
        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-neutral-900">
          {brandLabel ?? '—'}
        </p>
        <p className="shrink-0 text-base font-medium tabular-nums tracking-tight text-neutral-900">
          ${displayPrice}
        </p>
      </div>

      <div className="mt-3 flex justify-center px-0.5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {colorVariants.map((variant, index) => {
            const swatchColor = getFrameColorCss(variant.color);
            const isActive = index === activeVariantIndex;
            return (
              <button
                key={`${variant.color}-${index}`}
                type="button"
                className={`h-8 w-8 shrink-0 rounded-full border-2 shadow-inner transition-transform focus:outline-none focus:ring-2 focus:ring-neutral-400 ${
                  isActive ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200'
                }`}
                style={{ backgroundColor: swatchColor }}
                title={variant.color}
                aria-label={`Frame color: ${variant.color}`}
                aria-pressed={isActive}
                onMouseEnter={() => setActiveVariantIndex(index)}
                onMouseLeave={() => setActiveVariantIndex(0)}
                onFocus={() => setActiveVariantIndex(index)}
                onBlur={() => setActiveVariantIndex(0)}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveVariantIndex(index);
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        className="mt-3"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <TryOn
          product={product}
          glassesImageSource={activeVariant?.imageUrl ?? product.imageUrl}
          glbPath={product.glbUrl ?? null}
          colorVariants={tryOnColorVariants}
          activeVariantIndex={activeVariantIndex}
          onColorChange={(index) => setActiveVariantIndex(index)}
        />
      </div>
    </div>
  );
}
