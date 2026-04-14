import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Admin } from '@/types/entities';

interface AuthState {
  user: Omit<Admin, 'password'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Load initial state from localStorage
const loadAuthFromStorage = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  try {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        isAuthenticated: !!parsed.user,
        isLoading: false,
      };
    }
  } catch (error) {
    console.error('Error loading auth from localStorage:', error);
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

const initialState: AuthState = loadAuthFromStorage();

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
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;




