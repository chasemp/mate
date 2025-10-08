# Mate Chess PWA - Quick Start Guide

**Play chess with friends via SMS and WhatsApp!** Get up and running in 5 minutes! 🚀

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

## 🎮 How to Play

### Local Play
1. **Select** a piece (white moves first)
2. **Move** to a highlighted square
3. **Undo** moves with the ↩️ button
4. **New Game** to start fresh

### Remote Multiplayer (NEW!)
1. **Set Game Mode** to "Remote" in the header dropdown
2. **Name your game** and select an opponent
3. **Make your move** and click "Share"
4. **Send via SMS/WhatsApp** using the generated link
5. **Opponent receives** the move and continues the game

### Game Management
- **👥 Competitors** - View all your ongoing games
- **📱 Auto-save** - Games save automatically every 30 seconds
- **🔄 Resume** - Continue any game from where you left off
- **📊 Stats** - Track your game history and performance

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
- ✅ **Complete chess engine** with all moves and special moves
- ✅ **Multi-game system** (Chess + Checkers, with Othello, Breakthrough, Go planned)
- ✅ **AI opponent** with 20 difficulty levels
- ✅ **Mobile-optimized** ultra-compact layout
- ✅ **Remote multiplayer** via SMS/WhatsApp sharing
- ✅ **Game management** with competitors page
- ✅ **Auto-save** and game persistence
- ✅ **Move sharing** with embedded game data
- ✅ **Theme system** with 5 piece sets and 8 board themes

## Next Steps

Follow the roadmap in `CHESS_PWA_ROADMAP.md` for upcoming features:

### Upcoming Features:
- **WebRTC real-time multiplayer** (peer-to-peer)
- **QR code generation** for easy game invites
- **Bluetooth fallback** for offline connections
- **Move replay system** with step-by-step playback
- **Tournament mode** with brackets and scoring

## 🎮 Multiplayer Features

### Remote Play via SMS/WhatsApp
- **One-click sharing** - Web Share API for native mobile sharing
- **Move animations** - Visual feedback when receiving moves
- **Auto-save** - Never lose your progress
- **Game management** - Track all ongoing games
- **Resume anywhere** - Continue games on any device

### Game Types
- **♟️ Chess** - Full rules with all special moves
- **● Checkers** - Classic checkers with king promotion
- **🔄 More coming** - Othello, Breakthrough, Go

### Customization
- **🎨 8 board themes** + **5 piece sets** - Mix and match styles
- **📱 Mobile-optimized** - Ultra-compact layout for small screens
- **🌙 Dark mode** - Easy on the eyes
- **⚙️ Settings** - Customize your experience

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

## 🧪 Testing Multiplayer Features

### Test Remote Play
1. **Set Game Mode** to "Remote" in the header dropdown
2. **Name your game** (e.g., "Test Game")
3. **Select an opponent** (or use contact picker on mobile)
4. **Make a move** and click "Share"
5. **Copy the link** and open in another browser tab
6. **Verify** the move loads with animation

### Test Game Management
1. **Click the 👥 button** in the header to open Competitors page
2. **View your games** - should show ongoing games
3. **Click "Resume"** to continue any game
4. **Test filtering** by game type and status

### Test Auto-Save
1. **Make several moves** in a game
2. **Refresh the page** - game should restore
3. **Check Competitors page** - game should appear there
4. **Resume the game** - should continue from where you left off

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

