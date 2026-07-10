import { z } from "zod";

/**
 * Zod schema for admin enrollment updates (PATCH).
 * All fields are optional — the admin may patch a subset of fields.
 * Includes personal info, status, and financial fields.
 */
export const adminUpdateSchema = z.object({
  lastName: z.string().min(2).optional(),
  firstName: z.string().min(2).optional(),
  middleName: z.string().min(1).optional(),
  sex: z.enum(["Male", "Female"]).optional(),
  birthday: z.string().min(1).optional(),
  birthPlace: z.string().min(2).optional(),
  street: z.string().min(2).optional(),
  barangay: z.string().min(2).optional(),
  cityMunicipality: z.string().min(2).optional(),
  province: z.string().min(2).optional(),
  zipcode: z.string().min(3).optional(),
  email: z.string().email().optional(),
  contactNumber: z.string().min(7).optional(),
  schoolName: z.string().min(2).optional(),
  schoolAddress: z.string().min(2).optional(),
  yearGraduated: z.string().min(4).optional(),
  programCourse: z.string().min(2).optional(),
  guardianFullName: z.string().min(2).optional(),
  guardianAddress: z.string().min(2).optional(),
  guardianContactNumber: z.string().min(7).optional(),
  status: z.enum(["PENDING", "REVIEWING", "APPROVED", "REJECTED"]).optional(),
  tuitionFee: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
});

export type AdminUpdateValues = z.infer<typeof adminUpdateSchema>;
