import { createHmac, timingSafeEqual } from "node:crypto";
import { SignJWT, errors, jwtVerify } from "jose";
import { requireSecret } from "@/lib/env";

/** Admin sessions last a day; the cookie is given the same lifetime. */
export const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 24;

const getSecret = () => new TextEncoder().encode(requireSecret("ADMIN_JWT_SECRET"));

/**
 * A password keyed with the JWT secret. The one primitive behind both the
 * login comparison and the `pv` claim. node:crypto is fine in the proxy too:
 * Next.js 16 runs proxy on the Node.js runtime.
 */
function passwordMac(password: string): Buffer {
  return createHmac("sha256", requireSecret("ADMIN_JWT_SECRET")).update(password).digest();
}

/**
 * Does a login attempt match ADMIN_PASSWORD? Compares MACs rather than the
 * strings: both are 32 bytes whatever was typed, so timingSafeEqual never sees
 * a length mismatch and response time reveals nothing about the password.
 */
export function checkAdminPassword(input: string): boolean {
  return timingSafeEqual(passwordMac(input), passwordMac(requireSecret("ADMIN_PASSWORD")));
}

/**
 * A fingerprint of the current admin password, carried in every token as `pv`.
 * Changing ADMIN_PASSWORD changes it, so every token issued before the change
 * stops verifying — the one way to revoke a stolen session. Keyed, not a bare
 * hash: the claim is readable by anyone holding the token, and an unkeyed
 * hash of the password could be brute-forced offline.
 */
function passwordVersion(): string {
  return passwordMac(requireSecret("ADMIN_PASSWORD")).toString("hex").slice(0, 32);
}

export async function signAdminToken(): Promise<string> {
  return await new SignJWT({ role: "admin", pv: passwordVersion() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_TOKEN_TTL_SECONDS}s`)
    .sign(getSecret());
}

/** The only admin token check; the proxy and the API guard both call it. */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload.role === "admin" && payload.pv === passwordVersion();
  } catch (error) {
    // A bad or expired token is routine. Anything else — a missing or weak
    // secret — still denies, but must not be silent.
    if (!(error instanceof errors.JOSEError)) {
      console.error("[auth] admin token check failed:", error instanceof Error ? error.message : error);
    }
    return false;
  }
}
