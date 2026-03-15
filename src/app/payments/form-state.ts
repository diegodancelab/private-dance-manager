import type {
  PaymentMethodValue,
  PaymentStatusValue,
} from "@/lib/payment-options";

export type PaymentFormState = {
  success: boolean;
  message?: string;
  fields: {
    id: string;
    userId: string;
    amount: string;
    currency: string;
    method: PaymentMethodValue | "";
    status: PaymentStatusValue;
    note: string;
    paidAt: string;
  };
  errors: {
    userId?: string;
    amount?: string;
    currency?: string;
    method?: string;
    status?: string;
    paidAt?: string;
    form?: string;
  };
};

export const initialPaymentFormState: PaymentFormState = {
  success: false,
  message: "",
  fields: {
    id: "",
    userId: "",
    amount: "",
    currency: "CHF",
    method: "",
    status: "COMPLETED",
    note: "",
    paidAt: "",
  },
  errors: {},
};