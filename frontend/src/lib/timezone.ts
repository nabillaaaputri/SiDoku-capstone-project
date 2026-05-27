const JAKARTA_TIME_ZONE = "Asia/Jakarta";

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