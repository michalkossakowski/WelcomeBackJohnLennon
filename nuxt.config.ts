// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  nitro: {
    routeRules: {
      '/server/api/**': { cors: true },
    },
  },

  modules: ["@nuxt/ui"]
})
