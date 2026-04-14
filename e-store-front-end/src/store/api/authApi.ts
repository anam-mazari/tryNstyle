import { baseApi } from './baseApi';
import type { Admin } from '@/types/entities';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  admin: Omit<Admin, 'password'>;
  token?: string;
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
  }),
});

export const { useLoginAdminMutation } = authApi;




