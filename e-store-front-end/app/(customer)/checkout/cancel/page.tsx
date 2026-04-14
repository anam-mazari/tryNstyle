import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Payment cancelled</h1>
      <p className="mt-2 text-gray-600">No charge was made. You can return to checkout anytime.</p>
      <Link
        href="/checkout"
        className="mt-8 inline-block rounded-md bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
      >
        Back to checkout
      </Link>
    </div>
  );
}
