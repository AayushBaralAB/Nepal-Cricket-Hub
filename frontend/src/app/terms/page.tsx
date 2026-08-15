import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Nepal Cricket Hub terms of use — rules for using our site and content.',
};

export default function TermsPage() {
  return (
    <div className="container-nch mx-auto max-w-3xl space-y-6 py-8">
      <Breadcrumbs items={[{ label: 'Terms of Use' }]} />
      <article className="card space-y-6 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-black text-slate-900">Terms of Use</h1>
        <p className="text-sm text-slate-500">Last updated: August 2026</p>

        <Section title="1. Acceptance of terms">
          <p>
            By using Nepal Cricket Hub you agree to these terms. If you do not agree, please do not
            use the site.
          </p>
        </Section>

        <Section title="2. Content and intellectual property">
          <p>
            Our original layout, text and brand content are protected. Live scores and statistics
            belong to their respective data providers. News headlines and excerpts are reproduced
            for news coverage under fair-use principles and link to the original publications.
          </p>
        </Section>

        <Section title="3. Acceptable use">
          <p>
            You may not scrape, republish or commercially exploit our content at scale, misuse the
            site for malware or spam, or attempt to disrupt service.
          </p>
        </Section>

        <Section title="4. No betting or gambling">
          <p>
            Nepal Cricket Hub does not host or promote betting odds, gambling or wagering services.
            Third-party ad networks may show ads; we do not endorse any advertiser&apos;s services.
          </p>
        </Section>

        <Section title="5. Disclaimer">
          <p>
            Match and news information is provided &quot;as is&quot; and may contain errors or
            delays. We are not liable for any loss arising from reliance on our content.
          </p>
        </Section>

        <Section title="6. Changes">
          <p>
            We may update these terms at any time. Continued use of the site after changes means
            you accept the revised terms.
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
