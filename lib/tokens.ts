import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';

/**
 * Generate a cryptographically secure token.
 * Using 32 bytes = 64 hex chars, effectively 256 bits of entropy.
 * This token is NEVER exposed in the frontend — only sent via server-to-server email links.
 */
export function generateApprovalToken(): string {
  return randomBytes(32).toString('hex');
}

export function getTokenExpiry(hoursFromNow = 48): Date {
  return addHours(new Date(), hoursFromNow);
}

export function isTokenExpired(expiry: string | Date): boolean {
  return new Date() > new Date(expiry);
}
