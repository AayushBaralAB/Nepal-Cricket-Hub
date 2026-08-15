import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-nch flex min-h-[60vh] items-center justify-center py-16">
      <div className="card max-w-md p-10 text-center">
        <p className="font-display text-6xl font-black text-nch-600">404</p>
        <h1 className="mt-3 font-display text-xl font-black text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-primary">Home</Link>
          <Link href="/matches" className="btn-secondary">Matches</Link>
        </div>
      </div>
    </div>
  );
}
