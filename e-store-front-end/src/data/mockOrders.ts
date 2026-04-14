import type { Order } from '@/types/entities';
import type { User } from '@/types/entities';

const mockUser: User = {
  id: '1',
  username: 'john_doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  address: '123 Main St',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockOrders: Order[] = [
  {
    order_id: 'order-1',
    user: mockUser,
    total_amount: 249.98,
    payment_method: 'credit_card',
    shipping_address: '123 Main St',
    shipping_address_line2: null,
    shipping_city: 'Karachi',
    shipping_province: 'Sindh',
    shipping_postal_code: '75500',
    shipping_country: 'Pakistan',
    order_status: 'pending',
    items: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
];




