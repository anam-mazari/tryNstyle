'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import Link from 'next/link';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

export default function ProfilePage() {
  const customerAuth = useSelector((state: RootState) => state.customerAuth);
  const { logout } = useCustomerAuth();

  if (!customerAuth.isAuthenticated || !customerAuth.user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Please sign in
          </h2>
          <p className="mb-6 max-w-md text-center text-sm text-gray-600">
            Create a customer account or sign in to view your profile and
            orders.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user } = customerAuth;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My profile</h1>
        <button
          type="button"
          onClick={() => logout()}
          className="self-start rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:self-auto"
        >
          Sign out
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Account information
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.username || 'Not set'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              {user.phone ? (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Quick links
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/profile/orders"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Order history
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
