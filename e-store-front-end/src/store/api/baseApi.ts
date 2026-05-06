import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Get API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Define tag types for cache invalidation
export const tagTypes = ['User', 'Product', 'Order', 'Payment', 'Admin'] as const;

// Create base API with RTK Query
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('customerAuth');
          if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (
              typeof parsed === 'object' &&
              parsed !== null &&
              'user' in parsed &&
              typeof (parsed as { user?: { id?: unknown } }).user?.id ===
                'string'
            ) {
              headers.set(
                'X-Customer-User-Id',
                (parsed as { user: { id: string } }).user.id,
              );
            }
          }
        } catch {
          /* ignore malformed customerAuth */
        }
      }
      return headers;
    },
  }),
  tagTypes,
  endpoints: () => ({}),
  // Enhanced error handling
  refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  refetchOnFocus: true,
  refetchOnReconnect: true,
});

