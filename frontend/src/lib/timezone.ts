const JAKARTA_TIME_ZONE = "Asia/Jakarta";
const JAKARTA_UTC_OFFSET_HOURS = 7;

const INVALID_DATE_FALLBACK = "-";

export const toSafeDate = (value: Date | string | number | null | undefined) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const hasExplicitTimeZone = (value: string) => /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);

const parseTimeParts = (timeValue: string) => {
  const [hourPart = "0", minutePart = "0", secondPart = "0"] = timeValue.trim().split(":");

  return {
    hour: Number(hourPart) || 0,
    minute: Number(minutePart) || 0,
    second: Number(secondPart) || 0,
  };
};

const createJakartaDateTime = (dateValue: string, timeValue = "00:00") => {
  const [yearPart = "1970", monthPart = "1", dayPart = "1"] = dateValue.trim().split("-");
  const { hour, minute, second } = parseTimeParts(timeValue);

  return new Date(
    Date.UTC(
      Number(yearPart) || 1970,
      (Number(monthPart) || 1) - 1,
      Number(dayPart) || 1,
      hour - JAKARTA_UTC_OFFSET_HOURS,
      minute,
      second,
    ),
  );
};

export const parseJakartaDateTime = (
  value: Date | string | number | null | undefined,
  timeValue?: string | null,
) => {
  if (value instanceof Date || typeof value === "number") {
    return toSafeDate(value);
  }

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const trimmed = value.trim();

  if (hasExplicitTimeZone(trimmed)) {
    return toSafeDate(trimmed);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return createJakartaDateTime(trimmed, timeValue || "00:00");
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const [datePart = "1970-01-01", timePart = "00:00"] = trimmed.split("T");
    return createJakartaDateTime(datePart, timeValue || timePart);
  }

  return toSafeDate(trimmed);
};

const getDateParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: partMap.year || "1970",
    month: partMap.month || "01",
    day: partMap.day || "01",
  };
};

export const getJakartaDateInputValue = (date: Date = new Date()) => {
  const parts = getDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const formatJakartaDateTime = (value: Date | string | number) => {
  const date = toSafeDate(value);

  if (!date) {
    return INVALID_DATE_FALLBACK;
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export const formatJakartaDate = (value: Date | string | number) => {
  const date = toSafeDate(value);

  if (!date) {
    return INVALID_DATE_FALLBACK;
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatJakartaTime = (value: Date | string | number) => {
  const date = toSafeDate(value);

  if (!date) {
    return INVALID_DATE_FALLBACK;
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};