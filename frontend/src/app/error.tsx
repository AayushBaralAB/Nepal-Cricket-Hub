'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-nch flex min-h-[60vh] items-center justify-center py-16">
      <div className="card max-w-md p-10 text-center">
        <p className="font-display text-5xl font-black text-rose-600">Oops</p>
        <h1 className="mt-3 font-display text-xl font-black text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
