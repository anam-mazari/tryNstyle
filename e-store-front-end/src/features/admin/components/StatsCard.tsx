'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  className?: string;
}

export function StatsCard({ title, value, icon, className = '' }: StatsCardProps) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}




