import type { Metadata } from 'next';
import Link from 'next/link';
import { safeFetch, getTeams } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { AdSlot } from '@/components/ui/AdSlot';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Cricket Teams',
  description: 'Teams in Nepal cricket — national team, NPL franchises, women\'s and U19 squads.',
};

export default async function TeamsPage() {
  const teams = (await safeFetch(getTeams())) ?? [];

  const national = teams.filter((t) => t.isNational || t.teamType === 'National');
  const franchise = teams.filter((t) => !national.includes(t));

  const sections = [
    { title: 'National Teams', items: national },
    { title: 'Franchise & Other Teams', items: franchise },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Teams' }]} />
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">Cricket Teams</h1>
        <p className="mt-1 text-sm text-slate-500">National sides, NPL franchises and squads connected to Nepal cricket.</p>
      </div>

      <AdSlot slot="teams_inline" />

      {teams.length === 0 && (
        <div className="card p-10 text-center text-sm text-slate-500">Team data will appear soon.</div>
      )}

      {sections.map((section) => (
        <section key={section.title} aria-label={section.title}>
          <h2 className="section-title">{section.title}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {section.items.map((team) => (
              <Link key={team.externalId} href={`/teams/${team.slug}`} className="card card-hover group flex flex-col items-center gap-3 p-6 text-center">
                <TeamAvatar name={team.name} logoUrl={team.logoUrl} size={72} />
                <div>
                  <h3 className="font-display text-base font-black text-slate-900 group-hover:text-nch-600">
                    {team.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {team.teamType ?? team.country ?? 'Cricket team'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
