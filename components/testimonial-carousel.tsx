"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { useRef } from "react";
import "swiper/css";
import "swiper/css/pagination";

type Testimonial = {
  name: string;
  school: string;
  batch: string;
  rating: number;
  review: string;
  photo: string;
};

export function TestimonialCarousel({ testimonials }: { testimonials: readonly Testimonial[] }) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <Swiper
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 5200, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop
      className="pb-10"
      breakpoints={{
        0: { slidesPerView: 1, spaceBetween: 16 },
        1024: { slidesPerView: 2, spaceBetween: 20 },
      }}
    >
      {testimonials.map((testimonial) => (
        <SwiperSlide key={testimonial.name}>
          <article className="surface-card h-full rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--border)]">
                <Image src={testimonial.photo} alt={testimonial.name} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-semibold">{testimonial.name}</h3>
                <p className="text-sm text-[var(--muted)]">{testimonial.school}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--secondary)]">{testimonial.batch}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-1 text-[var(--secondary)]">
              {Array.from({ length: testimonial.rating }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{testimonial.review}</p>
          </article>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}