/**
 * Application-wide constants for SpendLens.
 */

export const APP_NAME = "SpendLens";
export const APP_TAGLINE = "Find where you're overpaying on AI tools";
export const APP_URL = "https://spendlens.app";
export const GITHUB_URL = "https://github.com/Dipro-cyber/credex_assignment";

/** Savings threshold above which the premium CTA is shown prominently */
export const HIGH_SAVINGS_THRESHOLD_MONTHLY = 500; // USD

/** Savings threshold below which the "you're spending well" message is shown */
export const LOW_SAVINGS_THRESHOLD_MONTHLY = 100; // USD

/** localStorage key for persisting form state across page reloads */
export const FORM_STORAGE_KEY = "spendlens_audit_form_v1";
