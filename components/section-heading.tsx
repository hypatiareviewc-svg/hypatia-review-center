export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--secondary)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">{description}</p> : null}
    </div>
  );
}