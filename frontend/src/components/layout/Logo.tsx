import Link from 'next/link';

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" role="img" aria-label="Nepal Cricket Hub logo">
      {/* Stylised cricket ball with a Himalayan peak */}
      <defs>
        <linearGradient id="ballGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#ballGrad)" stroke="#06221f" strokeWidth="2" />
      {/* seam */}
      <path d="M24 3 C 18 10, 18 38, 24 45" stroke="#64748b" strokeWidth="1.5" fill="none" />
      <path d="M24 3 C 30 10, 30 38, 24 45" stroke="#64748b" strokeWidth="1.5" fill="none" />
      <path d="M24 3 C 21.5 20, 21.5 28, 24 45" stroke="#64748b" strokeWidth="0.8" fill="none" />
      <path d="M24 3 C 26.5 20, 26.5 28, 24 45" stroke="#64748b" strokeWidth="0.8" fill="none" />
      {/* himalaya */}
      <path d="M8 30 L17 18 L21 24 L25 16 L33 28 L29 30 L21 24 L18 30 Z" fill="url(#mountainGrad)" stroke="#06221f" strokeWidth="1" />
      <path d="M25 16 L29 21.5 L28 22.5 L25 19.5 Z" fill="#10b981" />
      <circle cx="24" cy="7.5" r="1.4" fill="#f59e0b" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Nepal Cricket Hub — home">
      <LogoMark size={compact ? 34 : 40} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-black tracking-tight text-white sm:text-xl">
            Nepal Cricket<span className="text-nch-500"> Hub</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            All Nepal cricket, one hub
          </span>
        </span>
      )}
    </Link>
  );
}
