export const LABELS: Record<string, string> = {
  // PackageStatus
  ACTIVE: "Active",
  EXHAUSTED: "Exhausted",
  EXPIRED: "Expired",
  // ChargeStatus
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  // BookingStatus
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  // PaymentStatus
  REFUNDED: "Refunded",
  // Shared (PENDING, CANCELED appear in multiple enums)
  PENDING: "Pending",
  CANCELED: "Canceled",
  // LessonType
  PRIVATE: "Private",
  DUO: "Duo",
  GROUP: "Group",
  ONLINE: "Online",
  // PaymentMethod
  CASH: "Cash",
  TWINT: "Twint",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  // ChargeType
  LESSON: "Lesson",
  PACKAGE: "Package",
  ADJUSTMENT: "Adjustment",
  OTHER: "Other",
};

export type BadgeVariant =
  | "green"
  | "amber"
  | "blue"
  | "gray"
  | "red"
  | "purple";

export const BADGE_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: "green",
  CONFIRMED: "green",
  COMPLETED: "green",
  PAID: "green",
  PENDING: "amber",
  PARTIALLY_PAID: "blue",
  EXHAUSTED: "gray",
  CANCELED: "gray",
  EXPIRED: "red",
  REFUNDED: "purple",
};

export function getLabel(value: string): string {
  return LABELS[value] ?? value;
}

export function getBadgeVariant(value: string): BadgeVariant {
  return BADGE_VARIANTS[value] ?? "gray";
}
