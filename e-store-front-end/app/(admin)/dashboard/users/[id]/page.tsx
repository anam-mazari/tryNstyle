'use client';

import { useParams } from 'next/navigation';
import { useGetUserQuery } from '@/store/api/usersApi';
import Link from 'next/link';

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: user, isLoading, error } = useGetUserQuery(userId);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard/users"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Users
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">User Details</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Username</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.username}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.phone || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.address || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}

