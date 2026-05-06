'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/store/slices/cartSlice';
import { useSyncStripeSessionMutation } from '@/store/api/paymentsApi';
import type { StripeSessionOrderResponse } from '@/types/api';
import { getRtkErrorMessage } from '@/utils/get-rtk-error-message';
import { getProductBrandName, getProductCategoryName } from '@/utils/product-labels';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const dispatch = useDispatch();
  const [syncStripeSession] = useSyncStripeSessionMutation();
  const [result, setResult] = useState<StripeSessionOrderResponse | null>(null);
  const [syncError, setSyncError] = useState(false);
  const [syncErrorDetail, setSyncErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;
    const intervalRef = { current: null as ReturnType<typeof setInterval> | null };

    const runSync = async () => {
      if (cancelled) {
        return;
      }
      try {
        const response = await syncStripeSession({ sessionId }).unwrap();
        if (cancelled) {
          return;
        }
        setResult(response);
        setSyncError(false);
        setSyncErrorDetail(null);
        if (response.status === 'complete' && response.order) {
          dispatch(clearCart());
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
        if (response.status === 'failed' || response.status === 'unpaid') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }
        setSyncError(true);
        setSyncErrorDetail(
          getRtkErrorMessage(error, 'Request failed — check the browser Network tab for details.'),
        );
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    void runSync();
    intervalRef.current = setInterval(runSync, 2000);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId, syncStripeSession, dispatch]);

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Invalid return link</h1>
        <p className="mt-2 text-gray-600">
          Missing Stripe session. Return to checkout and try again.
        </p>
        <Link href="/checkout" className="mt-6 inline-block text-gray-900 underline">
          Back to checkout
        </Link>
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Could not confirm payment</h1>
        <p className="mt-2 text-gray-600">
          Check that the API is running, NEXT_PUBLIC_API_URL points at your Nest URL (e.g.
          http://localhost:3000), and the backend has STRIPE_SECRET_KEY set. If you paid, your order
          may still appear under orders shortly.
        </p>
        {syncErrorDetail ? (
          <p className="mt-3 rounded-md bg-gray-100 px-3 py-2 text-left text-sm text-gray-800">
            {syncErrorDetail}
          </p>
        ) : null}
        <Link href="/profile/orders" className="mt-6 inline-block text-gray-900 underline">
          View orders
        </Link>
      </div>
    );
  }

  if (result?.status === 'failed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Order could not be completed</h1>
        <p className="mt-2 text-gray-600">
          Payment was received but creating the order failed. Contact support with your session
          details.
        </p>
        <Link href="/profile/orders" className="mt-6 inline-block text-gray-900 underline">
          View orders
        </Link>
      </div>
    );
  }

  if (result?.status === 'unpaid') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Payment not completed</h1>
        <p className="mt-2 text-gray-600">No charge was made. You can try checkout again.</p>
        <Link href="/checkout" className="mt-6 inline-block text-gray-900 underline">
          Back to checkout
        </Link>
      </div>
    );
  }

  if (result?.status === 'complete' && result.order) {
    const itemLabels =
      result.order.items?.map((item) => {
        const product = item.product;
        if (!product) {
          return 'Product';
        }
        return (
          product.frameStyle ||
          getProductBrandName(product.brand) ||
          getProductCategoryName(product.category) ||
          'Product'
        );
      }) ?? [];
    const uniqueItemLabels = Array.from(new Set(itemLabels.filter(Boolean)));
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Thank you!</h1>
        <p className="mt-2 text-gray-600">
          Order <span className="font-mono text-sm">{result.order.order_id}</span> is paid and
          confirmed.
        </p>
        {uniqueItemLabels.length > 0 ? (
          <p className="mt-3 text-sm text-gray-600">
            Items:{' '}
            <span className="font-medium text-gray-900">
              {uniqueItemLabels.slice(0, 4).join(', ')}
              {uniqueItemLabels.length > 4 ? '…' : ''}
            </span>
          </p>
        ) : null}
        <Link
          href="/profile/orders"
          className="mt-8 inline-block rounded-md bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
        >
          View order history
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900" />
      <h1 className="text-xl font-semibold text-gray-900">Confirming your payment…</h1>
      <p className="mt-2 text-sm text-gray-600">
        Creating your order. This usually takes a few seconds.
      </p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900" />
          <p className="text-gray-600">Loading…</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
