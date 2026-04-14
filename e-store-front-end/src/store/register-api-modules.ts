/**
 * Side-effect imports so RTK Query `injectEndpoints` runs before the store is used.
 */
import '@/store/api/usersApi';
import '@/store/api/productsApi';
import '@/store/api/ordersApi';
import '@/store/api/paymentsApi';
import '@/store/api/adminApi';
import '@/store/api/authApi';
