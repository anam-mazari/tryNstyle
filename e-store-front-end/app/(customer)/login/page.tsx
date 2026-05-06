'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { CustomerLoginForm } from '@/features/auth/components/CustomerLoginForm';

export default function CustomerLoginPage() {
  const customerAuth = useSelector((state: RootState) => state.customerAuth);
  const router = useRouter();

  useEffect(() => {
    if (!customerAuth.isLoading && customerAuth.isAuthenticated) {
      router.push('/profile');
    }
  }, [
    customerAuth.isAuthenticated,
    customerAuth.isLoading,
    router,
  ]);

  if (customerAuth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900" />
          <p className="text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (customerAuth.isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your customer account to view your profile and orders.
          </p>
        </div>
        <CustomerLoginForm />
        <div className="space-y-2 text-center text-sm">
          <Link
            href="/"
            className="block font-medium text-gray-900 hover:text-gray-700"
          >
            ← Back to store
          </Link>
          <Link
            href="/admin/login"
            className="block text-gray-500 hover:text-gray-700"
          >
            Store administrator login
          </Link>
        </div>
      </div>
    </div>
  );
}
