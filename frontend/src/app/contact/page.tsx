import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Contact Nepal Cricket Hub',
  description: 'Get in touch with Nepal Cricket Hub — feedback, corrections, and partnership enquiries.',
};

export default function ContactPage() {
  return (
    <div className="container-nch mx-auto max-w-3xl space-y-6 py-8">
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <div className="card space-y-6 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-black text-slate-900">Contact Us</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Have feedback, a correction, or a partnership enquiry? We&apos;d love to hear from you.
          For corrections about a news story, please include the headline and a link to the original
          article.
        </p>

        <a
          href="mailto:hello@nepalcrickethub.com?subject=Nepal%20Cricket%20Hub%20Enquiry"
          className="btn-primary inline-flex"
        >
          Email us at hello@nepalcrickethub.com
        </a>

        <div className="grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Corrections & feedback</p>
            <p className="mt-1 text-sm text-slate-600">Report scoring or news errors, suggest features or fixtures coverage.</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">News sources</p>
            <p className="mt-1 text-sm text-slate-600">Publishers who want their Nepal cricket coverage listed may contact us.</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Partnerships</p>
            <p className="mt-1 text-sm text-slate-600">Community, media and non-gambling partnerships welcome.</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data & advertising</p>
            <p className="mt-1 text-sm text-slate-600">We do not publish betting odds, paywalled content or unofficial streams.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
