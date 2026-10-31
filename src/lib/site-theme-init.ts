// Kept apart from site-theme.ts: the root layout is a Server Component and
// cannot import a module that uses React hooks.

export const THEME_STORAGE_KEY = "site-theme";

/** Inlined in <head> so a saved theme applies before first paint; must stay tiny and must not throw. */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="naga")document.documentElement.dataset.theme="naga"}catch(e){}`;
