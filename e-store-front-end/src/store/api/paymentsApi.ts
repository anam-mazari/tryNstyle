import { baseApi } from './baseApi';
import type { Payment } from '@/types/entities';
import type {
  CreateOrderDto,
  CreatePaymentDto,
  StripeCheckoutSessionResponse,
  StripeSessionOrderResponse,
  UpdatePaymentDto,
} from '@/types/api';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createStripeCheckoutSession: builder.mutation<
      StripeCheckoutSessionResponse,
      CreateOrderDto
    >({
      query: (body) => ({
        url: '/payments/stripe/checkout-session',
        method: 'POST',
        body,
      }),
    }),
    getOrderByStripeSession: builder.query<StripeSessionOrderResponse, string>({
      query: (sessionId) => `/payments/stripe/session/${sessionId}/order`,
    }),
    syncStripeSession: builder.mutation<StripeSessionOrderResponse, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: '/payments/stripe/sync-session',
        method: 'POST',
        body: { sessionId },
      }),
    }),
    createPayment: builder.mutation<Payment, { orderId: string; data: CreatePaymentDto }>({
      query: ({ orderId, data }) => ({
        url: `/payments/create/${orderId}`,
        method: 'POST',
        body: {
          method: data.method,
          amount: data.amount,
        },
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),
    updatePayment: builder.mutation<Payment, { id: string; data: UpdatePaymentDto }>({
      query: ({ id, data }) => ({
        url: `/payments/update/${id}`,
        method: 'POST',
        body: {
          status: data.status,
          transaction_id: data.transaction_id,
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Payment', id }, 'Payment', 'Order'],
    }),
  }),
});

export const {
  useCreateStripeCheckoutSessionMutation,
  useGetOrderByStripeSessionQuery,
  useSyncStripeSessionMutation,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
} = paymentsApi;

