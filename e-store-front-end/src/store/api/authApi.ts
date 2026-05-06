import { baseApi } from './baseApi';
import type { Admin, User } from '@/types/entities';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  admin: Omit<Admin, 'password'>;
  token?: string;
}

export interface CustomerRegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string | null;
  address?: string | null;
}

export interface CustomerAuthResponse {
  user: User;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loginAdmin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    loginCustomer: builder.mutation<CustomerAuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Order'],
    }),
    registerCustomer: builder.mutation<
      CustomerAuthResponse,
      CustomerRegisterRequest
    >({
      query: (body) => ({
        url: '/users/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useLoginAdminMutation,
  useLoginCustomerMutation,
  useRegisterCustomerMutation,
} = authApi;




