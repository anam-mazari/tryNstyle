'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import Link from 'next/link';

export default function ProfilePage() {
  const auth = useSelector((state: RootState) => state.auth);

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Please log in</h2>
          <Link
            href="/login"
            className="rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Account Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{auth.user.name || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{auth.user.email}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/profile/orders"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  View Order History
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  View Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}




