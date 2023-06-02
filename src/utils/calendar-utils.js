const now = new Date();
export const CALENDAR_START_YEAR = 2000;
export const MIN_DATE = new Date(CALENDAR_START_YEAR, 0, 1);
export const MAX_DATE = new Date(now.getFullYear(), 11, 31);

export const pad = (int) => String(int).padStart(2, '0');

// accepts zero-indexed month number (0=January), returns 0-th day of next month
export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// accepts zero-indexed month number (0=January)
export const dayOfWeek = (year, month, day) => new Date(year, month, day).getDay();
