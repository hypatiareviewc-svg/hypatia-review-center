"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Upload, UserRound, X, ImageOff } from "lucide-react";
import { PROGRAM_COURSES } from "@/lib/program-courses";
import { SearchableSelect } from "@/components/searchable-select";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createSchema = z.object({
  lastName: z.string().min(2, "Last name is required."),
  firstName: z.string().min(2, "First name is required."),
  middleName: z.string().min(1, "Middle name is required."),
  sex: z.enum(["Male", "Female"], { message: "Please select sex." }),
  birthday: z.string().min(1, "Birthday is required."),
  birthPlace: z.string().min(2, "Birth place is required."),
  street: z.string().min(2, "Street is required."),
  barangay: z.string().min(2, "Barangay is required."),
  cityMunicipality: z.string().min(2, "City/Municipality is required."),
  province: z.string().min(2, "Province is required."),
  zipcode: z.string().min(3, "Zip code is required."),
  email: z.string().email("Enter a valid email."),
  contactNumber: z.string().min(7, "Contact number is required."),
  schoolName: z.string().min(2, "School name is required."),
  schoolAddress: z.string().min(2, "School address is required."),
  yearGraduated: z.string().min(4, "Year graduated is required."),
  programCourse: z.string().min(2, "Program/Course is required."),
  guardianFullName: z.string().min(2, "Guardian name is required."),
  guardianAddress: z.string().min(2, "Guardian address is required."),
  guardianContactNumber: z.string().min(7, "Guardian contact is required."),
});

type CreateFormValues = z.infer<typeof createSchema>;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read photo file."));
    reader.readAsDataURL(file);
  });
}

export function AddStudentModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({ resolver: zodResolver(createSchema) });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoFile(undefined);
      setPhotoPreview(undefined);
      setSubmitError(null);
      reset();
    }
  }, [open, reset, photoPreview]);

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] as File | undefined;
    setPhotoFile(file);
    setPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : undefined;
    });
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const photoDataUrl = photoFile ? await fileToDataUrl(photoFile) : undefined;

      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          photoName: photoFile?.name,
          photoDataUrl,
          status: "PENDING",
        }),
      });

      if (!res.ok) {
        let msg = "Failed to add student.";
        try {
          const data = await res.json();
          if (data.message) msg = data.message;
        } catch {}
        throw new Error(msg);
      }

      onCreated();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !submitting && onClose()}
            aria-hidden="true"
          />

          <motion.div
            className="relative z-10 my-8 w-full max-w-3xl overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Add New Student"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 sm:px-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">
                  Add New Student
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Create a new enrollment record
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={onSubmit} className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">
              {/* Photo Upload */}
              <section className="mb-6 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex justify-center sm:justify-start">
                  <PhotoPreview preview={photoPreview} />
                </div>
                <label className="grid gap-2 text-sm">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Student Photo (2x2)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--primary)] file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--primary-contrast)]"
                  />
                  <p className="text-xs text-[var(--muted)]">
                    Photo will be uploaded to Cloudinary. A clear passport-style photo is recommended.
                  </p>
                  {photoFile ? (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]">
                      <ImageOff className="h-3 w-3" />
                      {photoFile.name}
                    </span>
                  ) : null}
                </label>
              </section>

              {/* Personal Information */}
              <FormSection title="Personal Information">
                <Field label="Last Name" error={errors.lastName?.message} register={register("lastName")} />
                <Field label="First Name" error={errors.firstName?.message} register={register("firstName")} />
                <Field label="Middle Name" error={errors.middleName?.message} register={register("middleName")} />
                <SelectField label="Sex" error={errors.sex?.message} register={register("sex")} options={["Male", "Female"]} />
                <Field label="Birthday" type="date" error={errors.birthday?.message} register={register("birthday")} />
                <Field label="Birth Place" error={errors.birthPlace?.message} register={register("birthPlace")} />
              </FormSection>

              {/* Address & Contact */}
              <FormSection title="Address & Contact">
                <Field label="Street" error={errors.street?.message} register={register("street")} />
                <Field label="Barangay" error={errors.barangay?.message} register={register("barangay")} />
                <Field label="City / Municipality" error={errors.cityMunicipality?.message} register={register("cityMunicipality")} />
                <Field label="Province" error={errors.province?.message} register={register("province")} />
                <Field label="Zip Code" error={errors.zipcode?.message} register={register("zipcode")} />
                <Field label="Email Address" type="email" error={errors.email?.message} register={register("email")} />
                <Field label="Contact Number" error={errors.contactNumber?.message} register={register("contactNumber")} />
              </FormSection>

              {/* School & Program */}
              <FormSection title="School & Program">
                <Field label="School Name" error={errors.schoolName?.message} register={register("schoolName")} />
                <Field label="School Address" error={errors.schoolAddress?.message} register={register("schoolAddress")} />
                <Field label="Year Graduated" error={errors.yearGraduated?.message} register={register("yearGraduated")} />
                <div className="sm:col-span-2 lg:col-span-1">
                  <SearchableSelect
                    label="Program / Course"
                    options={PROGRAM_COURSES}
                    register={register("programCourse")}
                    onValueChange={(value) =>
                      setValue("programCourse", value, { shouldValidate: true, shouldDirty: true })
                    }
                    error={errors.programCourse?.message}
                    placeholder="Search course..."
                  />
                </div>
              </FormSection>

              {/* Guardian Information */}
              <FormSection title="Guardian Information">
                <Field label="Full Name" error={errors.guardianFullName?.message} register={register("guardianFullName")} />
                <Field label="Address" error={errors.guardianAddress?.message} register={register("guardianAddress")} />
                <Field label="Contact Number" error={errors.guardianContactNumber?.message} register={register("guardianContactNumber")} />
              </FormSection>

              {/* Error */}
              {submitError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              ) : null}
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="focus-ring inline-flex h-10 items-center rounded-full border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:opacity-80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-95 disabled:opacity-80"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Add Student
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PhotoPreview({ preview }: { preview?: string }) {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--border)] bg-slate-100 shadow-sm">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Photo preview" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-500">
          <UserRound className="h-8 w-8" />
          <span className="px-2 text-[0.6rem] font-medium uppercase tracking-[0.1em]">No Photo</span>
        </div>
      )}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h4 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
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
    <label className="grid gap-1 text-sm">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </span>
      <input
        type={type}
        className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
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
    <label className="grid gap-1 text-sm">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </span>
      <select
        className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        {...register}
      >
        <option value="">Select…</option>
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
