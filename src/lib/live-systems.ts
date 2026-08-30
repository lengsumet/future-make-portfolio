import type { LiveSystem } from "@/components/product/LiveStats";

/**
 * Which running system a product reads its live figures from.
 *
 * Keyed on the product slug — the one identifier the catalogue already
 * guarantees is stable and unique.
 *
 * The shop detail page used to decide this by searching `demoUrl` for a port
 * number (`demoUrl.includes("3001")`). Those URLs are `https://future-make-wms.vercel.app`
 * and carry no port at all, so the check was false for every product and the
 * live figures never rendered once — and even had it matched, only ports
 * 3001-3004 were handled, leaving IMS, SCMS, PMS and Dashboard out.
 */
export const LIVE_SYSTEM: Record<string, LiveSystem> = {
  "enterprise-wms": "wms",
  "pos-system": "pos",
  "enterprise-crm": "crm",
  "enterprise-tms": "tms",
  "enterprise-ims": "ims",
  "enterprise-scms": "scms",
  "enterprise-pms": "pms",
  "enterprise-dashboard": "dashboard",
  "ecommerce-suite": "ecommerce",
  // portfolio-template is this site itself and has no stats endpoint to read.
};

export function liveSystemFor(slug?: string): LiveSystem | undefined {
  return slug ? LIVE_SYSTEM[slug] : undefined;
}
