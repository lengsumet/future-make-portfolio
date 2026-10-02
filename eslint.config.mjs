import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Compiler advisories new in Next 16. Every current hit is the
    // after-mount read of browser-only state (localStorage, clock, viewport)
    // that keeps server and client HTML identical — kept visible as warnings
    // rather than rewritten wholesale.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  globalIgnores(["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
