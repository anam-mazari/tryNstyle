'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const sidebarNavActiveClass =
  'bg-[#3d342c] text-[#faf8f4] shadow-sm ring-1 ring-white/5';
const sidebarNavInactiveClass =
  'text-[#b8aea3] hover:bg-[#352c26] hover:text-[#f4efe6]';

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { name: 'Sales', href: '/dashboard/sales', icon: <SalesIcon /> },
  { name: 'Products', href: '/dashboard/products', icon: <ProductsIcon /> },
  { name: 'Orders', href: '/dashboard/orders', icon: <OrdersIcon /> },
  { name: 'Users', href: '/dashboard/users', icon: <UsersIcon /> },
];

function DashboardIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-stone-200/90 bg-[#fcfaf6] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-[#2c241c] lg:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-[#2c241c]">Admin Panel</div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-stone-800/40 bg-[#2a221c] px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-[#faf8f4]">TrynStyle Admin</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive =
                      item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-colors ${
                            isActive ? sidebarNavActiveClass : sidebarNavInactiveClass
                          }`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                            {item.icon}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-[#2c241c]/75" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-stone-800/40 bg-[#2a221c]">
            <div className="flex h-16 shrink-0 items-center gap-x-4 border-b border-stone-700/50 px-4 shadow-sm sm:px-6">
              <h1 className="text-xl font-bold text-[#faf8f4]">TrynStyle Admin</h1>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-[#b8aea3] transition hover:bg-[#352c26] hover:text-[#faf8f4]"
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-1 flex-col px-4 py-4">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive =
                        item.href === '/dashboard'
                          ? pathname === '/dashboard'
                          : pathname === item.href || pathname?.startsWith(item.href + '/');
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-colors ${
                              isActive ? sidebarNavActiveClass : sidebarNavInactiveClass
                            }`}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                              {item.icon}
                            </span>
                            <span className="truncate">{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
