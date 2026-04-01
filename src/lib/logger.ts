/**
 * Minimal structured logger for server-side use (Server Actions, Server Components).
 *
 * Outputs one JSON line per call — readable in Vercel's Functions log viewer and
 * parseable programmatically. Each line includes:
 *   - level:   "info" | "warn" | "error"
 *   - ts:      ISO 8601 timestamp
 *   - ctx:     caller context string (action name, module, etc.)
 *   - msg:     human-readable message
 *   - [extra]: any additional key-value data passed by the caller
 *
 * Example output:
 *   {"level":"error","ts":"2026-04-01T10:00:00.000Z","ctx":"createLesson","msg":"Unexpected error","error":"Cannot read properties of undefined"}
 *
 * NOTE: Do NOT use this in Client Components — it runs server-side only.
 */

type Level = "info" | "warn" | "error";
type LogData = Record<string, unknown>;

function log(level: Level, ctx: string, msg: string, data?: LogData): void {
  const entry: Record<string, unknown> = {
    level,
    ts: new Date().toISOString(),
    ctx,
    msg,
    ...data,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  /**
   * Normal operations: login success, record created, etc.
   * Appears in Vercel logs but does not trigger alerts.
   */
  info(ctx: string, msg: string, data?: LogData): void {
    log("info", ctx, msg, data);
  },

  /**
   * Expected business rule violations (DomainError).
   * Not a bug — but useful to track in production.
   * Example: "Package is not active", "Student not found".
   */
  warn(ctx: string, msg: string, data?: LogData): void {
    log("warn", ctx, msg, data);
  },

  /**
   * Unexpected errors — true bugs or infrastructure failures.
   * These should be investigated.
   */
  error(ctx: string, msg: string, data?: LogData): void {
    log("error", ctx, msg, data);
  },
};
