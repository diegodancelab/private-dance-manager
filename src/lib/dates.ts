const TZ = "Europe/Zurich";

/**
 * Parse a datetime-local string (YYYY-MM-DDTHH:mm) entered in Zurich time
 * and return the equivalent UTC Date for database storage.
 */
export function zurichLocalToUtc(localStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(localStr.trim());
  if (!match) throw new Error(`Invalid datetime-local value: "${localStr}"`);
  const [, yr, mo, dy, hr, mn] = match.map(Number);

  // Treat the input as UTC to get an approximate timestamp, then correct for offset.
  // Two-pass approach handles DST transitions correctly.
  const rough = new Date(Date.UTC(yr, mo - 1, dy, hr, mn));
  const offset1 = getZurichOffsetMs(rough);
  const adjusted = new Date(rough.getTime() - offset1);
  const offset2 = getZurichOffsetMs(adjusted);
  return new Date(rough.getTime() - offset2);
}

/**
 * Parse a date string (YYYY-MM-DD) as midnight in Zurich time
 * and return the equivalent UTC Date for database storage.
 */
export function zurichDateToUtc(dateStr: string): Date {
  return zurichLocalToUtc(`${dateStr.trim()}T00:00`);
}

/**
 * Convert a UTC Date to a datetime-local string (YYYY-MM-DDTHH:mm) in Zurich time.
 * Use as `defaultValue` for <input type="datetime-local" />.
 */
export function utcToZurichDatetimeLocal(date: Date): string {
  const p = getZurichParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const h = String(Number(p.hour) % 24).padStart(2, "0");
  return `${p.year}-${p.month}-${p.day}T${h}:${p.minute}`;
}

/**
 * Convert a UTC Date to a date string (YYYY-MM-DD) in Zurich time.
 * Use as `defaultValue` for <input type="date" />.
 */
export function utcToZurichDate(date: Date): string {
  const p = getZurichParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return `${p.year}-${p.month}-${p.day}`;
}

/**
 * Returns true if value matches YYYY-MM-DDTHH:mm and is a calendrically valid date/time.
 */
export function isValidDatetimeLocal(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const [, yr, mo, dy, hr, mn] = match.map(Number);
  if (mo < 1 || mo > 12) return false;
  if (hr > 23 || mn > 59) return false;
  const d = new Date(Date.UTC(yr, mo - 1, dy));
  return d.getUTCFullYear() === yr && d.getUTCMonth() + 1 === mo && d.getUTCDate() === dy;
}

/**
 * Returns true if value matches YYYY-MM-DD and is a calendrically valid date.
 */
export function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const [, yr, mo, dy] = match.map(Number);
  if (mo < 1 || mo > 12) return false;
  const d = new Date(Date.UTC(yr, mo - 1, dy));
  return d.getUTCFullYear() === yr && d.getUTCMonth() + 1 === mo && d.getUTCDate() === dy;
}

// --- Internal helpers ---

function getZurichParts(
  date: Date,
  options: Intl.DateTimeFormatOptions
): Record<string, string> {
  const fmt = new Intl.DateTimeFormat("en-CA", { ...options, timeZone: TZ });
  return Object.fromEntries(
    fmt.formatToParts(date).map(({ type, value }) => [type, value])
  );
}

function getZurichOffsetMs(date: Date): number {
  const p = getZurichParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const zurichMs = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) % 24,
    Number(p.minute)
  );
  const utcMs =
    date.getTime() - date.getMilliseconds() - date.getSeconds() * 1000;
  return zurichMs - utcMs;
}
