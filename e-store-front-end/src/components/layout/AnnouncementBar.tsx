'use client';

import Link from 'next/link';
import { useGetProductFiltersQuery } from '@/store/api/productsApi';
import { GlassesIcon } from '@/components/icons/CommerceIcons';

/**
 * Promo strip above the navbar (matches footer tone). “Starting at” uses catalog min price.
 */
export function AnnouncementBar() {
  const { data } = useGetProductFiltersQuery();

  const rawMin = data?.priceRange?.min;
  const minPrice =
    rawMin !== undefined && rawMin !== null && Number.isFinite(Number(rawMin))
      ? Number(rawMin)
      : null;

  const showStartingAt = minPrice !== null && minPrice > 0;
  const displayAmount = showStartingAt ? Math.floor(minPrice) : null;

  return (
    <div className="bg-gray-900 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="min-w-0 justify-self-start text-left text-sm font-medium leading-snug text-white/95 transition hover:text-white sm:text-[15px]"
        >
          <span className="inline-flex items-start gap-2">
            <GlassesIcon className="mt-0.5 h-4 w-4 shrink-0 opacity-90" />
            <span>
              Premium eyewear
              {showStartingAt && displayAmount !== null ? `, starting at $${displayAmount}` : ''}
            </span>
          </span>
        </Link>

        <span className="justify-self-center whitespace-nowrap text-xs font-semibold tracking-[0.18em] text-white sm:text-sm">
          TrynStyle
        </span>

        <div className="min-w-0" aria-hidden />
      </div>
    </div>
  );
}
