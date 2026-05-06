export default function CustomerLoading() {
  return (
    <div
      className="flex min-h-[45vh] flex-col items-center justify-center gap-4 px-4 py-20"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800"
        aria-hidden
      />
      <p className="text-sm font-medium text-neutral-500">Loading page…</p>
    </div>
  );
}
