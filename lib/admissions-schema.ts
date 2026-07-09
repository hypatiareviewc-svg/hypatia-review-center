import { z } from "zod";

export const admissionsSchema = z.object({
  photo: z.any().optional(),
  lastName: z.string().min(2, "Last name is required."),
  firstName: z.string().min(2, "First name is required."),
  middleName: z.string().min(1, "Middle name is required."),
  street: z.string().min(2, "Street is required."),
  barangay: z.string().min(2, "Barangay is required."),
  cityMunicipality: z.string().min(2, "City/Municipality is required."),
  province: z.string().min(2, "Province is required."),
  zipcode: z.string().min(3, "Zip code is required."),
  email: z.string().email("Enter a valid email address."),
  contactNumber: z.string().min(7, "Contact number is required."),
  schoolName: z.string().min(2, "School name is required."),
  schoolAddress: z.string().min(2, "School address is required."),
  yearGraduated: z.string().min(4, "Year graduated is required."),
  programCourse: z.string().min(2, "Program/Course is required."),
  guardianFullName: z.string().min(2, "Guardian name is required."),
  guardianAddress: z.string().min(2, "Guardian address is required."),
  guardianContactNumber: z.string().min(7, "Guardian contact number is required."),
});

export type AdmissionsFormValues = z.infer<typeof admissionsSchema>;
