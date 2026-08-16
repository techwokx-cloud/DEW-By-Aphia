export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
      <div className="h-8 w-40 rounded bg-line/60 animate-pulse mb-10" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-[var(--radius)] bg-line/60 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
