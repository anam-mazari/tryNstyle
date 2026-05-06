'use client';

import Link from 'next/link';
import { useGetProductFiltersQuery } from '@/store/api/productsApi';
import { GlassesIcon } from '@/components/icons/CommerceIcons';

/**
 * Promo strip above the navbar (warm deep brown with cream text, aligned with hero/footer).
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
    <div className="border-b border-stone-800/50 bg-[#2a221c] text-[#f4efe6]">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="min-w-0 justify-self-start text-left text-sm font-medium leading-snug text-[#ece7df] transition hover:text-[#faf8f4] sm:text-[15px]"
        >
          <span className="inline-flex items-start gap-2">
            <GlassesIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#d4cdc3]" />
            <span>
              Premium eyewear
              {showStartingAt && displayAmount !== null ? `, starting at $${displayAmount}` : ''}
            </span>
          </span>
        </Link>

        <span className="justify-self-center whitespace-nowrap text-xs font-semibold tracking-[0.18em] text-[#faf8f4] sm:text-sm">
          TrynStyle
        </span>

        <div className="min-w-0" aria-hidden />
      </div>
    </div>
  );
}
