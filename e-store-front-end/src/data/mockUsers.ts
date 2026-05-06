import type { User } from '@/types/entities';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    phone: '098-765-4321',
    address: '456 Oak Ave',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];




