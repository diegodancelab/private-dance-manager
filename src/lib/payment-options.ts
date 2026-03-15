export const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "TWINT", label: "Twint" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CARD", label: "Card" },
  { value: "OTHER", label: "Other" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELED", label: "Canceled" },
  { value: "REFUNDED", label: "Refunded" },
] as const;

export type PaymentMethodValue =
  (typeof PAYMENT_METHOD_OPTIONS)[number]["value"];

export type PaymentStatusValue =
  (typeof PAYMENT_STATUS_OPTIONS)[number]["value"];