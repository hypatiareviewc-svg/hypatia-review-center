"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { useRef, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { heroSlides } from "@/lib/site-content";

export function HeroSlider() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [ready, setReady] = useState(false);

  return (
    <section id="home" className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,41,75,0.26),_transparent_40%)]" />
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setReady(true);
        }}
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 6500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="relative"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="relative min-h-[78svh] sm:min-h-[84svh]">
              <Image src={slide.image} alt={slide.title} fill priority className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(5,11,24,0.88)] via-[rgba(5,11,24,0.72)] to-[rgba(5,11,24,0.22)]" />
              <div className="container-shell relative z-10 flex min-h-[78svh] items-end py-12 sm:min-h-[84svh] sm:py-20 lg:items-center">
                <div className="max-w-3xl text-white">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/85 backdrop-blur-sm">
                    <GraduationCap className="h-4 w-4 text-[var(--secondary)]" />
                    {slide.eyebrow}
                  </div>
                  <h1 className="font-display text-3xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/82 sm:mt-6 sm:text-lg">
                    {slide.description}
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/admissions"
                      className="inline-flex w-full items-center justify-center rounded-full bg-[var(--secondary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 sm:w-auto"
                    >
                      Enroll Now
                    </Link>
                    <Link
                      href="/programs"
                      className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto"
                    >
                      View Programs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="container-shell relative z-20 -mt-8 flex justify-center gap-3 pb-8 sm:justify-end">
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={!ready}
          className="focus-ring inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[rgba(10,17,32,0.7)] text-white backdrop-blur-sm disabled:opacity-50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          disabled={!ready}
          className="focus-ring inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[rgba(10,17,32,0.7)] text-white backdrop-blur-sm disabled:opacity-50"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
