'use client';

import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TransitionEvent } from 'react';
import heroSection1 from '@/images/img1.png';
import heroSection2 from '@/images/4image.jpeg';

const HERO_HOLD_MS = 12_000;
const HERO_SLIDE_MS = 1100;

const heroSlides: readonly { readonly src: StaticImageData; readonly alt: string }[] =
  [
    {
      src: heroSection1,
      alt: '',
    },
    {
      src: heroSection2,
      alt: '',
    },
  ];

const trackSlides: readonly { readonly src: StaticImageData; readonly alt: string }[] =
  [heroSlides[0], heroSlides[1], heroSlides[0]];

const trackSlotCount = trackSlides.length;

const slideEase = 'cubic-bezier(0.22, 1, 0.36, 1)';

function trackTransitionCss(enabled: boolean): string {
  if (!enabled) {
    return 'none';
  }
  return `transform ${HERO_SLIDE_MS}ms ${slideEase}`;
}

export function HomeHero() {
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [slideMotionEnabled, setSlideMotionEnabled] =
    useState<boolean>(false);

  const holdTimeoutRef = useRef<number | null>(null);

  const clearHoldTimeout = useCallback((): void => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, []);

  const scheduleHold = useCallback((): void => {
    clearHoldTimeout();
    holdTimeoutRef.current = window.setTimeout(() => {
      holdTimeoutRef.current = null;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setSlideMotionEnabled(true);
          setActiveTrackIndex((previous) => previous + 1);
        });
      });
    }, HERO_HOLD_MS);
  }, [clearHoldTimeout]);

  useEffect(() => {
    scheduleHold();
    return (): void => {
      clearHoldTimeout();
    };
  }, [scheduleHold, clearHoldTimeout]);

  const handleTrackTransitionEnd = (
    event: TransitionEvent<HTMLDivElement>,
  ): void => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'transform'
    ) {
      return;
    }
    setSlideMotionEnabled(false);
    setActiveTrackIndex((current) =>
      current === trackSlotCount - 1 ? 0 : current,
    );
    scheduleHold();
  };

  const translatePercent = -(activeTrackIndex * 100) / trackSlotCount;

  return (
    <section className="relative min-h-[78vh] w-full overflow-hidden bg-neutral-900">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="flex h-full"
          style={{
            width: `${trackSlotCount * 100}%`,
            transform: `translate3d(${translatePercent}%, 0, 0)`,
            transition: trackTransitionCss(slideMotionEnabled),
            willChange: slideMotionEnabled ? 'transform' : 'auto',
            ...(slideMotionEnabled
              ? { backfaceVisibility: 'hidden' as const }
              : {}),
          }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {trackSlides.map((slide, trackIndex) => (
            <div
              key={
                trackIndex === trackSlotCount - 1
                  ? 'hero-slide-clone'
                  : `hero-slide-${trackIndex}`
              }
              className="relative h-full min-w-0 shrink-0 grow-0"
              style={{
                flexBasis: `${100 / trackSlotCount}%`,
                maxWidth: `${100 / trackSlotCount}%`,
              }}
              aria-hidden={trackIndex !== activeTrackIndex}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={trackIndex === 0}
                loading={trackIndex >= 1 ? 'eager' : undefined}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-stone-950/70 via-stone-900/35 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-end px-4 pb-12 sm:px-6 sm:pb-14 lg:px-8">
        <div className="pointer-events-auto mx-auto flex w-full max-w-7xl flex-wrap gap-3 sm:gap-4">
          <Link
            href="/products"
            className="inline-flex min-h-[48px] items-center justify-center border border-white/45 bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.12em] text-[#faf8f4] shadow-sm backdrop-blur-[2px] transition-colors hover:border-white/70 hover:bg-white/15 hover:text-white"
          >
            Shop eyeglasses
          </Link>
          <Link
            href="/lenses"
            className="inline-flex min-h-[48px] items-center justify-center border border-white/45 bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.12em] text-[#faf8f4] shadow-sm backdrop-blur-[2px] transition-colors hover:border-white/70 hover:bg-white/15 hover:text-white"
          >
            Shop lenses
          </Link>
        </div>
      </div>
    </section>
  );
}
