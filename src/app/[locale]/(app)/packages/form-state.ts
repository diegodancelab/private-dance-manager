export type PackageFormState = {
  success: boolean;
  message: string;
  fields: {
    id: string;
    userId: string;
    name: string;
    totalHours: string;
    amount: string;
    currency: string;
    expiresAt: string;
  };
  errors: {
    userId?: string;
    name?: string;
    totalHours?: string;
    amount?: string;
    currency?: string;
    expiresAt?: string;
    form?: string;
  };
};

export const initialPackageFormState: PackageFormState = {
  success: false,
  message: "",
  fields: {
    id: "",
    userId: "",
    name: "",
    totalHours: "",
    amount: "",
    currency: "CHF",
    expiresAt: "",
  },
  errors: {},
};
