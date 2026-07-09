"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  program: z.string().min(2, "Please choose a program."),
  message: z.string().min(10, "Please add a short inquiry."),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="surface-card rounded-[2rem] p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Full Name</span>
          <input className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3" {...register("name")} />
          {errors.name ? <span className="text-xs text-red-400">{errors.name.message}</span> : null}
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Email</span>
          <input className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3" {...register("email")} />
          {errors.email ? <span className="text-xs text-red-400">{errors.email.message}</span> : null}
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Phone</span>
          <input className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3" {...register("phone")} />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Program</span>
          <input className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3" placeholder="LEC / Final Coaching / Seminar" {...register("program")} />
          {errors.program ? <span className="text-xs text-red-400">{errors.program.message}</span> : null}
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm">
        <span className="font-medium">Message</span>
        <textarea
          rows={5}
          className="focus-ring rounded-3xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
          {...register("message")}
        />
        {errors.message ? <span className="text-xs text-red-400">{errors.message.message}</span> : null}
      </label>

      {submitted ? <p className="mt-4 text-sm text-[var(--secondary)]">Your inquiry has been received. Our team will respond shortly.</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-ring mt-5 inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-contrast)] disabled:opacity-70"
      >
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}