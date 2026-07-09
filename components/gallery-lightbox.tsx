"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useState } from "react";

type GalleryImage = {
  src: string;
  alt: string;
  title: string;
};

export function GalleryLightbox({ images }: { images: readonly GalleryImage[] }) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <button
            key={image.title}
            type="button"
            onClick={() => setSelected(image)}
            className="group overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] text-left"
          >
            <div className="relative aspect-[4/3]">
              <Image src={image.src} alt={image.alt} fill className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-4">
              <p className="font-medium">{image.title}</p>
              <p className="text-sm text-[var(--muted)]">Click to enlarge</p>
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-[var(--surface)] shadow-2xl">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
              aria-label="Close gallery image"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative aspect-[16/10] w-full">
              <Image src={selected.src} alt={selected.alt} fill className="object-cover" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-2xl font-semibold">{selected.title}</h3>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}