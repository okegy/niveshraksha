import { defineConfig } from "@playwright/test";

// E2E config (run: npm run test:e2e from frontend/).
// The master-prompt path workspace/niveshraksha/tests/e2e is a junction to
// frontend/e2e so Node module resolution works while the layout stays intact.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
