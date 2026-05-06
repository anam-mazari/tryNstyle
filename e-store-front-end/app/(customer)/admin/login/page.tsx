'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function AdminLoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900" />
          <p className="text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Administrator login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard.
          </p>
        </div>
        <LoginForm />
        <div className="space-y-2 text-center text-sm">
          <Link
            href="/"
            className="block font-medium text-gray-900 hover:text-gray-700"
          >
            ← Back to store
          </Link>
          <Link
            href="/login"
            className="block text-gray-500 hover:text-gray-700"
          >
            Customer sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
