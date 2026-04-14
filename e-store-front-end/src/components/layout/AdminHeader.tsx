'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* User info */}
          <div className="hidden lg:block lg:text-sm">
            <span className="font-semibold text-gray-900">
              {user?.name || user?.email || 'Admin'}
            </span>
          </div>

          {/* View Store Link */}
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            View Store
          </Link>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
