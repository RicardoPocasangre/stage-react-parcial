import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages publica el proyecto en https://<usuario>.github.io/<repositorio>/
const base = process.env.VITE_BASE ?? '/stage-react-parcial/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // el usuario decide cuándo aplicar una actualización
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'STAGE · Venta de boletos',
        short_name: 'STAGE',
        description: 'Plataforma de venta y gestión de boletos para eventos.',
        lang: 'es',
        start_url: base,
        scope: base,
        id: base,
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#4338ca',
        background_color: '#f8fafc',
        categories: ['entertainment', 'shopping'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache del app shell: HTML, JS, CSS e íconos de la PWA.
        globPatterns: ['**/*.{js,css,html,webmanifest}', 'icons/*.png'],
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/\/api\//, /\/sw\.js$/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // API falsa: NetworkFirst, con la última respuesta como respaldo sin conexión.
            // Se usa una expresión regular (y no una función) porque Workbox la
            // serializa tal cual dentro de sw.js, donde `base` no existe.
            urlPattern: new RegExp(`${base.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}api/.+\\.json$`),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'stage-api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Imágenes: CacheFirst, se guardan la primera vez que se visitan.
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'stage-images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'stage-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'stage-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
