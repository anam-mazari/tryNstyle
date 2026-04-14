'use client';

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <LoadingSkeleton className="aspect-square w-full rounded-md" />
      <div className="mt-3 flex justify-between gap-3 px-0.5">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-5 w-12 shrink-0" />
      </div>
      <div className="mt-3 flex justify-center">
        <LoadingSkeleton className="h-8 w-8 rounded-full" />
      </div>
      <LoadingSkeleton className="mt-3 h-9 w-full rounded-lg" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <LoadingSkeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}




