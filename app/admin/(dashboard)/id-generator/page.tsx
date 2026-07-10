import { IdGeneratorClient } from "@/components/admin/id-generator-client";

export default function IdGeneratorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--primary)] sm:text-3xl">
          ID Generator
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Generate and print student ID cards for enrolled students.
        </p>
      </div>
      <IdGeneratorClient />
    </div>
  );
}
