import type {
  ChargeStatusValue,
  ChargeTypeValue,
} from "@/lib/charge-options";

export type ChargeFormState = {
  success: boolean;
  message?: string;
  fields: {
    id: string;
    userId: string;
    lessonId: string;
    type: ChargeTypeValue;
    title: string;
    description: string;
    amount: string;
    currency: string;
    status: ChargeStatusValue;
    dueAt: string;
  };
  errors: {
    userId?: string;
    lessonId?: string;
    type?: string;
    title?: string;
    amount?: string;
    currency?: string;
    status?: string;
    dueAt?: string;
    form?: string;
  };
};

export const initialChargeFormState: ChargeFormState = {
  success: false,
  message: "",
  fields: {
    id: "",
    userId: "",
    lessonId: "",
    type: "LESSON",
    title: "",
    description: "",
    amount: "",
    currency: "CHF",
    status: "PENDING",
    dueAt: "",
  },
  errors: {},
};