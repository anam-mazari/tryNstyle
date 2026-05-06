'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-stone-200/90 bg-[#fcfaf6] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* User info */}
          <div className="hidden lg:block lg:text-sm">
            <span className="font-semibold text-[#2c241c]">
              {user?.name || user?.email || 'Admin'}
            </span>
          </div>

          {/* View Store Link */}
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200/40 hover:text-[#2c241c]"
          >
            View Store
          </Link>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="rounded-md border border-[#5c3d3d] bg-[#5c3d3d] px-3 py-2 text-sm font-medium text-[#faf3f0] transition-colors hover:border-[#4a3232] hover:bg-[#4a3232]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
