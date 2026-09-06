/**
 * Runtime environment variable validation.
 * Call validateEnv() once at app startup (e.g. in root layout or middleware).
 * In production, missing or default-value vars throw immediately so the deploy
 * fails loudly rather than running with insecure defaults.
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

export function validateEnv(): void {
  // Skip during `next build` — env vars aren't guaranteed at build time
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const isProd = process.env.NODE_ENV === "production";
  const errors: string[] = [];

  // Required in all environments
  const required: string[] = ["ADMIN_JWT_SECRET", "ADMIN_PASSWORD"];
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required env var: ${key}`);
    }
  }

  // DATABASE_URL is required only in production (dev uses SQLite file via .env.local)
  if (isProd && !process.env.DATABASE_URL) {
    errors.push("Missing required env var: DATABASE_URL");
  }

  // In production, forbid insecure default values
  if (isProd) {
    if (
      process.env.ADMIN_PASSWORD &&
      isInsecureDefault(process.env.ADMIN_PASSWORD)
    ) {
      errors.push(
        "ADMIN_PASSWORD is using an insecure default. Set a strong password before deploying."
      );
    }

    if (
      process.env.ADMIN_JWT_SECRET &&
      (isInsecureDefault(process.env.ADMIN_JWT_SECRET) ||
        process.env.ADMIN_JWT_SECRET.length < 32)
    ) {
      errors.push(
        "ADMIN_JWT_SECRET must be at least 32 characters and not a known default value."
      );
    }
  }

  if (errors.length > 0) {
    const message = ["[env] Configuration errors:", ...errors.map((e) => `  • ${e}`)].join("\n");
    if (isProd) {
      throw new Error(message);
    } else {
      // Warn loudly in dev, but don't crash so local dev still works
      console.warn(message);
    }
  }
}

type RequiredSecret = "ADMIN_JWT_SECRET" | "ADMIN_PASSWORD";

/**
 * Read a required secret, throwing at first use when it is unset. There is
 * deliberately no fallback: a known default would let anyone forge an admin
 * token. Edge-safe (no Node-only imports) so proxy.ts can use it too.
 */
export function requireSecret(key: RequiredSecret): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[env] Missing required env var: ${key}. Set it in .env.local before starting the app.`
    );
  }
  return value;
}
