// Base pulsing block - compose these into any shape you need
// e.g. <Skeleton className="h-4 w-32" /> for a line of text
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink/10 ${className}`} />;
}

// A row that mimics a table row with N text-shaped columns
export function SkeletonRow({ columns = 3 }: { columns?: number }) {
  return (
    <tr className="border-t border-ink/5">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-3">
          <Skeleton className="h-4 w-24" />
        </td>
      ))}
    </tr>
  );
}

// A simple list item row (for <ul> based lists like Subjects/Academic years)
export function SkeletonListItem() {
  return (
    <li className="flex items-center justify-between px-6 py-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-16" />
    </li>
  );
}

// A card placeholder (for grid/card layouts like "My classes")
export function SkeletonCard() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-4 h-9 w-32 rounded-full" />
    </div>
  );
}
