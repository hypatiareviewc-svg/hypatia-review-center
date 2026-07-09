import { PageSection, SiteShell } from "@/components/site-shell";
import { GalleryLightbox } from "@/components/gallery-lightbox";

const images = [
  { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80", alt: "Classroom review session", title: "Interactive classroom review" },
  { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80", alt: "Lecture hall", title: "Academic lecture hall" },
  { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80", alt: "Collaborative learning", title: "Collaborative student mentoring" },
  { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80", alt: "Students discussing", title: "Focused board preparation" },
] as const;

export default function GalleryPage() {
  return (
    <SiteShell>
      <PageSection eyebrow="Photo Gallery" title="Open the lightbox to preview each image.">
        <GalleryLightbox images={images} />
      </PageSection>
    </SiteShell>
  );
}
