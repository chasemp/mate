# Chess PWA ♟️

Offline multiplayer chess game with SMS-based game sharing. Inspired by [Lichess](https://github.com/lichess-org/lichobile).

## ✨ Features

- ♟️ **Full chess rules** - All piece movements, check, checkmate, stalemate
- 🎨 **8 board themes** + **5 piece sets** - Customize your board style ([Theme Guide](THEME_GUIDE.md))
- 📱 **Progressive Web App** - Installable, offline-capable, app-like experience
- 🖱️ **Touch & click support** - Tap to select, tap to move
- 🔄 **Move highlights** - Selected pieces, legal moves, last move, check
- ⏪ **Undo moves** - Take back your last move
- 📋 **Move history** - See all moves in algebraic notation
- 🚀 **No backend** - Completely client-side, no server needed

## 🎨 Themes

Mix and match from **5 piece sets** and **8 board themes**:

**Piece Sets**: Classic, Bold, Modern, Neon, Royal  
**Board Themes**: Brown, Blue Ocean, Green Forest, Purple Haze, Marble, Tournament, Dark Mode, Neon Nights

See [THEME_GUIDE.md](THEME_GUIDE.md) for visual examples and combinations.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3458

## 📱 Try It Now

1. Click a piece (white moves first)
2. Legal moves highlight in green
3. Click destination to move
4. Click ⚙️ for theme settings

## 🎮 How to Play

- **Select**: Click/tap a piece to select (highlights in yellow)
- **Move**: Click/tap a highlighted square to move
- **Undo**: Click the undo button (↩️) to take back your move
- **New Game**: Click "New Game" to start fresh
- **Themes**: Click ⚙️ to customize board and pieces

## 🚢 Deployment

This app deploys to GitHub Pages from the `/docs` directory.

```bash
npm run build   # Builds to /docs
git add docs/
git commit -m "Deploy update"
git push
```

## 🛠️ Tech Stack

- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS
- **HTML5 Canvas** - High-performance board rendering
- **CSS3** - Modern styling with custom properties
- **Vite** - Fast build tool and dev server
- **PWA** - Service Workers for offline capability
- **localStorage** - Settings and game persistence

## 📐 Architecture

```
src/
├── js/
│   ├── game/           # Chess engine (board, pieces, moves, validation)
│   ├── ui/             # Theme manager, rendering
│   └── app.js          # Main application
├── css/                # Styles
├── index.html          # Main game page
└── settings.html       # Theme customization
```

See `CHESS_PWA_ROADMAP.md` for detailed development plan.

## 🎯 Roadmap

- [x] Core chess engine with all basic moves
- [x] Board rendering with themes
- [x] Theme system (5 piece sets, 8 board themes)
- [x] Move validation (check, checkmate, stalemate)
- [x] Special moves (castling, en passant, pawn promotion)
- [x] Multi-game system (Chess + Checkers)
- [x] AI opponent with 20 difficulty levels
- [x] Coach mode and learn-to-play tutorial
- [x] Game mode selector (Local vs Remote)
- [x] Mobile-optimized ultra-compact layout
- [ ] WebRTC real-time multiplayer
- [ ] URL-based game sharing
- [ ] Move replay system
- [ ] Game history storage

## 📚 Documentation

- [CHESS_PWA_ROADMAP.md](CHESS_PWA_ROADMAP.md) - Complete development roadmap
- [THEME_GUIDE.md](THEME_GUIDE.md) - Visual theme guide
- [QUICK_START.md](QUICK_START.md) - Development & deployment guide

## 🤝 Credits

Inspired by the excellent [Lichess mobile app](https://github.com/lichess-org/lichobile) theme system.
