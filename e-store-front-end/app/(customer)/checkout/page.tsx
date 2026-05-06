'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { clearCart } from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import {
  useCreatePaymentMutation,
  useCreateStripeCheckoutSessionMutation,
} from '@/store/api/paymentsApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getProductBrandName } from '@/utils/product-labels';

const validatePakistanPhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 11) {
    return digitsOnly.startsWith('03');
  }
  if (digitsOnly.length === 12) {
    return digitsOnly.startsWith('923');
  }
  return false;
};

const formatPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 12 && digitsOnly.startsWith('923')) {
    return `0${digitsOnly.substring(2)}`;
  }
  return digitsOnly;
};

const isCashOnDelivery = (method: string): boolean => method === 'cash_on_delivery';

export default function CheckoutPage() {
  const cart = useSelector((state: RootState) => state.cart);
  const customerAuth = useSelector((state: RootState) => state.customerAuth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [createPayment, { isLoading: isCreatingCodPayment }] =
    useCreatePaymentMutation();
  const [createStripeCheckoutSession, { isLoading: isStartingStripe }] =
    useCreateStripeCheckoutSessionMutation();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Pakistan',
    payment_method: 'credit_card',
  });

  const [phoneError, setPhoneError] = useState<string>('');

  const lockedAccountEmail = useMemo((): string | null => {
    if (!customerAuth.isAuthenticated || !customerAuth.user?.email) {
      return null;
    }
    return customerAuth.user.email.trim().toLowerCase();
  }, [customerAuth.isAuthenticated, customerAuth.user?.email]);

  useEffect(() => {
    if (!lockedAccountEmail) {
      return;
    }
    setFormData((previous) => ({
      ...previous,
      email: lockedAccountEmail,
    }));
  }, [lockedAccountEmail]);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <Link
            href="/cart"
            className="rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
          >
            Go to Cart
          </Link>
        </div>
      </div>
    );
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, phone: value });
    if (!value) {
      setPhoneError('');
      return;
    }
    if (!validatePakistanPhone(value)) {
      setPhoneError('Please enter a valid Pakistan phone number (11 digits, e.g., 0300-1234567)');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = formatPhoneNumber(formData.phone);
    if (!validatePakistanPhone(formData.phone)) {
      setPhoneError('Please enter a valid Pakistan phone number (11 digits, e.g., 0300-1234567)');
      return;
    }

    if (lockedAccountEmail && formData.email.trim().toLowerCase() !== lockedAccountEmail) {
      toast.error('Checkout email must match your signed-in account email.');
      return;
    }

    const checkoutPayload = {
      username: formData.username,
      email: formData.email,
      phone: formattedPhone,
      address: formData.address,
      address_line2: formData.address_line2.trim() || undefined,
      city: formData.city,
      province: formData.province,
      postal_code: formData.postal_code,
      country: formData.country,
      payment_method: formData.payment_method,
      items: cart.items.map((item) => ({
        product_id: item.product.id,
        variant_color: item.variantColor,
        quantity: item.quantity,
      })),
    };

    try {
      if (typeof window !== 'undefined' && !customerAuth.isAuthenticated) {
        localStorage.setItem('guestCheckoutEmail', formData.email.trim().toLowerCase());
      }
      if (isCashOnDelivery(formData.payment_method)) {
        const order = await createOrder(checkoutPayload).unwrap();
        await createPayment({
          orderId: order.order_id,
          data: {
            method: formData.payment_method,
            amount: cart.total,
          },
        }).unwrap();
        dispatch(clearCart());
        toast.success('Order placed successfully! Payment will be collected on delivery.');
        router.push('/profile/orders');
        return;
      }

      const { url } = await createStripeCheckoutSession(checkoutPayload).unwrap();
      window.location.assign(url);
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data &&
        typeof (error.data as { message: unknown }).message === 'string'
          ? (error.data as { message: string }).message
          : 'Checkout failed. Please try again.';
      toast.error(message);
    }
  };

  const isBusy =
    isCreatingOrder || isCreatingCodPayment || isStartingStripe || !!phoneError;

  const submitLabel = isCashOnDelivery(formData.payment_method)
    ? isCreatingOrder || isCreatingCodPayment
      ? 'Placing order...'
      : 'Place order (cash on delivery)'
    : isStartingStripe
      ? 'Redirecting to Stripe...'
      : 'Pay securely with Stripe';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-2 text-sm text-gray-600">
          Card and PayPal options use Stripe Checkout (sandbox). Your order is created after
          payment succeeds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="username"
                required
                autoComplete="name"
                placeholder="Your name"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                autoComplete="email"
                placeholder="Your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                readOnly={Boolean(lockedAccountEmail)}
                aria-readonly={Boolean(lockedAccountEmail)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
              />
              {lockedAccountEmail ? (
                <p className="mt-1 text-xs text-gray-500">
                  Using your account email: <span className="font-medium">{lockedAccountEmail}</span>
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone (Pakistan) *
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="0300-1234567 or +923001234567"
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-gray-900 sm:text-sm ${
                  phoneError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'
                }`}
              />
              {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Format: 03XX-XXXXXXX (11 digits) or +923XXXXXXXXXX
              </p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street address *
              </label>
              <input
                type="text"
                id="address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
                Apartment, suite, etc. (optional)
              </label>
              <input
                type="text"
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                  Province / state *
                </label>
                <input
                  type="text"
                  id="province"
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                  Postal code *
                </label>
                <input
                  type="text"
                  id="postal_code"
                  required
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                Payment Method *
              </label>
              <select
                id="payment_method"
                required
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
              >
                <option value="credit_card">Card (Stripe)</option>
                <option value="debit_card">Debit card (Stripe)</option>
                <option value="paypal">PayPal (Stripe)</option>
                <option value="cash_on_delivery">Cash on delivery</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="space-y-2 border-b border-gray-200 pb-4">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {getProductBrandName(item.product.brand) || 'Product'} x {item.quantity}
                  </span>
                  <span className="text-gray-900">
                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-b border-gray-200 pb-4">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-base font-semibold text-gray-900">
                ${cart.total.toFixed(2)}
              </span>
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="mt-4 w-full rounded-md bg-gray-900 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
