/**
 * Admin secrets, read and checked at the point of use.
 *
 * There is deliberately no startup check: one ran as an import side effect of
 * the auth module, so a bad admin variable stopped every module that imported
 * it — the public checkout included — from loading. A bad secret now fails
 * only the request that needs it.
 */

const INSECURE_DEFAULTS = [
  "admin123",
  "dev-secret-please-change-in-production",
  "dev-secret-change-in-production-please",
  "change-me-to-a-long-random-string-32chars",
];

function isInsecureDefault(value: string): boolean {
  return INSECURE_DEFAULTS.includes(value.trim());
}

type RequiredSecret = "ADMIN_JWT_SECRET" | "ADMIN_PASSWORD";

/** Why a secret is unfit for production, or null. */
function productionProblem(key: RequiredSecret, value: string): string | null {
  if (key === "ADMIN_JWT_SECRET" && (isInsecureDefault(value) || value.length < 32)) {
    return "ADMIN_JWT_SECRET must be at least 32 characters and not a known default value.";
  }
  if (key === "ADMIN_PASSWORD" && isInsecureDefault(value)) {
    return "ADMIN_PASSWORD is using an insecure default. Set a strong password before deploying.";
  }
  return null;
}

/**
 * Read a required secret, throwing at first use when it is unset. There is
 * deliberately no fallback: a known default would let anyone forge an admin
 * token. In production a weak or known-default value throws too; every admin
 * path (proxy, API guard, login) reads its secrets through here, so a weak one
 * fails all of them closed rather than only the login route.
 */
export function requireSecret(key: RequiredSecret): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[env] Missing required env var: ${key}. Set it in .env.local before starting the app.`
    );
  }
  if (process.env.NODE_ENV === "production") {
    const problem = productionProblem(key, value);
    if (problem) throw new Error(`[env] ${problem}`);
  }
  return value;
}
