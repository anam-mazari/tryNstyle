import { randomBytes } from 'crypto';

/** Human-readable order tracking id, e.g. TSY-20260403-A1B2C3 */
export function generateTrackingNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const suffix = randomBytes(4).toString('hex').toUpperCase();
  return `TSY-${y}${month}${day}-${suffix}`;
}
