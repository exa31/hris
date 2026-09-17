import Aura from "@primevue/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: {
    enabled: true,
  },
  ssr: false,
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "motion-v/nuxt",
    "@primevue/nuxt-module",
    "@nuxtjs/color-mode",
  ],
  css: [
    "bootstrap-icons/font/bootstrap-icons.css",
    "./app/assets/css/primevue-dark.css",
  ],
  primevue: {
    usePrimeVue: true,
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: ".dark",
        },
      },
      ripple: true,
    },
  },
  app: {
    head: {
      title: "NexusHR - Next-Gen Human Resource Intelligence",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "NexusHR is a premium, next-gen Human Resource Intelligence platform for modern teams.",
        },
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },

  // ========== RUNTIME CONFIG ==========
  runtimeConfig: {
    mode: process.env.NUXT_MODE || "production",
    jwtSecret: process.env.NUXT_JWT_SECRET,
    automationSecret:
      process.env.NUXT_AUTOMATION_SECRET ||
      process.env.AUTOMATION_SECRET ||
      process.env.NUXT_JWT_SECRET ||
      "nexus-hris-automation-secret-2026",
    clientUrl: process.env.NUXT_CLIENT_URL || "https://eka-dev.cloud",

    pgHost: process.env.NUXT_PG_HOST || "localhost",
    pgPort: process.env.NUXT_PG_PORT ? Number(process.env.NUXT_PG_PORT) : 5432,
    pgUser: process.env.NUXT_PG_USER || "postgres",
    pgPassword: process.env.NUXT_PG_PASSWORD || "password",
    pgDatabase: process.env.NUXT_PG_DATABASE || "mydatabase",
    pgMax: process.env.NUXT_PG_MAX ? Number(process.env.NUXT_PG_MAX) : 10,
    pgIdleTimeoutMs: process.env.NUXT_PG_IDLE_TIMEOUT_MS
      ? Number(process.env.NUXT_PG_IDLE_TIMEOUT_MS)
      : 30000,
    pgConnectionTimeoutMs: process.env.NUXT_PG_CONNECTION_TIMEOUT_MS
      ? Number(process.env.NUXT_PG_CONNECTION_TIMEOUT_MS)
      : 2000,
    pgSsl: process.env.NUXT_PG_SSL === "true",
    databaseUrl: process.env.NUXT_DATABASE_URL,

    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "https://eka-dev.cloud",
    },
  },
});
