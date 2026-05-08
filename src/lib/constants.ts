/**
 * Application-wide constants.
 * Pricing data lives in PRICING_DATA.md and src/lib/audit/pricing.ts (Commit 4).
 */

export const APP_NAME = "AI Spend Audit";
export const APP_TAGLINE = "Find where you're overpaying on AI tools";
export const CREDEX_URL = "https://credex.rocks";

/** Savings threshold above which the Credex consultation CTA is shown prominently */
export const HIGH_SAVINGS_THRESHOLD_MONTHLY = 500; // USD

/** Savings threshold below which the "you're spending well" message is shown */
export const LOW_SAVINGS_THRESHOLD_MONTHLY = 100; // USD

/** localStorage key for persisting form state across page reloads */
export const FORM_STORAGE_KEY = "credex_audit_form_v1";
