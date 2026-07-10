/** Default tuition when none is assigned to an enrollment. */
export const DEFAULT_TUITION = 15000;

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "GCASH"
  | "MAYA"
  | "CHECK"
  | "OTHER";

export type BalanceStatus = "PAID" | "PARTIAL" | "UNPAID" | "NO_TUITION";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "GCASH", label: "GCash" },
  { value: "MAYA", label: "Maya" },
  { value: "CHECK", label: "Check" },
  { value: "OTHER", label: "Other" },
];

export const balanceStatusMeta: Record<
  BalanceStatus,
  { label: string; className: string }
> = {
  PAID: {
    label: "Fully Paid",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  PARTIAL: {
    label: "Partial",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  },
  UNPAID: {
    label: "Unpaid",
    className:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
  },
  NO_TUITION: {
    label: "No Tuition Set",
    className:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300",
  },
};

export function resolveTuition(tuitionFee: string | number | null | undefined) {
  if (tuitionFee === null || tuitionFee === undefined || tuitionFee === "") {
    return DEFAULT_TUITION;
  }
  return Number(tuitionFee);
}

export function resolvePaid(amountPaid: string | number | null | undefined) {
  if (amountPaid === null || amountPaid === undefined || amountPaid === "") {
    return 0;
  }
  return Number(amountPaid);
}

export function getBalance(
  tuitionFee: string | number | null | undefined,
  amountPaid: string | number | null | undefined,
) {
  const tuition = resolveTuition(tuitionFee);
  const paid = resolvePaid(amountPaid);
  return Math.max(tuition - paid, 0);
}

export function getBalanceStatus(
  tuitionFee: string | number | null | undefined,
  amountPaid: string | number | null | undefined,
  hasExplicitTuition = true,
): BalanceStatus {
  if (!hasExplicitTuition && (tuitionFee === null || tuitionFee === undefined)) {
    return "NO_TUITION";
  }

  const tuition = resolveTuition(tuitionFee);
  const paid = resolvePaid(amountPaid);
  const balance = Math.max(tuition - paid, 0);

  if (balance <= 0 && paid > 0) return "PAID";
  if (paid > 0 && balance > 0) return "PARTIAL";
  return "UNPAID";
}

export function paymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}
