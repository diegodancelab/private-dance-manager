export function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = Sunday, 1 = Monday
  const diff = day === 0 ? -6 : 1 - day; // semaine commence lundi

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);

  end.setDate(start.getDate() + 7);
  end.setHours(0, 0, 0, 0);

  return end;
}

export function getWeekDays(date: Date): Date[] {
  const start = getStartOfWeek(date);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatWeekLabel(date: Date): string {
  const start = getStartOfWeek(date);
  const end = addDays(start, 6);

  const formatter = new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function parseCalendarDate(dateParam?: string): Date {
  if (!dateParam) {
    return new Date();
  }

  const parsed = new Date(dateParam);

  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}