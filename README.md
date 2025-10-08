# Mate Chess PWA ♟️

**Play chess with friends via SMS and WhatsApp!** A complete offline multiplayer chess experience with remote play, game management, and seamless sharing. Inspired by [Lichess](https://github.com/lichess-org/lichobile).

## ✨ Features

### 🎮 **Multi-Game Support**
- ♟️ **Chess** - Full rules with all special moves
- ● **Checkers** - Classic checkers with king promotion
- 🔄 **More games coming** - Othello, Breakthrough, Go

### 📱 **Remote Multiplayer**
- 📲 **SMS/WhatsApp sharing** - Send moves via any messaging app
- 🔗 **One-click sharing** - Web Share API for native mobile sharing
- 🎯 **Move animations** - Visual feedback when receiving moves
- 💾 **Auto-save** - Never lose your progress
- 👥 **Competitors page** - Manage all your ongoing games

### 🎨 **Customization**
- 🎨 **8 board themes** + **5 piece sets** - Mix and match styles
- 📱 **Mobile-optimized** - Ultra-compact layout for small screens
- 🌙 **Dark mode** - Easy on the eyes
- ⚙️ **Settings** - Customize your experience

### 🚀 **Progressive Web App**
- 📱 **Installable** - Add to home screen like a native app
- 🔄 **Offline-capable** - Play without internet
- 🖱️ **Touch & click** - Works on all devices
- ⚡ **Fast loading** - Optimized for speed

## 🎨 Themes

Mix and match from **5 piece sets** and **8 board themes**:

**Piece Sets**: Classic, Bold, Modern, Neon, Royal  
**Board Themes**: Brown, Blue Ocean, Green Forest, Purple Haze, Marble, Tournament, Dark Mode, Neon Nights

See [THEME_GUIDE.md](THEME_GUIDE.md) for visual examples and combinations.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```
Visit http://localhost:3458

### Live Demo
🌐 **[Play Now at mate.523.life](https://mate.523.life/)**

## 🎮 How to Play

### Local Play
1. **Select** a piece (white moves first)
2. **Move** to a highlighted square
3. **Undo** moves with the ↩️ button
4. **New Game** to start fresh

### Remote Multiplayer
1. **Set Game Mode** to "Remote" in the header
2. **Name your game** and select an opponent
3. **Make your move** and click "Share"
4. **Send via SMS/WhatsApp** using the generated link
5. **Opponent receives** the move and continues the game

### Game Management
- **👥 Competitors** - View all your ongoing games
- **📱 Auto-save** - Games save automatically every 30 seconds
- **🔄 Resume** - Continue any game from where you left off
- **📊 Stats** - Track your game history and performance

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

### ✅ **Completed Features**
- [x] **Core chess engine** with all basic moves and special moves
- [x] **Multi-game system** (Chess + Checkers, with Othello, Breakthrough, Go planned)
- [x] **Theme system** (5 piece sets, 8 board themes)
- [x] **AI opponent** with 20 difficulty levels
- [x] **Coach mode** and learn-to-play tutorial
- [x] **Mobile-optimized** ultra-compact layout
- [x] **Remote multiplayer** via SMS/WhatsApp sharing
- [x] **Game management** with competitors page
- [x] **Auto-save** and game persistence
- [x] **Move sharing** with embedded game data
- [x] **URL-based** game and move sharing

### 🚧 **In Progress**
- [ ] **WebRTC real-time multiplayer** (peer-to-peer)
- [ ] **QR code generation** for easy game invites
- [ ] **Bluetooth fallback** for offline connections

### 🔮 **Future Plans**
- [ ] **Move replay system** with step-by-step playback
- [ ] **Tournament mode** with brackets and scoring
- [ ] **Social features** (friends, achievements, leaderboards)
- [ ] **Advanced AI** with opening book and endgame tablebase

## 📚 Documentation

- [CHESS_PWA_ROADMAP.md](CHESS_PWA_ROADMAP.md) - Complete development roadmap
- [THEME_GUIDE.md](THEME_GUIDE.md) - Visual theme guide
- [QUICK_START.md](QUICK_START.md) - Development & deployment guide

## 🤝 Credits

Inspired by the excellent [Lichess mobile app](https://github.com/lichess-org/lichobile) theme system.
