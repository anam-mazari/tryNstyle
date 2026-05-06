'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setUser, clearUser, setLoading } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';
import { useLoginAdminMutation } from '@/store/api/authApi';
import { getRtkErrorMessage } from '@/utils/get-rtk-error-message';

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginAdminMutation();

  const login = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const result = await loginMutation({ email, password }).unwrap();
      dispatch(setUser(result.admin));
      return { success: true };
    } catch (error: unknown) {
      dispatch(setLoading(false));
      return {
        success: false,
        error: getRtkErrorMessage(error, 'Login failed'),
      };
    }
  };

  const logout = () => {
    dispatch(clearUser());
    router.push('/admin/login');
  };

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || isLoggingIn,
    login,
    logout,
  };
}




