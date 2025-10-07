# Chess PWA - Quick Start Guide

Get up and running in 5 minutes! 🚀

## Prerequisites

- Node.js 18+ installed
- Git installed
- Text editor (VS Code, Cursor, etc.)

## Initial Setup (First Time Only)

```bash
# 1. Navigate to the project
cd /Users/cpettet/git/chasemp/chess

# 2. Install dependencies
npm install

# 3. Verify port is available
npm run port:check

# 4. Start development server
npm run dev
```

Open http://localhost:3458 in your browser. You should see... well, nothing yet because we haven't built the app! 😄

## Development Workflow

### Daily Workflow

```bash
# Start development server
npm run dev

# In another terminal, watch for changes and auto-reload
# (Vite does this automatically!)
```

### File Structure Reminder

```
✅ EDIT THESE:
/src/        - Your source code
/public/     - Static assets

❌ NEVER EDIT:
/docs/       - Auto-generated build output
```

## Next Steps (Phase 0)

Follow the roadmap in `CHESS_PWA_ROADMAP.md`. Here's what to build first:

### 1. Create Basic HTML Pages

```bash
# Create the main game page
touch src/index.html

# Create splash screen
touch src/splash.html

# Create settings page
touch src/settings.html

# Create game history page
touch src/game-history.html
```

### 2. Create Basic CSS

```bash
# Main stylesheet
touch src/css/main.css

# Theme files
touch src/css/themes/classic.css
touch src/css/themes/modern.css
touch src/css/themes/dark.css
```

### 3. Create Core JavaScript Files

```bash
# Main app controller
touch src/js/app.js

# Game logic
touch src/js/game/board.js
touch src/js/game/pieces.js
touch src/js/game/chess-engine.js
touch src/js/game/move-validator.js
touch src/js/game/game-state.js

# UI components
touch src/js/ui/board-renderer.js
touch src/js/ui/piece-selector.js
touch src/js/ui/move-indicator.js
touch src/js/ui/drag-drop.js

# Sharing functionality
touch src/js/sharing/url-encoder.js
touch src/js/sharing/url-decoder.js
touch src/js/sharing/share-manager.js

# Storage
touch src/js/storage/game-storage.js
touch src/js/storage/history-manager.js

# PWA
touch src/js/pwa/install.js
touch src/js/pwa/offline.js

# Utilities
touch src/js/utils/notation.js
touch src/js/utils/fen.js

# Service worker
touch src/sw.js
```

### 4. Create PWA Manifest

```bash
touch public/manifest.json
```

### 5. Create Build Scripts

```bash
touch scripts/generate-build-info.js
```

## Template: Minimal index.html

Create `src/index.html` with this starter template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Chess</title>
    <meta name="description" content="Offline multiplayer chess with SMS sharing">
    <meta name="theme-color" content="#769656">
    
    <!-- PWA -->
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/x-icon" href="/icons/icon-192x192.png">
    
    <!-- iOS PWA -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Chess">
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
    
    <!-- Styles -->
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="" id="theme-css">
</head>
<body>
    <div id="app">
        <header class="header">
            <h1>♟️ Chess</h1>
            <div class="controls">
                <button id="settings-btn" class="btn-secondary">⚙️</button>
                <button id="share-btn" class="btn-primary">Share</button>
            </div>
        </header>
        
        <main class="main">
            <div class="game-info">
                <div class="turn-indicator">
                    <span id="current-turn">White to move</span>
                </div>
                <div class="game-status" id="game-status"></div>
            </div>
            
            <div class="board-container">
                <canvas id="chess-board" width="600" height="600"></canvas>
            </div>
            
            <div class="move-history">
                <h3>Moves</h3>
                <div id="move-history"></div>
            </div>
        </main>
        
        <footer class="footer">
            <button id="new-game-btn" class="btn-secondary">New Game</button>
            <button id="undo-btn" class="btn-secondary">Undo</button>
        </footer>
    </div>
    
    <script type="module" src="/js/app.js"></script>
</body>
</html>
```

## Template: Minimal app.js

Create `src/js/app.js` with this starter:

```javascript
/**
 * Chess PWA - Main Application
 */

console.log('Chess PWA starting...');

// Placeholder - will be filled in during Phase 1
class ChessApp {
  constructor() {
    console.log('Chess app initialized!');
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    document.getElementById('new-game-btn')?.addEventListener('click', () => {
      console.log('New game clicked');
    });
    
    document.getElementById('share-btn')?.addEventListener('click', () => {
      console.log('Share clicked');
    });
    
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      window.location.href = '/settings.html';
    });
  }
}

