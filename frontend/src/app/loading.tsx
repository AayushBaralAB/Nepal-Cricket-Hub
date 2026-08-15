export default function Loading() {
  return (
    <div className="container-nch space-y-6 py-8">
      <div className="card h-40 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-52 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
