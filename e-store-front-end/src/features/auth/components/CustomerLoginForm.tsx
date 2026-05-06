'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

export function CustomerLoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useCustomerAuth();
  const router = useRouter();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      router.push('/profile');
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="customer-email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <div className="mt-1">
          <input
            id="customer-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="customer-password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            id="customer-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
            placeholder="Your password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>

      <p className="text-center text-sm text-gray-600">
        No account?{' '}
        <Link
          href="/register"
          className="font-medium text-gray-900 hover:text-gray-700"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
