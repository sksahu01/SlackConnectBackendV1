/**
 * Convert Unix timestamp to readable date string
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString();
};

/**
 * Convert Date to Unix timestamp
 */
export const dateToTimestamp = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

/**
 * Get current Unix timestamp
 */
export const getCurrentTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Check if a timestamp is in the future
 */
export const isInFuture = (timestamp: number): boolean => {
  return timestamp > getCurrentTimestamp();
};

/**
 * Check if a timestamp is in the past
 */
export const isInPast = (timestamp: number): boolean => {
  return timestamp < getCurrentTimestamp();
};

/**
 * Get time difference in minutes
 */
export const getMinutesDifference = (timestamp1: number, timestamp2: number): number => {
  return Math.abs(timestamp1 - timestamp2) / 60;
};

/**
 * Format duration in human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} minute(s)`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours < 24) {
    return `${hours} hour(s)${remainingMinutes > 0 ? ` ${remainingMinutes} minute(s)` : ''}`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return `${days} day(s)${remainingHours > 0 ? ` ${remainingHours} hour(s)` : ''}`;
};

/**
 * Validate that a scheduled time is reasonable (not too far in future)
 */
export const isValidScheduledTime = (timestamp: number, maxDaysInFuture: number = 365): boolean => {
  const now = getCurrentTimestamp();
  const maxTimestamp = now + (maxDaysInFuture * 24 * 60 * 60);

  return timestamp > now && timestamp <= maxTimestamp;
};
