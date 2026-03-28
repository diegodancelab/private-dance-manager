/**
 * Domain errors — expected business rule violations.
 * These are NOT bugs. They represent invalid operations the user should be informed about.
 * Examples: expired package, double assignment, insufficient balance.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export function isDomainError(err: unknown): err is DomainError {
  return err instanceof DomainError;
}

/**
 * Detects Next.js internal throws from redirect() and notFound().
 * These must always be re-thrown — they are control flow, not errors.
 */
function isNextInternalThrow(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    ((err as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
      (err as { digest: string }).digest.startsWith("NEXT_NOT_FOUND"))
  );
}

type BaseFormState = {
  success: boolean;
  errors: Record<string, string | undefined>;
};

/**
 * Wraps a form action to catch unhandled errors and return them as form state.
 *
 * - DomainError → returned as errors.form (expected business failure)
 * - Unexpected error → logged server-side + returned as generic errors.form message
 * - Next.js redirect/notFound → re-thrown (must not be swallowed)
 */
export function withFormAction<TState extends BaseFormState>(
  action: (state: TState, formData: FormData) => Promise<TState>
): (state: TState, formData: FormData) => Promise<TState> {
  return async (state: TState, formData: FormData): Promise<TState> => {
    try {
      return await action(state, formData);
    } catch (err) {
      if (isNextInternalThrow(err)) throw err;

      if (isDomainError(err)) {
        return {
          ...state,
          success: false,
          errors: { form: err.message },
        };
      }

      console.error("[Action Error]", err);
      return {
        ...state,
        success: false,
        errors: { form: "An unexpected error occurred. Please try again." },
      };
    }
  };
}

/**
 * Error handler for non-form actions (used as action={fn} on forms).
 * These cannot return state to the client, so errors are always thrown.
 *
 * - DomainError → re-thrown as-is (user-friendly message surfaces in error boundary)
 * - Unexpected error → logged server-side + throws a safe generic message
 * - Next.js internal throws → re-thrown
 */
export function handleNonFormActionError(
  context: string,
  err: unknown
): never {
  if (isNextInternalThrow(err)) throw err as Error;
  if (isDomainError(err)) throw err;
  console.error(`[${context}]`, err);
  throw new Error("An unexpected error occurred. Please try again.");
}
