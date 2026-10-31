import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY as STORAGE_KEY } from "./site-theme-init";

/**
 * The site's colour theme. "naga" is unlocked from the About portrait and
 * recolours every page through the tokens in globals.css. The source of truth
 * is the data-theme attribute on <html>, which THEME_INIT_SCRIPT sets before
 * first paint so a returning visitor never sees the caramel flash first.
 */
export type SiteTheme = "caramel" | "naga";

const SWITCH_MS = 900;

const listeners = new Set<() => void>();
let switchTimer: ReturnType<typeof setTimeout> | undefined;

function read(): SiteTheme {
  return document.documentElement.dataset.theme === "naga" ? "naga" : "caramel";
}

/** Switch theme; the colours cross-fade for one switch (.theme-switching). */
export function setSiteTheme(theme: SiteTheme): void {
  const html = document.documentElement;
  html.classList.add("theme-switching");
  clearTimeout(switchTimer);
  switchTimer = setTimeout(() => html.classList.remove("theme-switching"), SWITCH_MS);

  if (theme === "naga") html.dataset.theme = "naga";
  else delete html.dataset.theme;

  try {
    if (theme === "naga") localStorage.setItem(STORAGE_KEY, "naga");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or storage disabled: the theme still applies for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSiteTheme(): SiteTheme {
  return useSyncExternalStore(subscribe, read, () => "caramel");
}
