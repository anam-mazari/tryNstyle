'use client';

import { useSyncExternalStore } from 'react';

const LARGE_QUERY = '(min-width: 1024px)';

function subscribe(onStoreChange: () => void): () => void {
  const mediaQueryList = window.matchMedia(LARGE_QUERY);
  mediaQueryList.addEventListener('change', onStoreChange);
  return () => mediaQueryList.removeEventListener('change', onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(LARGE_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsLargeScreen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
