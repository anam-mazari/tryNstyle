import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types/entities';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

// Load initial state from localStorage
const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [], total: 0 };
  }

  try {
    const stored = localStorage.getItem('cart');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        items: parsed.items || [],
        total: parsed.total || 0,
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }

  return { items: [], total: 0 };
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);
};

const initialState: CartState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    ...initialState,
    total: calculateTotal(initialState.items),
  },
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }

      state.total = calculateTotal(state.items);

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify({ items: state.items, total: state.total }));
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
      state.total = calculateTotal(state.items);

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify({ items: state.items, total: state.total }));
      }
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product.id === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item.product.id !== productId);
        } else {
          item.quantity = quantity;
        }
      }

      state.total = calculateTotal(state.items);

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify({ items: state.items, total: state.total }));
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;

      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;




