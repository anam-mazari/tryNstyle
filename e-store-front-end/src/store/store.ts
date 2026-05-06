import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import './register-api-modules';
import authReducer from './slices/authSlice';
import { customerAuthSlice } from './slices/customerAuthSlice';
import cartReducer from './slices/cartSlice';
import favoritesReducer from './slices/favoritesSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    customerAuth: customerAuthSlice.reducer,
    cart: cartReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

