/**
 * Centralized Date & Time helpers for Prime Rides
 * Provides consistent DateTime parsing, validation, and friendly Indian formatting (IST).
 */

export type ParsedSearchContext = {
  hasSearchContext: boolean;
  location?: string;
  returnLocation?: string;
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string;   // YYYY-MM-DD
  endTime?: string;   // HH:mm
  startDateTime?: Date;
  endDateTime?: Date;
  startFormatted?: string; // e.g. "05 Oct 2026 • 10:00 AM"
  endFormatted?: string;   // e.g. "08 Oct 2026 • 06:00 PM"
  isValid: boolean;
  validationError?: string;
};

/**
 * Normalizes input date and time strings.
 * Handles both separated params (startDate=2026-10-05, startTime=10:00)
 * and combined ISO strings (startDate=2026-10-05T10:00).
 */
export function extractDateAndTimeString(
  dateInput?: string | null,
  timeInput?: string | null,
  defaultTime: string = "10:00"
): { dateStr: string; timeStr: string } | null {
  if (!dateInput || typeof dateInput !== "string") return null;
  const trimmedDate = dateInput.trim();
  if (!trimmedDate) return null;

  if (trimmedDate.includes("T")) {
    const [d, t] = trimmedDate.split("T");
    const explicitTime = timeInput && typeof timeInput === "string" ? timeInput.trim().slice(0, 5) : "";
    const extractedTime = t ? t.slice(0, 5) : defaultTime;
    return {
      dateStr: d,
      timeStr: explicitTime || extractedTime || defaultTime,
    };
  }

  const explicitTime = timeInput && typeof timeInput === "string" ? timeInput.trim().slice(0, 5) : "";
  return {
    dateStr: trimmedDate,
    timeStr: explicitTime || defaultTime,
  };
}

/**
 * Builds a local Date object given YYYY-MM-DD and HH:mm.
 */
export function buildDateTime(dateStr: string, timeStr: string = "10:00"): Date | null {
  if (!dateStr) return null;
  const dateParts = dateStr.split("-").map(Number);
  if (dateParts.length !== 3 || dateParts.some(isNaN)) return null;

  const [year, month, day] = dateParts;
  let hours = 10;
  let minutes = 0;

  if (timeStr) {
    const timeParts = timeStr.split(":").map(Number);
    if (timeParts.length >= 2 && !isNaN(timeParts[0]) && !isNaN(timeParts[1])) {
      hours = timeParts[0];
      minutes = timeParts[1];
    }
  }

  const dt = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

/**
 * Formats a Date or date string into friendly local Indian format:
 * e.g., "05 Oct 2026 • 10:00 AM"
 */
export function formatFriendlyDateTime(input?: Date | string | null): string {
  if (!input) return "";
  let dt: Date;
  if (typeof input === "string") {
    if (input.includes("T") || input.includes("-")) {
      const extracted = extractDateAndTimeString(input);
      if (extracted) {
        const built = buildDateTime(extracted.dateStr, extracted.timeStr);
        if (built) dt = built;
        else dt = new Date(input);
      } else {
        dt = new Date(input);
      }
    } else {
      dt = new Date(input);
    }
  } else {
    dt = input;
  }

  if (isNaN(dt.getTime())) return "";

  const day = String(dt.getDate()).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[dt.getMonth()];
  const year = dt.getFullYear();

  let hours = dt.getHours();
  const minutes = String(dt.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = String(hours).padStart(2, "0");

  return `${day} ${month} ${year} • ${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Formats date part only (e.g., "05 Oct 2026").
 */
export function formatFriendlyDateOnly(input?: Date | string | null): string {
  if (!input) return "";
  const dt = typeof input === "string" ? new Date(input) : input;
  if (isNaN(dt.getTime())) return "";

  const day = String(dt.getDate()).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[dt.getMonth()];
  const year = dt.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Formats time part only (e.g., "10:00 AM").
 */
export function formatFriendlyTimeOnly(input?: Date | string | null): string {
  if (!input) return "";
  const dt = typeof input === "string" ? new Date(input) : input;
  if (isNaN(dt.getTime())) return "";

  let hours = dt.getHours();
  const minutes = String(dt.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");

  return `${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Parses URL query parameters into a validated SearchContext.
 */
export function parseSearchContext(params: {
  location?: string | string[];
  pickupLocation?: string | string[];
  returnLocation?: string | string[];
  startDate?: string | string[];
  startTime?: string | string[];
  endDate?: string | string[];
  endTime?: string | string[];
}): ParsedSearchContext {
  const getSingle = (val?: string | string[]) =>
    Array.isArray(val) ? val[0] : typeof val === "string" ? val.trim() : undefined;

  const locParam = getSingle(params.location) || getSingle(params.pickupLocation);
  const retLocParam = getSingle(params.returnLocation) || locParam;
  const startDateParam = getSingle(params.startDate);
  const startTimeParam = getSingle(params.startTime);
  const endDateParam = getSingle(params.endDate);
  const endTimeParam = getSingle(params.endTime);

  if (!startDateParam && !endDateParam && !locParam) {
    return {
      hasSearchContext: false,
      isValid: true,
    };
  }

  const startExtracted = extractDateAndTimeString(startDateParam, startTimeParam, "10:00");
  const endExtracted = extractDateAndTimeString(endDateParam, endTimeParam, "18:00");

  if (!startExtracted || !endExtracted) {
    return {
      hasSearchContext: Boolean(locParam || startDateParam || endDateParam),
      location: locParam,
      returnLocation: retLocParam,
      isValid: false,
      validationError: "Both pickup date and return date are required.",
    };
  }

  const startDateTime = buildDateTime(startExtracted.dateStr, startExtracted.timeStr);
  const endDateTime = buildDateTime(endExtracted.dateStr, endExtracted.timeStr);

  if (!startDateTime || !endDateTime || isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    return {
      hasSearchContext: true,
      location: locParam,
      returnLocation: retLocParam,
      startDate: startExtracted.dateStr,
      startTime: startExtracted.timeStr,
      endDate: endExtracted.dateStr,
      endTime: endExtracted.timeStr,
      isValid: false,
      validationError: "Please provide valid pickup and return dates/times.",
    };
  }

  if (endDateTime.getTime() <= startDateTime.getTime()) {
    return {
      hasSearchContext: true,
      location: locParam,
      returnLocation: retLocParam,
      startDate: startExtracted.dateStr,
      startTime: startExtracted.timeStr,
      endDate: endExtracted.dateStr,
      endTime: endExtracted.timeStr,
      startDateTime,
      endDateTime,
      startFormatted: formatFriendlyDateTime(startDateTime),
      endFormatted: formatFriendlyDateTime(endDateTime),
      isValid: false,
      validationError: "Return date and time must be after pickup date and time.",
    };
  }

  return {
    hasSearchContext: true,
    location: locParam,
    returnLocation: retLocParam,
    startDate: startExtracted.dateStr,
    startTime: startExtracted.timeStr,
    endDate: endExtracted.dateStr,
    endTime: endExtracted.timeStr,
    startDateTime,
    endDateTime,
    startFormatted: formatFriendlyDateTime(startDateTime),
    endFormatted: formatFriendlyDateTime(endDateTime),
    isValid: true,
  };
}

/**
 * Converts a SearchContext to URL search params string.
 */
export function buildSearchQuery(params: {
  location?: string;
  returnLocation?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  [key: string]: string | number | boolean | undefined;
}): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      sp.set(key, String(val));
    }
  });
  return sp.toString();
}
