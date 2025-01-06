export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  nitro: {
    routeRules: {
      '/server/api/**': { cors: true },
    },
  },

  modules: [
    "@nuxt/ui",
    ["nuxt-file-storage", {
      serverDir: "./uploads"
    }]
  ],

  runtimeConfig: {
    public: {
      wsUrl: 'ws://localhost:3001',
    },
  },

  app: {
    head: {
      title: 'WBJLCA'
    }
  }
})