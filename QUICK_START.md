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

Open http://localhost:3458 in your browser. You should see the Mate Chess PWA with a fully functional chess game! 🎮

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

## Current Status

The Mate Chess PWA is fully functional with:
- ✅ Complete chess engine with all moves
- ✅ Multi-game system (Chess + Checkers)
- ✅ AI opponent with 20 difficulty levels
- ✅ Mobile-optimized ultra-compact layout
- ✅ Game mode selector (Local vs Remote)
- ✅ Theme system with 5 piece sets and 8 board themes

## Next Steps

Follow the roadmap in `CHESS_PWA_ROADMAP.md` for upcoming features:

### Upcoming Features:
- WebRTC real-time multiplayer
- URL-based game sharing
- Move replay system
- Game history storage
- Advanced AI features

## Current Features

The Mate Chess PWA includes:
- Complete chess engine with all special moves
- Checkers game (fully functional)
- AI opponent with 20 difficulty levels
- Mobile-optimized ultra-compact layout
- Game mode selector (Local vs Remote)
- Theme system with 5 piece sets and 8 board themes
- Coach mode and learn-to-play tutorial
- Multi-game system architecture

## Verify Setup

```bash
# 1. Start dev server
npm run dev

# 2. Open http://localhost:3458

# 3. You should see:
#    - Header with Mate logo and game mode selector
#    - Functional chess board with pieces
#    - Game controls and settings
#    - Fully playable chess game!
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

