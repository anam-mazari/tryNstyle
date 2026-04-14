import Image from 'next/image';
import Link from 'next/link';
import heroImage from '@/images/hero-section.png';

export function HomeHero() {
  return (
    <section className="relative min-h-[78vh] w-full overflow-hidden bg-neutral-900">
      <Image
        src={heroImage}
        alt="Eyewear collection — frames for every face"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
          New season
        </p>
        <h1 className="max-w-xl font-serif text-4xl font-normal leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Glasses you&apos;ll want to wear every day.
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/90 md:text-lg">
          Classic shapes, modern fits, and frames designed to feel as good as they look.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/products"
            className="inline-flex min-h-[48px] items-center justify-center border border-white bg-white px-8 text-sm font-semibold uppercase tracking-wide text-neutral-900 transition hover:bg-neutral-100"
          >
            Shop eyeglasses
          </Link>
          <Link
            href="/products?search=sun"
            className="inline-flex min-h-[48px] items-center justify-center border border-white/80 bg-transparent px-8 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
          >
            Shop sunglasses
          </Link>
          <Link
            href="/lenses"
            className="inline-flex min-h-[48px] items-center justify-center border border-white/80 bg-transparent px-8 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
          >
            Shop lenses
          </Link>
        </div>
      </div>
    </section>
  );
}
