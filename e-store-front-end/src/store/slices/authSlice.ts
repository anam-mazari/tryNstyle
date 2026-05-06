import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Admin } from '@/types/entities';

interface AuthState {
  user: Omit<Admin, 'password'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Important for SSR/hydration:
 * Do NOT read `localStorage` at module init time, or server/client will render different HTML.
 * The client hydrates auth state after mount (see `AppProviders`).
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Omit<Admin, 'password'>>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify({ user: action.payload }));
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    hydrateFromStorage: (
      state,
      action: PayloadAction<{ user: Omit<Admin, 'password'> | null }>,
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = Boolean(action.payload.user);
      state.isLoading = false;
    },
  },
});

export const { setUser, clearUser, setLoading, hydrateFromStorage } =
  authSlice.actions;
export default authSlice.reducer;




