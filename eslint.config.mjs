import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**", ".claude/**", ".design-backups/**", ".tools/**",
    "out/**", "next-env.d.ts", "test-results/**", "playwright-report/**",
    "public/vendor/**", "graphify-out/**", "UsersomardAppDataLocalTemp/**",
    // Independent projects have their own source checks and generated bundles.
    "svg-studio/**", "arabic-font-preview/**",
    // Video review tooling is outside this portfolio's runtime.
    ".video-review-tools/**", "video-review-tools/**",
  ]),
]);
