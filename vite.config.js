import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * BUILD SYSTEM (DEPLOYMENT MODEL):
 *
 * Source → Build → Deploy
 * /src   → /docs → GitHub Pages
 *
 * Development:
 * - root: 'src'                      → dev server serves from /src
 * - publicDir: '../public'           → static assets from /public
 * - Run: npm run dev → http://localhost:3458
 *
 * Production Build:
 * - build.outDir: '../docs'          → builds to /docs directory
 * - build.emptyOutDir: true          → safe to clear /docs (only contains built files)
 * - base: './'                       → enables relative paths for GitHub Pages
 * - Run: npm run build → generates /docs
 *
 * Deployment:
 * - GitHub Pages serves from /docs directory on main branch
 * - /docs contains ONLY generated files (never edit directly!)
 *
 * ⚠️  CRITICAL: Never edit files in /docs manually - they are auto-generated!
 */

export default defineConfig({
  // Serve app files from `src/` during development
  root: 'src',
  // Static assets outside the root live in `public/`
  publicDir: '../public',
  // Use relative base to support GitHub Pages deployment
  base: './',
  build: {
    // Output into /docs directory for GitHub Pages deployment
    outDir: '../docs',
    // Safe to empty /docs since it only contains built files
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'src/index.html',
        splash: 'src/splash.html',
        settings: 'src/settings.html',
        newGame: 'src/new-game.html',
        aiSetup: 'src/ai-setup.html',
        games: 'src/games.html',
        competitors: 'src/competitors.html'
      }
    }
  },
  server: {
    port: 3458, // Unique port for Chess PWA (see PORT_REGISTRY.md)
    host: '0.0.0.0',
    strictPort: true // Fail if port is in use instead of trying another port
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'sounds/*.mp3'],
      manifest: {
        name: 'Mate - Chess with Friends',
        short_name: 'Mate',
        description: 'Play chess offline with SMS-based multiplayer. Checkmate your mate!',
        start_url: '/splash.html',
        display: 'standalone',
        background_color: '#312e2b',
        theme_color: '#769656',
        orientation: 'any',
        scope: '/',
        lang: 'en',
        dir: 'ltr',
        categories: ['games', 'board', 'strategy'],
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'New Game',
            short_name: 'New Game',
            description: 'Start a new chess game',
            url: '/?action=new-game',
            icons: [
              {
                src: 'icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']
      }
    })
  ]
})

