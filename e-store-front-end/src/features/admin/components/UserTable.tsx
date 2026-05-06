'use client';

import Link from 'next/link';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import type { User } from '@/types/entities';

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Username</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Phone</TableHeader>
          <TableHeader>Address</TableHeader>
          <TableHeader className="text-right">Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium text-gray-900">
              {user.username}
            </TableCell>
            <TableCell className="text-gray-500">
              {user.email}
            </TableCell>
            <TableCell className="text-gray-500">
              {user.phone || '-'}
            </TableCell>
            <TableCell className="text-gray-500">
              {user.address || '-'}
            </TableCell>
            <TableCell className="text-right">
              <Link
                href={`/dashboard/users/${user.id}`}
                className="text-gray-900 hover:text-gray-700"
              >
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}




