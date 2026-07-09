"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileText, ImageOff, Loader2, Upload, UserRound } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import { admissionsSchema, type AdmissionsFormValues } from "@/lib/admissions-schema";

type SubmittedForm = AdmissionsFormValues & {
  applicationNumber: string;
  photoName?: string;
  photoPreview?: string;
  submittedAt: string;
};

function formatDate() {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read photo file."));
    reader.readAsDataURL(file);
  });
}

export function AdmissionsForm() {
  const [submitted, setSubmitted] = useState<SubmittedForm | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | undefined>();
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AdmissionsFormValues>({ resolver: zodResolver(admissionsSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const photoDataUrl = photoFile ? await fileToDataUrl(photoFile) : undefined;

      const response = await fetch("/api/admissions/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          photo: photoName ? [{ name: photoName }] : undefined,
          photoDataUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save enrollment application.");
      }

      const payload = (await response.json()) as {
        applicationNumber: string;
        submittedAt: string;
      };

      setSubmitted({
        ...values,
        applicationNumber: payload.applicationNumber,
        submittedAt: payload.submittedAt,
        photoName,
        photoPreview,
      });
      reset();
      setPhotoName(undefined);
      setPhotoFile(undefined);
      setPhotoPreview(undefined);
    } catch {
      setSubmitError("We could not save your application. Please check your connection and try again.");
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const photoField = register("photo", {
    onChange: (event) => {
      const file = event.target.files?.[0] as File | undefined;
      setPhotoName(file?.name);
      setPhotoFile(file);
      setPhotoPreview((currentPreview) => {
        if (currentPreview) {
          URL.revokeObjectURL(currentPreview);
        }

        return file ? URL.createObjectURL(file) : undefined;
      });
    },
  });

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] admissions-layout print:block">
      <form onSubmit={onSubmit} className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 print:hidden">
        {isSubmitting ? <FormSubmitOverlay /> : null}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--secondary)]">
              Admissions Form
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Enrollment Application</h2>
            <div className="mt-4 max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--muted)]">
              <p className="font-medium text-[var(--foreground)]">Before you start:</p>
              <ul className="mt-2 grid gap-1.5 pl-4">
                <li>Upload a clear 2x2 photo.</li>
                <li>Fill out all required personal, school, and guardian details.</li>
                <li>Review your entries, then submit the form.</li>
                <li>Print the confirmation sheet and bring it to admissions.</li>
              </ul>
            </div>
          </div>
          <div className="hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-right text-xs text-[var(--muted)] sm:block">
            <span className="block font-semibold text-[var(--foreground)]">Student ID</span>
            <span>Auto-generated after submit</span>
          </div>
        </div>

        <div className="mt-8 grid gap-8">
          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-[var(--secondary)]" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]">Photo Upload</h3>
            </div>
            <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
              <div className="flex justify-center lg:justify-start">
              <PhotoFrame preview={photoPreview} name={photoName} />
              </div>

              <div className="grid gap-3">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium">Upload 2x2 Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
                    {...photoField}
                  />
                </label>
                <p className="max-w-xl text-xs leading-6 text-[var(--muted)]">
                  The preview updates instantly. Please use a clear passport-style photo so the printed form looks clean and professional.
                </p>
                {photoName ? (
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--muted)]">
                    <ImageOff className="h-3.5 w-3.5" />
                    <span>{photoName}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--secondary)]" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]">Student Information</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Last Name" error={errors.lastName?.message} register={register("lastName")} />
              <Field label="First Name" error={errors.firstName?.message} register={register("firstName")} />
              <Field label="Middle Name" error={errors.middleName?.message} register={register("middleName")} />
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2 text-sm">
                <span className="font-medium">Complete Address</span>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Street" error={errors.street?.message} register={register("street")} />
                  <Field label="Barangay" error={errors.barangay?.message} register={register("barangay")} />
                  <Field label="City / Municipality" error={errors.cityMunicipality?.message} register={register("cityMunicipality")} />
                  <Field label="Province" error={errors.province?.message} register={register("province")} />
                  <Field label="Zip Code" error={errors.zipcode?.message} register={register("zipcode")} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email Address" type="email" error={errors.email?.message} register={register("email")} />
                <Field label="Contact Number" error={errors.contactNumber?.message} register={register("contactNumber")} />
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]">School Graduated</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name of School" error={errors.schoolName?.message} register={register("schoolName")} />
              <Field label="School Address" error={errors.schoolAddress?.message} register={register("schoolAddress")} />
              <Field label="Year Graduated" error={errors.yearGraduated?.message} register={register("yearGraduated")} />
              <Field label="Program / Course" error={errors.programCourse?.message} register={register("programCourse")} />
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]">Guardian Information</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Full Name" error={errors.guardianFullName?.message} register={register("guardianFullName")} />
              <Field label="Address" error={errors.guardianAddress?.message} register={register("guardianAddress")} />
              <Field label="Contact Number" error={errors.guardianContactNumber?.message} register={register("guardianContactNumber")} />
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring inline-flex h-12 min-w-[10.5rem] items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Submit Form"
            )}
          </button>
          <p className="text-sm text-[var(--muted)]">
            Student ID will be generated automatically after submission.
          </p>
          {submitError ? (
            <p className="w-full text-sm text-red-500" role="alert">
              {submitError}
            </p>
          ) : null}
        </div>
      </form>

      <aside className="surface-card rounded-[2rem] p-6 sm:p-8 print:rounded-none print:border-0 print:shadow-none print-sheet">
        <div className="print:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--secondary)]">Enrollment Output</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Printable Enrollment Form</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            After submitting, download or print the generated form and bring it to the staff for enrollment confirmation.
          </p>
          {isSubmitting ? (
            <EnrollmentOutputLoading />
          ) : submitted ? (
            <button
              type="button"
              onClick={handlePrint}
              className="focus-ring mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-95"
            >
              <Download className="h-4 w-4" />
              Download PDF Form
            </button>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
              The printable form will appear here after submit.
            </div>
          )}
        </div>

        {submitted ? (
          <div className="mt-6 print:mt-0">
            <PrintableForm submitted={submitted} />
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function FormSubmitOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-[2rem] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-[3px]"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-4 max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-7 text-center shadow-lg">
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--primary)]/10" />
          <span className="absolute inset-2 rounded-full border border-[var(--primary)]/15" />
          <Loader2 className="relative h-7 w-7 animate-spin text-[var(--primary)]" aria-hidden="true" />
        </div>
        <p className="mt-5 font-medium text-[var(--foreground)]">Saving your application</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Please wait while we store your enrollment details in our records.
        </p>
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-[var(--surface-soft)]">
          <span className="submit-progress-bar block h-full rounded-full bg-[var(--secondary)]" />
        </div>
      </div>
    </div>
  );
}

