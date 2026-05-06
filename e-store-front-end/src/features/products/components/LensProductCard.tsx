'use client';

/**
 * LensProductCard.tsx
 *
 * Product card for Contact Lens products.
 * Mirrors ProductCard.tsx structure exactly — same layout, same favorites logic,
 * but shows lens color swatches instead of frame color swatches,
 * and uses LensTryOn instead of TryOn.
 *
 * Used when: product.category === "Contact Lenses"
 * The parent grid/list should render this instead of ProductCard for lens products.
 */

import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import type { Product } from '@/types/entities';
import { resolveProductImageUrl } from '@/utils/product-color-variants';
import { getProductBrandName } from '@/utils/product-labels';
import LensTryOn from '@/components/LensTryOn';
import { HeartIcon } from '@/components/icons/CommerceIcons';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import type { RootState } from '@/store/store';

interface LensProductCardProps {
  product: Product;
}

/**
 * Builds the list of color swatches for a lens product.
 * Uses product.frameColor as the primary color (stored as hex in DB for lenses),
 * plus any colorVariantImages entries.
 *
 * Each swatch: { hex, name, imageUrl }
 */
function buildLensSwatches(product: Product) {
  const swatches: Array<{ hex: string; name: string; imageUrl: string }> = [];

  // Primary color
  if (product.frameColor) {
    swatches.push({
      hex:      product.frameColor.startsWith('#') ? product.frameColor : '#888888',
      name:     product.frameStyle || product.frameColor,
      // Lens products often have `lensImageUrl` (overlay PNG) but no `imageUrl`.
      // Use `lensImageUrl` as a reasonable card thumbnail fallback.
      imageUrl: product.imageUrl || product.lensImageUrl || '',
    });
  }

  // Additional color variants
  if (Array.isArray(product.colorVariantImages)) {
    for (const v of product.colorVariantImages) {
      // color field on variants holds hex for lens products
      swatches.push({
        hex:      v.color.startsWith('#') ? v.color : '#888888',
        name:     v.color,
        imageUrl: v.imageUrl,
      });
    }
  }

  return swatches;
}

export function LensProductCard({ product }: LensProductCardProps) {
  const dispatch   = useDispatch();
  const brandLabel = getProductBrandName(product.brand);
  const isFavorite = useSelector((state: RootState) =>
    state.favorites.ids.includes(product.id),
  );

  const swatches = useMemo(() => buildLensSwatches(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  // Active lens color for the try-on modal — can change inside modal
  const [activeLensHex,  setActiveLensHex]  = useState(swatches[0]?.hex  ?? '#5DADE2');
  const [activeLensName, setActiveLensName] = useState(swatches[0]?.name ?? 'Default');

  useEffect(() => {
    setActiveIndex(0);
    setActiveLensHex(swatches[0]?.hex  ?? '#5DADE2');
    setActiveLensName(swatches[0]?.name ?? 'Default');
  }, [product.id, swatches]);

  const activeImageUrl = resolveProductImageUrl(
    swatches[activeIndex]?.imageUrl ?? product.imageUrl ?? product.lensImageUrl,
  );
  const price          = Number(product.price);
  const displayPrice   = Number.isFinite(price) ? price.toFixed(0) : '—';

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(toggleFavorite(product.id));
  };

  const handleSwatchClick = (index: number, hex: string, name: string) => {
    setActiveIndex(index);
    setActiveLensHex(hex);
    setActiveLensName(name);
  };

  return (
    <div className="group flex flex-col">
      {/* Product image */}
      <div className="relative">
        <Link
          href={`/products/${product.id}`}
          className="relative block aspect-square w-full overflow-hidden rounded-md bg-neutral-100"
          aria-label={`View product, ${displayPrice} dollars`}
        >
          {activeImageUrl ? (
            <Image
              src={activeImageUrl}
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

        {/* Favorite button */}
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

        {/* "Lenses" badge */}
        <span className="absolute left-2 top-2 z-10 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
          Lenses
        </span>
      </div>

      {/* Brand + price */}
      <div className="mt-3 flex items-start justify-between gap-3 px-0.5">
        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-neutral-900">
          {brandLabel ?? '—'}
        </p>
        <p className="shrink-0 text-base font-medium tabular-nums tracking-tight text-neutral-900">
          ${displayPrice}
        </p>
      </div>

      {/* Color swatches */}
      {swatches.length > 0 && (
        <div className="mt-3 flex justify-center px-0.5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {swatches.map((swatch, index) => (
              <button
                key={`${swatch.hex}-${index}`}
                type="button"
                className={`h-8 w-8 shrink-0 rounded-full border-2 shadow-inner transition-transform focus:outline-none focus:ring-2 focus:ring-neutral-400 ${
                  index === activeIndex
                    ? 'border-neutral-900 ring-1 ring-neutral-900 scale-110'
                    : 'border-neutral-200'
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={swatch.name}
                aria-label={`Lens color: ${swatch.name}`}
                aria-pressed={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(0)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(0)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSwatchClick(index, swatch.hex, swatch.name);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lens Try-On button */}
      <div
        className="mt-3"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <LensTryOn
          lensColor={activeLensHex}
          lensColorName={activeLensName}
          productName={brandLabel ?? product.frameStyle ?? 'Lens'}
          colorSwatches={swatches.map((s) => ({ hex: s.hex, name: s.name }))}
          onColorChange={(hex, name) => {
            setActiveLensHex(hex);
            setActiveLensName(name);
            const idx = swatches.findIndex((s) => s.hex === hex);
            if (idx !== -1) setActiveIndex(idx);
          }}
        />
      </div>
    </div>
  );
}
