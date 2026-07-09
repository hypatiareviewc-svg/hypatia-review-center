"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type FormValues = z.infer<typeof schema>;

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSubmitted(true);
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="sr-only">Email address</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="email"
            placeholder="Email address"
            className="focus-ring w-full rounded-full border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-4 text-sm"
            {...register("email")}
          />
        </div>
      </label>
      {errors.email ? <p className="text-sm text-red-400">{errors.email.message}</p> : null}
      {submitted ? <p className="text-sm text-[var(--secondary)]">Subscription request received.</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-contrast)] disabled:opacity-70"
      >
        {isSubmitting ? "Submitting..." : "Subscribe"}
      </button>
    </form>
  );
}