// Initialize app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new ChessApp();
});
```

## Template: Basic CSS

Create `src/css/main.css`:

```css
/* Chess PWA - Main Styles */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #312e2b;
  color: #f0f0f0;
  touch-action: manipulation; /* Prevent double-tap zoom */
  -webkit-tap-highlight-color: transparent;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #1a1816;
}

.header h1 {
  font-size: 1.5rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: auto;
}

.board-container {
  max-width: 600px;
  max-height: 600px;
  width: 100%;
  aspect-ratio: 1;
}

#chess-board {
  width: 100%;
  height: 100%;
  border: 2px solid #1a1816;
  touch-action: none; /* Prevent scrolling on board */
}

.game-info {
  width: 100%;
  max-width: 600px;
  margin-bottom: 1rem;
  text-align: center;
}

.turn-indicator {
  font-size: 1.2rem;
  font-weight: bold;
}

.footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #1a1816;
}

/* Buttons */
button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  min-height: 44px; /* Touch target size */
  min-width: 44px;
  transition: transform 0.1s, background-color 0.2s;
}

button:active {
  transform: scale(0.95);
}

.btn-primary {
  background-color: #769656;
  color: white;
}

.btn-primary:hover {
  background-color: #6a8550;
}

.btn-secondary {
  background-color: #454442;
  color: white;
}

.btn-secondary:hover {
  background-color: #595754;
}

/* Responsive */
@media (max-width: 768px) {
  .header h1 {
    font-size: 1.2rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
```

## Verify Setup

```bash
# 1. Start dev server
npm run dev

# 2. Open http://localhost:3458

# 3. You should see:
#    - Header with "♟️ Chess"
#    - Empty board area (black canvas)
#    - Buttons at bottom
#    - Console log: "Chess app initialized!"
```

## Building for Production

```bash
# Build to /docs directory
npm run build

# Preview the production build
npm run preview

# Check the build
ls -la docs/
```

## Deploying to GitHub Pages

**CRITICAL:** Following Blockdoku pattern - `/docs` is COMMITTED to git!

```bash
# 1. Build the project (generates /docs directory)
npm run build

# 2. Verify build output
ls -la docs/

# 3. Commit BOTH source and build output
git add -A
git commit -m "Initial Chess PWA setup"

# 4. Push to GitHub
git push origin main

# 5. Configure GitHub Pages (ONE TIME ONLY)
# Go to: https://github.com/chasemp/chess/settings/pages
# Source: Deploy from a branch
# Branch: main
# Folder: /docs
# Save

# 6. Wait 1-2 minutes, then visit:
# https://chasemp.github.io/chess/
```

**Important:** Unlike some projects, we DO commit `/docs` to git. This is the deployment source for GitHub Pages. The workflow is:

```
Edit /src → npm run build → /docs generated → commit /docs → push → deployed
```

## Custom Domain Setup (chess.523.life)

```bash
# 1. Create CNAME file
echo "chess.523.life" > public/CNAME

# 2. Configure DNS (at your DNS provider)
# Add CNAME record:
# chess.523.life → chasemp.github.io

# 3. Build and deploy
npm run build
git add -A
git commit -m "Add custom domain"
git push origin main

# 4. Configure in GitHub settings
# Settings → Pages → Custom domain: chess.523.life
```

## Troubleshooting

### Port Already in Use

```bash
npm run port:kill
npm run dev
```

### Build Fails

```bash
# Clean and rebuild
rm -rf node_modules docs
npm install
npm run build
```

### Page Doesn't Load

Check these:
1. Is dev server running? (`npm run dev`)
2. Is port 3458 accessible? (`npm run port:check`)
3. Are you on http://localhost:3458?
4. Check browser console for errors (F12)

### PWA Not Installing

- Must be served over HTTPS (or localhost)
- Must have valid manifest.json
- Must have valid service worker
- Try on mobile device after deploying

## Next: Start Building!

Now you're ready to start Phase 1 of the roadmap:

1. Open `CHESS_PWA_ROADMAP.md`
2. Start with **Phase 1: Core Chess Engine**
3. Build `board.js` first
4. Test each component as you build it

**Happy coding! ♟️**

---

**Need help?** Check out:
- `CHESS_PWA_ROADMAP.md` - Complete development roadmap
- `README.md` - Project overview
- `PORT_REGISTRY.md` - Port management
- `peadoubleueh/PWA_AGENT_GUIDE.md` - PWA best practices

