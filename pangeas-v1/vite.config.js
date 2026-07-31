import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        id: '/',
        name: 'Pangeas',
        short_name: 'Pangeas',
        description: 'Pangeas vous invite à explorer la nature autrement. Découvrez des lieux insolites, vivez des expériences uniques pour profiter pleinement de chaque sortie. Grâce à une carte interactive, trouvez facilement vos prochaines aventures.',
        theme_color: '#5D4037',
        background_color: '#EFE2CA',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/logo_mobile_pangeas.png',
            sizes: '500x500',
            type: 'image/png'
          },
          {
            src: '/logo_mobile_pangeas_blanc.png',
            sizes: '500x500',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: '/logo_seo.png',
            sizes: '1024x1024',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Pangeas - Explore la nature autrement'
          },
          {
            src: '/logo_seo.png',
            sizes: '1024x1024',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Pangeas - Explore la nature autrement'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => (
              request.method === 'GET' &&
              url.origin === self.location.origin &&
              /^\/api\/places(?:\/[^/]+)?\/?$/.test(url.pathname)
            ),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pangeas-public-places',
              networkTimeoutSeconds: 4,
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: ({ request, url }) => (
              request.destination === 'image' &&
              url.origin === self.location.origin
            ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'pangeas-local-images',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: ({ request, url }) => (
              request.destination === 'image' &&
              url.origin !== self.location.origin &&
              !url.hostname.endsWith('.tile.openstreetmap.fr')
            ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'pangeas-place-images',
              precacheFallback: {
                fallbackURL: '/logo_mobile_pangeas.png'
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 14 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: ({ request, url }) => (
              request.destination === 'style' &&
              url.origin !== self.location.origin
            ),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pangeas-external-styles',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'pangeas-web-fonts',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: ({ url }) => url.hostname.endsWith('.tile.openstreetmap.fr'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'pangeas-map-tiles',
              precacheFallback: {
                fallbackURL: '/map-tile-offline.svg'
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 14 * 24 * 60 * 60,
                purgeOnQuotaError: true
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
