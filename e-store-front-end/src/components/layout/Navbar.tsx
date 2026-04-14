'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import type { RootState } from '@/store/store';
import { CartIcon, HeartIcon } from '@/components/icons/CommerceIcons';

export function Navbar() {
  const pathname = usePathname();
  const cart = useSelector((state: RootState) => state.cart);
  const favorites = useSelector((state: RootState) => state.favorites);
  const auth = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const favoriteCount = favorites?.ids?.length ?? 0;

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (active: boolean) =>
    `rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors sm:px-3 ${
      active ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 md:h-16 md:gap-4">
          <div className="flex min-w-0 flex-shrink-0 items-center">
            <Link
              href="/"
              className="font-serif text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl"
              aria-label="TrynStyle Home"
            >
              TrynStyle
            </Link>
          </div>

          <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex md:max-w-md lg:px-4">
            <form
              action="/products"
              method="get"
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const search = formData.get('search') as string;
                if (search) {
                  window.location.href = `/products?search=${encodeURIComponent(search)}`;
                } else {
                  window.location.href = '/products';
                }
              }}
            >
              <input
                type="search"
                name="search"
                placeholder="Search frames..."
                className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                key={mounted ? 'mounted' : 'unmounted'}
                defaultValue={
                  mounted && typeof window !== 'undefined'
                    ? new URLSearchParams(window.location.search).get('search') || ''
                    : ''
                }
              />
            </form>
          </div>

          <div className="flex min-w-0 flex-shrink-0 items-center justify-end gap-0.5 sm:gap-1 md:gap-2">
            <Link href="/" className={navLinkClass(isActive('/'))} aria-label="Home">
              Home
            </Link>

            <Link
              href="/favorites"
              className="relative rounded-md p-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label={
                mounted
                  ? `Favorites${favoriteCount > 0 ? `, ${favoriteCount} items` : ''}`
                  : 'Favorites'
              }
            >
              <HeartIcon className="h-6 w-6" aria-hidden />
              {mounted && favoriteCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white">
                  {favoriteCount > 99 ? '99+' : favoriteCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative rounded-md p-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label={
                mounted
                  ? `Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ''}`
                  : 'Shopping cart'
              }
            >
              <CartIcon className="h-6 w-6" aria-hidden />
              {mounted && cartItemCount > 0 && (
                <span
                  className="absolute right-0.5 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white"
                  aria-label={`${cartItemCount} items in cart`}
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            <div className="ml-0.5 flex items-center border-l border-neutral-200 pl-2 sm:ml-1 sm:pl-3">
              {mounted && auth.isAuthenticated && auth.user ? (
                <Link
                  href="/profile"
                  className="max-w-[100px] truncate text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 sm:max-w-none"
                >
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md bg-neutral-900 px-2.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 sm:px-3"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
