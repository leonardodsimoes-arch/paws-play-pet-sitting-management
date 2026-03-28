import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO } from 'date-fns';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Timezone-resilient parser that ignores the trailing Z to treat date-times as local browser time.
 * This prevents common date shifting issues where a date like "2024-06-01T00:00:00Z" 
 * might be interpreted as May 31st in certain timezones.
 */
export function parseLocalISO(isoString: string | undefined | null): Date {
  if (!isoString) return new Date();
  // Remove the Z to force local interpretation of the ISO string
  const normalized = isoString.replace('Z', '');
  return parseISO(normalized);
}