import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, ShieldCheck } from "lucide-react";
import { HeroSlider } from "@/components/hero-slider";
import { HomeActivityCalendar } from "@/components/home-activity-calendar";
import { HomeAnnouncements } from "@/components/home-announcements";
import { StatsStrip } from "@/components/stats-strip";
import { FacultyGrid } from "@/components/faculty-grid";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { PageSection, SectionLink, SiteShell } from "@/components/site-shell";
import { contactInfo, faqs, lecturers, learningApproach, newsItems, passers, programs, programSubjects, story, testimonials, values, whyChooseUs } from "@/lib/site-content";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
    alt: "Students in a review session",
    title: "Board review classroom",
  },
  {
    src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    alt: "Academic discussion",
    title: "Guided lecture discussion",
  },
  {
    src: "https://images.unsplash.com/photo-1491309055484-bc2b7f7b5f16?auto=format&fit=crop&w=1200&q=80",
    alt: "Students studying",
    title: "Focused study environment",
  },
] as const;

export default function Home() {
  return (
    <SiteShell>
      <HeroSlider />
      <StatsStrip />

      <PageSection
        eyebrow="Announcements"
        title="Important notices for students, parents, and review applicants."
        description="Stay updated on enrollment deadlines, schedule changes, and official advisories from Hypatia Review Center."
      >
        <HomeAnnouncements />
      </PageSection>

      <PageSection
        eyebrow="Calendar of Activities"
        title="Upcoming lectures, assessments, and review events."
        description="Plan your review cycle with a clear view of seminars, diagnostics, mock boards, and orientation activities."
      >
        <HomeActivityCalendar />
      </PageSection>

      <PageSection
        eyebrow="About Hypatia"
        title="A review center built on structure, clarity, and trust."
        description="We provide a disciplined learning environment for criminology graduates who want a serious, supportive, and academically grounded path to board preparation."
      >
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="surface-card rounded-[2rem] p-7">
            <div className="prose-tight space-y-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
              <p>{story.history}</p>
              <p>{story.mission}</p>
              <p>{story.vision}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {values.map((value) => (
                <span key={value} className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm">
                  {value}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-7">
            <h3 className="font-display text-2xl font-semibold">Why students choose Hypatia</h3>
            <ul className="mt-5 space-y-4 text-sm text-[var(--muted)]">
              {whyChooseUs.map((item) => (
                <li key={item} className="flex gap-3">
                  <CircleCheck className="mt-0.5 h-5 w-5 flex-none text-[var(--secondary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Programs Offered"
        title="A complete LEC review path with clear schedules and board-focused content."
        description="Every program is organized around subject mastery, repetition, and feedback so students can prepare with confidence and discipline."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {programs.map((program) => (
            <article key={program.title} className="surface-card rounded-[2rem] p-7">
              <BookOpen className="h-6 w-6 text-[var(--secondary)]" />
              <h3 className="mt-4 font-display text-2xl font-semibold">{program.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{program.description}</p>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-2">
                  <dt className="text-[var(--muted)]">Duration</dt>
                  <dd className="font-medium">{program.duration}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-2">
                  <dt className="text-[var(--muted)]">Schedule</dt>
                  <dd className="font-medium">{program.schedule}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                {program.features.map((feature) => (
                  <span key={feature} className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
                    {feature}
                  </span>
                ))}
              </div>
              <Link href="/admissions" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                Enroll in this track <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-6 surface-card rounded-[2rem] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--secondary)]">Subjects Covered</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {programSubjects.map((subject) => (
              <span key={subject} className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--muted)]">
                {subject}
              </span>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Learning Approach"
        title="An academic rhythm that turns preparation into progress."
        description="Our approach emphasizes repetition, diagnostics, and guided correction so that students can see where they stand and what to improve next."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {learningApproach.map((item) => (
            <article key={item.title} className="surface-card rounded-[2rem] p-6">
              <ShieldCheck className="h-6 w-6 text-[var(--secondary)]" />
              <h3 className="mt-4 font-display text-2xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Lecturers"
        title="Experienced faculty who teach with precision and professionalism."
        description="Our lecturers bring academic depth, board review experience, and careful mentorship to every session."
      >
        <FacultyGrid lecturers={lecturers} />
      </PageSection>

      <PageSection
        eyebrow="Testimonials"
        title="Students describe the program as organized, supportive, and board-ready."
        description="The review culture is built around accountability, encouragement, and a professional atmosphere that keeps students focused."
      >
        <TestimonialCarousel testimonials={testimonials} />
      </PageSection>

      <PageSection
        eyebrow="Board Passers Gallery"
        title="A growing community of successful criminology graduates."
        description="We celebrate each batch of passers and the effort that brought them to the finish line."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {passers.map((passer) => (
            <article key={passer.name} className="surface-card rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]">Passed {passer.year}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{passer.name}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{passer.school}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Gallery"
        title="A respectful, academic environment that feels distinctly institutional."
        description="Sample photography highlights classroom work, mentoring, and focused review sessions."
      >
        <GalleryLightbox images={galleryImages} />
      </PageSection>

      <PageSection
        eyebrow="News and Announcements"
        title="Important dates, schedules, and academic updates."
        description="Students and parents can quickly review the latest announcements and enrollment reminders."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {newsItems.map((news) => (
            <article key={news.title} className="surface-card rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]">{news.category}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{news.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{news.date}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{news.summary}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="FAQ"
        title="Quick answers for enrollment and review planning."
        description="Clear information helps students decide faster and reduces the friction that often slows down enrollment."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((faqItem) => (
            <details key={faqItem.question} className="surface-card rounded-[1.75rem] p-6">
              <summary className="cursor-pointer font-semibold">{faqItem.question}</summary>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{faqItem.answer}</p>
            </details>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Contact"
        title="Speak with our admissions team."
        description="Inquiries are handled by a responsive staff who can help with schedules, enrollment, and program options."
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="surface-card rounded-[2rem] p-7">
            <h3 className="font-display text-2xl font-semibold">Contact information</h3>
            <div className="mt-4 space-y-4 text-sm text-[var(--muted)]">
              <p>{contactInfo.address}</p>
              <p>
                Google Maps:{" "}
                <a
                  href={contactInfo.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--primary)] underline-offset-4 hover:underline"
                >
                  {contactInfo.mapsPlusCode}
                </a>
              </p>
              <p>{contactInfo.phone}</p>
              <p>{contactInfo.email}</p>
              <p>{contactInfo.hours}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <SectionLink href="/contact">Open contact page</SectionLink>
              <SectionLink href="/admissions">View admissions</SectionLink>
            </div>
          </div>
          <div className="surface-card rounded-[2rem] p-7">
            <iframe
              title="Hypatia Review Center location"
              src={contactInfo.mapsUrl}
              className="h-80 w-full rounded-[1.5rem] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </PageSection>
    </SiteShell>
  );
}
