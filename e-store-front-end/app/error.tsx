'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">500</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">Something went wrong</h2>
        <p className="mt-2 text-gray-600">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}




