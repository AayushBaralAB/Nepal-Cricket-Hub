import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PhotoGallery } from '@/components/gallery/PhotoGallery';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Photo Gallery | CricketHub',
  description:
    'Browse Nepal cricket photos — match highlights, training sessions, celebrations and more from CricketHub.',
};

export default function GalleryPage() {
  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Gallery' }]} />

      <section
        aria-label="Gallery hero"
        className="rounded-2xl bg-gradient-to-br from-nch-600 via-nch-500 to-nch-navy-800 px-6 py-10 text-center sm:px-10 sm:py-14"
      >
        <span className="overline-label !justify-center !text-nch-200">CricketHub</span>
        <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">
          CricketHub Photo Gallery
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-nch-100/80">
          Capturing Nepal cricket moments — from thrilling match action to behind-the-scenes training and celebrations.
        </p>
      </section>

      <PhotoGallery />
    </div>
  );
}