function EnrollmentOutputLoading() {
  return (
    <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[var(--secondary)]" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">Generating enrollment form</p>
          <p className="text-xs text-[var(--muted)]">Your printable confirmation will appear shortly.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3" aria-hidden="true">
        <div className="h-3 w-2/5 animate-pulse rounded-full bg-[var(--border)]" />
        <div className="h-3 w-full animate-pulse rounded-full bg-[var(--border)]" />
        <div className="h-3 w-11/12 animate-pulse rounded-full bg-[var(--border)]" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-[var(--border)]" />
      </div>
    </div>
  );
}

function Field({
  label,
  register,
  error,
  type = "text",
}: {
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
        {...register}
      />
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

function PrintableForm({ submitted }: { submitted: SubmittedForm }) {
  const fullName = [submitted.lastName, submitted.firstName, submitted.middleName].join(", ");

  return (
    <section className="print-form mx-auto max-w-3xl rounded-[2rem] border border-[var(--border)] bg-white p-8 text-slate-900 shadow-none print:max-w-none print:border-0 print:p-0">
      <div className="flex items-start justify-between gap-4 border-b border-slate-300 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Hypatia Review Center</p>
          <h4 className="mt-2 font-serif text-3xl font-semibold">Enrollment Confirmation Form</h4>
          <p className="mt-1 text-sm text-slate-600">Please present this form to the staff for enrollment confirmation.</p>
        </div>
        <div className="shrink-0">
          <PhotoFrame preview={submitted.photoPreview} name={submitted.photoName} printMode />
        </div>
      </div>

      <div className="mt-6 grid gap-4 text-sm">
        <InfoRow label="Application Number" value={submitted.applicationNumber} />
        <InfoRow label="Name" value={fullName} />
        <InfoRow label="Address" value={`${submitted.street}, ${submitted.barangay}, ${submitted.cityMunicipality}, ${submitted.province}, ${submitted.zipcode}`} />
        <InfoRow label="Email Address" value={submitted.email} />
        <InfoRow label="Contact Number" value={submitted.contactNumber} />
        <InfoRow label="School Graduated" value={`${submitted.schoolName} | ${submitted.schoolAddress} | ${submitted.yearGraduated} | ${submitted.programCourse}`} />
        <InfoRow label="Guardian Information" value={`${submitted.guardianFullName} | ${submitted.guardianAddress} | ${submitted.guardianContactNumber}`} />
        <InfoRow label="Date Submitted" value={formatDate()} />
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <div className="h-20 border-b border-slate-400"></div>
          <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-slate-500">Student Signature</p>
        </div>
        <div>
          <div className="h-20 border-b border-slate-400"></div>
          <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-slate-500">Staff Confirmation</p>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-200 pb-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}

function PhotoFrame({
  preview,
  name,
  printMode = false,
}: {
  preview?: string;
  name?: string;
  printMode?: boolean;
}) {
  return (
    <div
      className={[
        "relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 bg-slate-100 shadow-sm",
        printMode ? "border-slate-400" : "border-[var(--border)]",
      ].join(" ")}
    >
      {preview ? (
        <>
          <Image
            src={preview}
            alt={name ? `Uploaded photo for ${name}` : "Uploaded photo preview"}
            fill
            unoptimized
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[1rem] ring-1 ring-black/10" />
        </>
      ) : (
        <div
          className={[
            "flex h-full w-full flex-col items-center justify-center gap-2 text-center",
            printMode ? "bg-slate-50 text-slate-500" : "bg-gradient-to-br from-slate-200 to-slate-100 text-slate-500",
          ].join(" ")}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <UserRound className="h-7 w-7" />
          </div>
          <span className="px-3 text-[11px] font-medium uppercase tracking-[0.16em]">No Photo</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-[6px] rounded-[0.9rem] border border-white/45" />
    </div>
  );
}
