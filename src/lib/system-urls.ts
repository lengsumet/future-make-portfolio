/**
 * Where each sibling system lives.
 *
 * An explicit env var always wins. Without one the fallback follows the
 * environment rather than always pointing at a dev port: every one of these
 * read `http://localhost:PORT` unconditionally, and since none of the
 * NEXT_PUBLIC_* vars are set on the deployment, the built site asked a
 * visitor's own machine for the data. That is why the live stat panels sat on
 * "Connecting to..." forever and why Open Store sent people to localhost.
 *
 * These are public addresses of public sites, so naming them in code is not a
 * secret being committed — it is the deployment's actual topology, which the
 * product catalogue already lists in its demoUrl field.
 */
export function systemUrl(configured: string | undefined, slug: string, devPort: string): string {
  if (configured) return configured;
  return process.env.NODE_ENV === "production"
    ? `https://future-make-${slug}.vercel.app`
    : `http://localhost:${devPort}`;
}
