export default function AdminLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-stone-200 border-t-[#2c241c]"
        aria-hidden
      />
      <p className="text-sm font-medium text-stone-600">Loading dashboard…</p>
    </div>
  );
}
