export const CHARGE_TYPE_OPTIONS = [
  { value: "LESSON", label: "Lesson" },
  { value: "PACKAGE", label: "Package" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "OTHER", label: "Other" },
] as const;

export const CHARGE_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PARTIALLY_PAID", label: "Partially paid" },
  { value: "PAID", label: "Paid" },
  { value: "CANCELED", label: "Canceled" },
] as const;

export type ChargeTypeValue = (typeof CHARGE_TYPE_OPTIONS)[number]["value"];
export type ChargeStatusValue =
  (typeof CHARGE_STATUS_OPTIONS)[number]["value"];