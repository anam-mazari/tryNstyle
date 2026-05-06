import { baseApi } from './baseApi';
import type { Order } from '@/types/entities';
import type { CreateOrderDto } from '@/types/api';
import type { SalesDashboardResponse } from '@/types/sales-dashboard';
import { SalesDashboardPeriod } from '@/types/sales-dashboard';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getMyOrders: builder.query<Order[], void>({
      query: () => '/orders/my',
      providesTags: ['Order'],
    }),
    getGuestOrders: builder.query<Order[], { email: string }>({
      query: ({ email }) =>
        `/orders/guest?email=${encodeURIComponent(email.trim())}`,
      providesTags: ['Order'],
    }),
    getSalesDashboard: builder.query<SalesDashboardResponse, SalesDashboardPeriod>({
      query: (period) => `/reports/sales-dashboard?period=${period}`,
      providesTags: ['Order'],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<Order, CreateOrderDto>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetMyOrdersQuery,
  useGetGuestOrdersQuery,
  useGetSalesDashboardQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = ordersApi;

