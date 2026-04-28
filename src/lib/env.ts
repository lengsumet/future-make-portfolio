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
  const isProd = process.env.NODE_ENV === "production";
  const errors: string[] = [];

  // Required in all environments
  const required: string[] = ["DATABASE_URL", "ADMIN_JWT_SECRET", "ADMIN_PASSWORD"];
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required env var: ${key}`);
    }
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
