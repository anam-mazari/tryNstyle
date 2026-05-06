'use client';

import { useEffect, useState } from 'react';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store/store';
import { hydrateFromStorage } from '@/store/slices/authSlice';
import {
  hydrateCustomerFromStorage,
  readCustomerAuthFromStorage,
} from '@/store/slices/customerAuthSlice';
import type { Admin } from '@/types/entities';

interface AppProvidersProps {
  readonly children: React.ReactNode;
}

type StoredAuth = { user: Omit<Admin, 'password'> };

function isStoredAuth(value: unknown): value is StoredAuth {
  return (
    typeof value === 'object' &&
    value !== null &&
    'user' in value &&
    typeof (value as { user?: unknown }).user === 'object'
  );
}

function readAuthFromStorage(): StoredAuth | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem('auth');
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isStoredAuth(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function AppProviders({ children }: AppProvidersProps) {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const stored = readAuthFromStorage();
    store.dispatch(
      hydrateFromStorage({
        user: stored?.user ?? null,
      }),
    );
    const storedCustomer = readCustomerAuthFromStorage();
    store.dispatch(
      hydrateCustomerFromStorage({
        user: storedCustomer?.user ?? null,
      }),
    );
  }, []);

  return (
    <ReduxProvider>
      {children}
      {mounted ? <Toaster position="top-right" /> : null}
    </ReduxProvider>
  );
}

