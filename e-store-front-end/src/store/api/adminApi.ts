import { baseApi } from './baseApi';
import type { Admin } from '@/types/entities';
import type { CreateAdminDto } from '@/types/api';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAdmin: builder.mutation<Admin, CreateAdminDto>({
      query: (body) => ({
        url: '/admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useCreateAdminMutation,
} = adminApi;

