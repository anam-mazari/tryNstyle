'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">TrynStyle</h3>
            <p className="text-sm">
              Your trusted destination for premium products and exceptional service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-white">
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile/orders" className="hover:text-white">
                  Order History
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: support@trynstyle.com</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} TrynStyle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
