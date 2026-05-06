'use client';

import Link from 'next/link';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { OrderLineThumbnails } from '@/features/orders/components/OrderProductThumbnail';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import type { Order } from '@/types/entities';

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Order ID</TableHeader>
          <TableHeader>Items</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader>Total</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Date</TableHeader>
          <TableHeader className="text-right">Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.order_id}>
            <TableCell>
              <Link
                href={`/dashboard/orders/${order.order_id}`}
                className="font-medium text-gray-900 hover:text-gray-700"
              >
                {order.order_id.substring(0, 8)}...
              </Link>
            </TableCell>
            <TableCell className="w-[140px]">
              <OrderLineThumbnails items={order.items ?? []} max={3} size={36} />
            </TableCell>
            <TableCell className="text-gray-500">
              {order.user?.username || order.user?.email || 'N/A'}
            </TableCell>
            <TableCell className="text-gray-900">
              ${Number(order.total_amount).toFixed(2)}
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.order_status} />
            </TableCell>
            <TableCell className="text-gray-500">
              {new Date(order.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Link
                href={`/dashboard/orders/${order.order_id}`}
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
