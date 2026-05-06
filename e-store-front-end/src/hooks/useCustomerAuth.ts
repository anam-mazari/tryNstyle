'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  useLoginCustomerMutation,
  useRegisterCustomerMutation,
} from '@/store/api/authApi';
import type { CustomerRegisterRequest } from '@/store/api/authApi';
import {
  clearCustomerUser,
  setCustomerUser,
} from '@/store/slices/customerAuthSlice';
import type { RootState } from '@/store/store';
import { getRtkErrorMessage } from '@/utils/get-rtk-error-message';

export function useCustomerAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const customerAuth = useSelector((state: RootState) => state.customerAuth);
  const [loginMutation, { isLoading: isLoginLoading }] =
    useLoginCustomerMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] =
    useRegisterCustomerMutation();

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: true } | { success: false; error: string }> => {
    try {
      const result = await loginMutation({ email, password }).unwrap();
      dispatch(setCustomerUser(result.user));
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getRtkErrorMessage(error, 'Login failed'),
      };
    }
  };

  const register = async (
    payload: CustomerRegisterRequest,
  ): Promise<{ success: true } | { success: false; error: string }> => {
    try {
      const result = await registerMutation(payload).unwrap();
      dispatch(setCustomerUser(result.user));
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getRtkErrorMessage(error, 'Registration failed'),
      };
    }
  };

  const logout = (): void => {
    dispatch(clearCustomerUser());
    router.push('/login');
  };

  return {
    user: customerAuth.user,
    isAuthenticated: customerAuth.isAuthenticated,
    isLoading:
      customerAuth.isLoading || isLoginLoading || isRegisterLoading,
    login,
    register,
    logout,
  };
}
