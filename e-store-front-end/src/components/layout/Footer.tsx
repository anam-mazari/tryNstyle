import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-stone-800/60 bg-[#2a221c] text-[#c9c0b4]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#faf8f4]">TrynStyle</h3>
            <p className="text-sm text-[#c9c0b4]">
              Your trusted destination for premium products and exceptional service.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#ece7df]">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="transition hover:text-[#faf8f4]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition hover:text-[#faf8f4]">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="transition hover:text-[#faf8f4]">
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition hover:text-[#faf8f4]">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#ece7df]">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile/orders" className="transition hover:text-[#faf8f4]">
                  Order History
                </Link>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#faf8f4]">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#faf8f4]">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#ece7df]">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: support@trynstyle.com</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-700/50 pt-8 text-center text-sm text-[#a8a095]">
          <p>&copy; {new Date().getFullYear()} TrynStyle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
