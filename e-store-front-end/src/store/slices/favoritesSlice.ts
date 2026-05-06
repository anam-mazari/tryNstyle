import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'favorites';

interface FavoritesState {
  ids: string[];
}

const loadFavoritesFromStorage = (): FavoritesState => {
  if (typeof window === 'undefined') {
    return { ids: [] };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as unknown;
      if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')) {
        return { ids: parsed };
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return { ids: [] };
};

const persist = (ids: string[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

const initialState: FavoritesState = loadFavoritesFromStorage();

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.ids.indexOf(id);
      if (index >= 0) {
        state.ids.splice(index, 1);
      } else {
        state.ids.push(id);
      }
      persist(state.ids);
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.ids = state.ids.filter((existingId) => existingId !== action.payload);
      persist(state.ids);
    },
    clearFavorites: (state) => {
      state.ids = [];
      persist(state.ids);
    },
  },
});

export const { toggleFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
