/**
 * Stripe and checkout URLs — read from environment (sandbox: sk_test_*, whsec_*).
 */
/** Next.js origin. Must differ from the API origin locally (e.g. API :3000, Next :3001) or Stripe will hit Nest and 404. */
export function getStripeFrontendBaseUrl(): string {
  const raw = process.env.FRONTEND_URL ?? 'http://localhost:3001';
  return raw.replace(/\/$/, '');
}

export function getStripeCurrency(): string {
  return (process.env.STRIPE_CURRENCY ?? 'usd').toLowerCase();
}

export function getStripeWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET ?? '';
}

export function getStripeSecretKey(): string {
  return process.env.STRIPE_SECRET_KEY ?? '';
}
