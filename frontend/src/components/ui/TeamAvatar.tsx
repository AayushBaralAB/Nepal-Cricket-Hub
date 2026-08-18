import { initials } from '@/lib/format';

const TEAM_COLORS: Record<string, string> = {
  'Nepal': 'bg-gradient-to-br from-nch-600 to-nch-navy-800 text-white',
  'Nepal Women': 'bg-gradient-to-br from-pink-600 to-rose-800 text-white',
  'Nepal U19': 'bg-gradient-to-br from-amber-500 to-orange-700 text-white',
  'Nepal A': 'bg-gradient-to-br from-teal-600 to-teal-800 text-white',
  'Nepal Women U19': 'bg-gradient-to-br from-fuchsia-600 to-pink-800 text-white',
  'Nepal U16': 'bg-gradient-to-br from-cyan-500 to-blue-700 text-white',
  'Janakpur Bolts': 'bg-gradient-to-br from-blue-600 to-indigo-800 text-white',
  'Biratnagar Kings': 'bg-gradient-to-br from-orange-500 to-red-700 text-white',
  'Karnali Yaks': 'bg-gradient-to-br from-slate-500 to-slate-800 text-white',
  'Pokhara Avengers': 'bg-gradient-to-br from-rose-500 to-rose-800 text-white',
  'Chitwan Rhinos': 'bg-gradient-to-br from-violet-600 to-purple-800 text-white',
  'Lumbini Lions': 'bg-gradient-to-br from-amber-400 to-amber-700 text-white',
  'Sudurpaschim Royals': 'bg-gradient-to-br from-sky-500 to-sky-800 text-white',
  'Kathmandu Gurkhas': 'bg-gradient-to-br from-red-600 to-slate-900 text-white',
  'United Arab Emirates': 'bg-gradient-to-br from-emerald-600 to-emerald-900 text-white',
  'Oman': 'bg-gradient-to-br from-red-600 to-red-900 text-white',
  'Namibia': 'bg-gradient-to-br from-blue-600 to-rose-700 text-white',
  'Zimbabwe': 'bg-gradient-to-br from-yellow-500 to-yellow-800 text-white',
  'India': 'bg-gradient-to-br from-blue-700 to-orange-500 text-white',
  'Pakistan': 'bg-gradient-to-br from-green-800 to-green-950 text-white',
  'Afghanistan': 'bg-gradient-to-br from-blue-900 to-red-700 text-white',
  'Sri Lanka': 'bg-gradient-to-br from-blue-800 to-red-600 text-white',
  'Bangladesh': 'bg-gradient-to-br from-green-700 to-red-700 text-white',
};

const DEFAULT_GRADIENT = 'bg-gradient-to-br from-slate-600 to-slate-900 text-white';

export function TeamAvatar({
  name,
  logoUrl,
  size = 40,
}: {
  name: string;
  logoUrl?: string;
  size?: number;
}) {
  const gradient = TEAM_COLORS[name] ?? DEFAULT_GRADIENT;

  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="rounded-full border border-slate-200 object-contain bg-white"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-black ${gradient}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
