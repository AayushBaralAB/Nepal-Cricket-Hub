import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Nepal Cricket Hub privacy policy — how we handle data, cookies and third-party services.',
};

export default function PrivacyPage() {
  return (
    <div className="container-nch mx-auto max-w-3xl space-y-6 py-8">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      <article className="card space-y-6 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-black text-slate-900">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: August 2026</p>

        <Section title="1. Information we collect">
          <p>
            Nepal Cricket Hub is a fan-run sports information site. We do not require accounts or
            registration, and we do not collect names, emails or personal data through browsing.
            Like most sites, standard server logs record anonymous technical data such as IP
            address, browser type and pages viewed for security and performance analysis.
          </p>
        </Section>

        <Section title="2. Cookies and analytics">
          <p>
            We may use privacy-respecting, aggregate analytics to understand which pages are
            popular. Advertising and analytics partners may set cookies to measure performance and
            prevent repeated ads. You can disable or clear cookies in your browser settings at any
            time.
          </p>
        </Section>

        <Section title="3. Third-party services">
          <p>
            Live scores, statistics and news headlines are aggregated from third-party data
            providers and news sources. When you follow an outbound link to an original article,
            that site&apos;s own privacy policy applies.
          </p>
        </Section>

        <Section title="4. Children&apos;s privacy">
          <p>
            We do not knowingly collect personal information from children. This site is suitable
            for general audiences.
          </p>
        </Section>

        <Section title="5. Data sharing">
          <p>
            We do not sell, rent or trade personal information. Anonymous aggregate data may be
            shared with analytics providers for site improvement only.
          </p>
        </Section>

        <Section title="6. Contact">
          <p>
            Questions about this policy can be sent to hello@nepalcrickethub.com.
          </p>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-base font-bold text-slate-900">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}
