'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  className = '',
  iconClassName = 'bg-[#2c241c]',
}: StatsCardProps) {
  return (
    <div
      className={`rounded-lg border border-stone-200/80 bg-[#fcfaf6] p-6 shadow-sm ${className}`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-md text-[#faf8f4] ${iconClassName}`}
          >
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="text-2xl font-semibold text-[#2c241c]">{value}</p>
        </div>
      </div>
    </div>
  );
}




