// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: [
    '~/style.css',
    'bootstrap/dist/css/bootstrap.min.css',
  ],
  app: {
    head: {
      htmlAttrs: {
        'data-bs-theme': 'dark',
      },
    },
  }
})
