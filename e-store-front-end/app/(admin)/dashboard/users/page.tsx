'use client';

import { useGetUsersQuery } from '@/store/api/usersApi';
import { UserTable } from '@/features/admin/components/UserTable';

export default function AdminUsersPage() {
  const { data: users, isLoading, error } = useGetUsersQuery();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="mt-2 text-gray-600">Manage user accounts</p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">Error loading users</p>
          </div>
        </div>
      ) : users && users.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <UserTable users={users} />
        </div>
      ) : (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-600">No users found</p>
          </div>
        </div>
      )}
    </>
  );
}

