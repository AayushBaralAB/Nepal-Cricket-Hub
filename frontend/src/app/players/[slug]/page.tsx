import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { safeFetch, getPlayerBySlug, SITE_URL } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { initials } from '@/lib/format';
import { AdSlot } from '@/components/ui/AdSlot';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const player = await safeFetch(getPlayerBySlug(slug));
  if (!player) return { title: 'Player not found' };
  return {
    title: `${player.name} — Profile & Statistics`,
    description: `${player.name} cricket profile — role, ${player.battingStyle ?? 'batting'}, ${player.bowlingStyle ?? 'bowling'} and career statistics.`,
    openGraph: {
      type: 'profile',
      title: `${player.name} — Profile & Statistics`,
      description: `${player.name} — ${player.role ?? 'Cricketer'}, ${player.country ?? 'Nepal'}.`,
      url: `${SITE_URL}/players/${player.slug}`,
      images: player.photoUrl ? [{ url: player.photoUrl }] : undefined,
    },
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = await safeFetch(getPlayerBySlug(slug));
  if (!player) notFound();

  const stats = player.statistics ?? {};
  const statGroups = Object.entries(stats);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.name,
    jobTitle: player.role,
    nationality: player.country ?? 'Nepal',
    url: `${SITE_URL}/players/${player.slug}`,
    image: player.photoUrl,
  };

  return (
    <div className="container-nch space-y-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: 'Players', href: '/players' }, { label: player.name }]} />

      <header className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-nch-navy-800 via-nch-700 to-nch-navy-900" />
        <div className="-mt-12 px-6 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              {player.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-nch-600 to-nch-navy-800 font-display text-3xl font-black text-white shadow-lg">
                  {initials(player.name)}
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl font-black text-slate-900">{player.name}</h1>
                <p className="text-sm text-slate-500">
                  {player.role ?? 'Cricketer'} · {player.country ?? 'Nepal'}
                </p>
              </div>
            </div>
            {player.teamName && (
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <TeamAvatar name={player.teamName} size={28} />
                <span className="text-sm font-bold text-slate-700">{player.teamName}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <AdSlot slot="players_inline" />

      <div className="grid gap-4 sm:grid-cols-2">
        {player.battingStyle && <InfoBox label="Batting style" value={player.battingStyle} />}
        {player.bowlingStyle && <InfoBox label="Bowling style" value={player.bowlingStyle} />}
      </div>

      {statGroups.length > 0 && (
        <section aria-label="Career statistics">
          <h2 className="section-title">Career Statistics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {statGroups.map(([format, values]) => (
              <div key={format} className="card overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-600">{format}</h3>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-3">
                  {Object.entries(values).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{key}</dt>
                      <dd className="font-display text-lg font-black tabular-nums text-slate-900">
                        {typeof value === 'number' && Number.isInteger(value) ? value.toLocaleString() : value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      {player.recent && player.recent.length > 0 && (
        <section aria-label="Recent performances">
          <h2 className="section-title">Recent Performances</h2>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="table-th">Match</th>
                  <th className="table-th text-center">Runs</th>
                  <th className="table-th text-center">Balls</th>
                  <th className="table-th text-center">Wickets</th>
                  <th className="table-th text-right">Econ</th>
                </tr>
              </thead>
              <tbody>
                {player.recent.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="table-td font-semibold text-slate-700">{r.matchLabel}</td>
                    <td className="table-td text-center tabular-nums">
                      {r.runs === null ? '—' : <span className={r.isNotOut ? 'font-bold text-emerald-700' : ''}>{r.runs}{r.isNotOut ? '*' : ''}</span>}
                    </td>
                    <td className="table-td text-center tabular-nums text-slate-500">{r.balls ?? '—'}</td>
                    <td className="table-td text-center tabular-nums">{r.wickets ?? '—'}</td>
                    <td className="table-td text-right tabular-nums text-slate-500">{r.economy ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
