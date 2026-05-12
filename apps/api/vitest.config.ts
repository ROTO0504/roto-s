import { cloudflareTest } from "@cloudflare/vitest-pool-workers"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.toml" },
      miniflare: {
        compatibilityDate: "2024-09-01",
        compatibilityFlags: ["nodejs_compat"],
      },
    }),
  ],
  test: {},
})
