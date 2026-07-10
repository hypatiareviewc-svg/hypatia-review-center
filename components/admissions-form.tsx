"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, ImageOff, Loader2, Upload, UserRound, X } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useEffect, useState } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import { admissionsSchema, type AdmissionsFormValues } from "@/lib/admissions-schema";
import { PROGRAM_COURSES } from "@/lib/program-courses";
import { SearchableSelect } from "@/components/searchable-select";

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
  const [modalOpen, setModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AdmissionsFormValues>({ resolver: zodResolver(admissionsSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setModalOpen(true);

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
      setModalOpen(false);
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSubmitted(null);
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
    <div className="admissions-layout">
      <form onSubmit={onSubmit} className="surface-card relative overflow-hidden rounded-[2rem] p-5 sm:p-8 print:hidden">
        {/* Header */}
        <div className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--secondary)]">
              Admissions Form
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Enrollment Application</h2>
          </div>
          <div className="max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--muted)]">
            <p className="font-medium text-[var(--foreground)]">Before you start:</p>
            <ul className="mt-2 grid gap-1.5 pl-4">
              <li>Upload a clear 2x2 photo.</li>
              <li>Fill out all required personal, school, and guardian details.</li>
              <li>Review your entries, then submit the form.</li>
              <li>Print the confirmation sheet and bring it to admissions.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-7 sm:mt-8 sm:gap-8">
          {/* Photo Upload */}
          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-[var(--secondary)]" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)] sm:text-sm">Photo Upload</h3>
            </div>
            <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex justify-center sm:justify-start">
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

          {/* Student Information */}
          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--secondary)]" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)] sm:text-sm">Student Information</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Last Name" error={errors.lastName?.message} register={register("lastName")} />
              <Field label="First Name" error={errors.firstName?.message} register={register("firstName")} />
              <Field label="Middle Name" error={errors.middleName?.message} register={register("middleName")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SelectField
                label="Sex"
                error={errors.sex?.message}
                register={register("sex")}
                options={["Male", "Female"]}
              />
              <Field label="Birthday" type="date" error={errors.birthday?.message} register={register("birthday")} />
              <Field label="Birth Place" error={errors.birthPlace?.message} register={register("birthPlace")} />
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

          {/* School Graduated */}
          <section className="grid gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)] sm:text-sm">School Graduated</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name of School" error={errors.schoolName?.message} register={register("schoolName")} />
              <Field label="School Address" error={errors.schoolAddress?.message} register={register("schoolAddress")} />
              <Field label="Year Graduated" error={errors.yearGraduated?.message} register={register("yearGraduated")} />
            </div>
            <SearchableSelect
              label="Program / Course"
              options={PROGRAM_COURSES}
              register={register("programCourse")}
              onValueChange={(value) =>
                setValue("programCourse", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              error={errors.programCourse?.message}
              placeholder="Search your course..."
            />
          </section>

          {/* Guardian Information */}
          <section className="grid gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)] sm:text-sm">Guardian Information</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Full Name" error={errors.guardianFullName?.message} register={register("guardianFullName")} />
              <Field label="Address" error={errors.guardianAddress?.message} register={register("guardianAddress")} />
              <Field label="Contact Number" error={errors.guardianContactNumber?.message} register={register("guardianContactNumber")} />
            </div>
          </section>
        </div>

        {/* Submit */}
        <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
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

      {/* Modal with skeleton loading → printable form */}
      <SubmissionModal
        open={modalOpen}
        isSubmitting={isSubmitting}
        submitted={submitted}
        onClose={handleCloseModal}
        onPrint={handlePrint}
      />

      {/* Print-only output */}
      {submitted ? (
        <div className="hidden print:block">
          <ConfirmationForm submitted={submitted} />
        </div>
      ) : null}
    </div>
  );
}

function SubmissionModal({
  open,
  isSubmitting,
  submitted,
  onClose,
  onPrint,
}: {
  open: boolean;
  isSubmitting: boolean;
  submitted: SubmittedForm | null;
  onClose: () => void;
  onPrint: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={isSubmitting ? undefined : onClose}
            aria-hidden="true"
          />

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Enrollment application result"
          >
            {/* Close button */}
            {!isSubmitting ? (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}

            {isSubmitting || !submitted ? <ModalSkeleton /> : (
              <div>
                {/* Success header */}
                <div className="border-b border-[var(--border)] bg-gradient-to-br from-emerald-50 to-[var(--surface-soft)] p-6 text-center sm:p-8 print:hidden">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
                    Application Submitted!
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Your enrollment application has been saved. Download or print your confirmation form below.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm">
                    <span className="text-[var(--muted)]">Application No:</span>
                    <span className="font-semibold text-[var(--foreground)]">{submitted.applicationNumber}</span>
                  </div>
                </div>

                {/* Generated enrollment form — visible in modal and in print */}
                <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
                  <ConfirmationForm submitted={submitted} inModal />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-3 border-t border-[var(--border)] p-6 sm:p-8 print:hidden">
                  <button
                    type="button"
                    onClick={onPrint}
                    className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-95"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Form
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-6 text-sm font-semibold text-[var(--foreground)] transition hover:opacity-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ModalSkeleton() {
  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--primary)]/10" />
          <span className="absolute inset-2 rounded-full border border-[var(--primary)]/15" />
          <Loader2 className="relative h-7 w-7 animate-spin text-[var(--primary)]" aria-hidden="true" />
        </div>
        <div className="mt-5 h-5 w-48 animate-pulse rounded-full bg-[var(--border)]" />
        <div className="mt-3 h-3 w-64 animate-pulse rounded-full bg-[var(--border)]" />
      </div>

      <div className="mt-8 space-y-4" aria-hidden="true">
        <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--border)]" />
          <div className="h-3 w-32 animate-pulse rounded-full bg-[var(--border)]" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]"
            style={{ width: `${85 + Math.sin(i) * 12}%` }}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-sm font-medium text-[var(--foreground)]">
        Saving your application
      </p>
      <p className="mt-1 text-center text-xs text-[var(--muted)]">
        Please wait while we store your enrollment details in our records.
      </p>
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

function SelectField({
  label,
  register,
  error,
  options,
}: {
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <select
        className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
        {...register}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

function ConfirmationForm({
  submitted,
  inModal = false,
}: {
  submitted: SubmittedForm;
  inModal?: boolean;
}) {
  const fullName = [submitted.lastName, submitted.firstName, submitted.middleName]
    .filter(Boolean)
    .join(", ");
  const fullAddress = [
    submitted.street,
    submitted.barangay,
    submitted.cityMunicipality,
    submitted.province,
    submitted.zipcode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section
      className={[
        "hypatia-form print-sheet relative mx-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm",
        inModal ? "max-w-3xl" : "print:max-w-none print:rounded-none print:border-0 print:shadow-none",
      ].join(" ")}
    >
      {/* Decorative top band */}
      <div className="relative h-2 w-full bg-gradient-to-r from-[#14294b] via-[#a88237] to-[#14294b]" />

      {/* Watermark layer */}
      <div
        aria-hidden="true"
        className="hypatia-watermark pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span className="hypatia-watermark-text rotate-[-24deg] select-none text-center">
          HYPATIA
          <br />
          REVIEW
        </span>
      </div>

      <div className="relative p-6 sm:p-8">
        {/* Header */}
        <header className="flex items-start justify-between gap-5 border-b-2 border-double border-[#14294b] pb-5">
          <div className="grid gap-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-[#a88237]">
              Hypatia Review Center
            </p>
            <h4 className="font-serif text-2xl font-bold text-[#14294b] sm:text-3xl">
              Enrollment Confirmation Form
            </h4>
            <p className="text-xs text-slate-500 sm:text-sm">
              Please present this form to the admissions staff for enrollment confirmation.
            </p>
          </div>
          <div className="shrink-0">
            <PhotoFrame preview={submitted.photoPreview} name={submitted.photoName} printMode />
          </div>
        </header>

        {/* Application meta strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetaTile label="Application No." value={submitted.applicationNumber} />
          <MetaTile label="Date Submitted" value={formatDate()} />
          <MetaTile label="Status" value="Pending Review" accent />
        </div>

        {/* Sections */}
        <div className="mt-6 grid gap-5">
          <FormSection title="Personal Information">
            <Detail label="Full Name" value={fullName} />
            <Detail label="Sex" value={submitted.sex} />
            <Detail label="Birthday" value={submitted.birthday} />
            <Detail label="Birth Place" value={submitted.birthPlace} />
            <Detail label="Complete Address" value={fullAddress} colSpan />
            <Detail label="Email Address" value={submitted.email} />
            <Detail label="Contact Number" value={submitted.contactNumber} />
          </FormSection>

          <FormSection title="School & Program">
            <Detail label="School Name" value={submitted.schoolName} />
            <Detail label="School Address" value={submitted.schoolAddress} />
            <Detail label="Year Graduated" value={submitted.yearGraduated} />
            <Detail label="Program / Course" value={submitted.programCourse} highlight />
          </FormSection>

          <FormSection title="Guardian Information">
            <Detail label="Full Name" value={submitted.guardianFullName} />
            <Detail label="Address" value={submitted.guardianAddress} />
            <Detail label="Contact Number" value={submitted.guardianContactNumber} />
          </FormSection>
        </div>

        {/* Signatures */}
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <Signature label="Student Signature" />
          <Signature label="Staff Confirmation" />
        </div>

        {/* Footer */}
        <footer className="mt-8 flex flex-col items-center gap-1 border-t border-slate-200 pt-4 text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#a88237]">
            Hypatia Review Center
          </p>
          <p className="text-[0.65rem] text-slate-400">
            This document is system-generated. Verify authenticity with the admissions office.
          </p>
        </footer>
      </div>
    </section>
  );
}

function MetaTile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border px-4 py-2.5",
        accent
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-slate-50",
      ].join(" ")}
    >
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p
        className={[
          "mt-0.5 truncate text-sm font-semibold",
          accent ? "text-amber-700" : "text-[#14294b]",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200">
      <h5 className="bg-[#14294b] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white">
        {title}
      </h5>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
  colSpan = false,
  highlight = false,
}: {
  label: string;
  value: string;
  colSpan?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={colSpan ? "sm:col-span-2" : ""}>
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p
        className={[
          "mt-0.5 break-words text-sm",
          highlight
            ? "rounded-md bg-amber-50 px-1.5 py-0.5 font-bold text-amber-800"
            : "font-medium text-slate-800",
        ].join(" ")}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function Signature({ label }: { label: string }) {
  return (
    <div>
      <div className="h-16 border-b border-slate-400"></div>
      <p className="mt-2 text-center text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
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
