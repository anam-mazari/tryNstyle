import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/entities';

interface CustomerAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: CustomerAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

interface StoredCustomerAuth {
  user: User;
}

function isStoredCustomerAuth(value: unknown): value is StoredCustomerAuth {
  if (typeof value !== 'object' || value === null || !('user' in value)) {
    return false;
  }
  const record = value as { user?: unknown };
  if (typeof record.user !== 'object' || record.user === null) {
    return false;
  }
  const userRecord = record.user as { id?: unknown; email?: unknown; username?: unknown };
  return (
    typeof userRecord.id === 'string' &&
    typeof userRecord.email === 'string' &&
    typeof userRecord.username === 'string'
  );
}

export const customerAuthSlice = createSlice({
  name: 'customerAuth',
  initialState,
  reducers: {
    setCustomerUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'customerAuth',
          JSON.stringify({ user: action.payload }),
        );
      }
    },
    clearCustomerUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('customerAuth');
      }
    },
    hydrateCustomerFromStorage: (
      state,
      action: PayloadAction<{ user: User | null }>,
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = Boolean(action.payload.user);
      state.isLoading = false;
    },
  },
});

export const { setCustomerUser, clearCustomerUser, hydrateCustomerFromStorage } =
  customerAuthSlice.actions;

export function readCustomerAuthFromStorage(): StoredCustomerAuth | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem('customerAuth');
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isStoredCustomerAuth(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
