import { z } from "zod";

export const createPaymentSchema = z.object({
  enrollmentId: z.string().min(1, "Student is required."),
  amount: z.number().positive("Amount must be greater than zero."),
  method: z.enum(["CASH", "BANK_TRANSFER", "GCASH", "MAYA", "CHECK", "OTHER"]),
  reference: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
  paidAt: z.string().datetime().optional(),
});

export type CreatePaymentValues = z.infer<typeof createPaymentSchema>;
