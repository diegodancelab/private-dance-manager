export type StudentFormState = {
  success: boolean;
  message?: string;
  fields: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    form?: string;
  };
};

export const initialStudentFormState: StudentFormState = {
  success: false,
  message: "",
  fields: {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  errors: {},
};