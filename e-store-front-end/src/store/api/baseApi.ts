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
      // Add any default headers here (e.g., authorization tokens)
      headers.set('Content-Type', 'application/json');
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

