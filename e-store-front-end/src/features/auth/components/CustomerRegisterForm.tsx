'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

export function CustomerRegisterForm() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useCustomerAuth();
  const router = useRouter();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const result = await register({
      username: username.trim(),
      email: email.trim(),
      password,
    });
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
          htmlFor="register-username"
          className="block text-sm font-medium text-gray-700"
        >
          Display name
        </label>
        <div className="mt-1">
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="name"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
            placeholder="Your name"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <div className="mt-1">
          <input
            id="register-email"
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
          htmlFor="register-password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
            placeholder="At least 8 characters"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-confirm"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm password
        </label>
        <div className="mt-1">
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </div>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:text-gray-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
