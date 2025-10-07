# 🎮 Multi-Game Architecture Plan

## Vision: From Chess PWA → 523.games Platform

This document outlines how we're architecting the Chess PWA to seamlessly support **Checkers** (and future games) without major refactoring.

---

## 🎯 Core Principle: Game-Agnostic Foundation

**Key Insight:** 80% of our code is already game-agnostic!

### Already Universal:
- ✅ **Board Rendering** - Canvas 8×8 grid works for any game
- ✅ **Game Storage** - Game IDs and opponent names work for any game
- ✅ **URL Sharing** - Move encoding system is flexible
- ✅ **Theme System** - Board colors apply to any game
- ✅ **PWA Infrastructure** - Offline, installable, responsive
- ✅ **Multi-player System** - Turn-based logic is universal
- ✅ **Touch/Click Handling** - Square selection works for any game

### Chess-Specific (Must Stay Isolated):
- ❌ **Piece Movement Rules** - `/game/pieces.js`
- ❌ **Special Moves** - `/game/special-moves.js`
- ❌ **Win Conditions** - Checkmate logic
- ❌ **AI Engine** - Stockfish for chess only

---

## 📁 Planned Directory Structure

```
src/
├── core/                          # Game-agnostic (UNIVERSAL)
│   ├── board/
│   │   ├── board-renderer.js      # Canvas 8×8 drawing
│   │   ├── square-selector.js     # Click/touch handling
│   │   └── theme-manager.js       # Board colors & piece sets
│   ├── storage/
│   │   ├── multi-game-storage.js  # Game state storage
│   │   ├── game-id-generator.js   # Unique game IDs
│   │   └── opponent-manager.js    # Nicknames & emojis
│   ├── sharing/
│   │   ├── url-encoder.js         # Compress moves to URLs
│   │   ├── url-decoder.js         # Parse move URLs
│   │   └── share-manager.js       # Web Share API
│   ├── ui/
│   │   ├── game-list.js           # Show all active games
│   │   ├── notification.js        # Toast messages
│   │   └── modal-manager.js       # Dialog system
│   └── pwa/
│       ├── service-worker.js      # Offline caching
│       └── install-prompt.js      # Install banner
│
├── games/                         # Game-specific implementations
│   ├── chess/                     # Chess game module
│   │   ├── chess-engine.js        # Chess orchestrator
│   │   ├── board.js               # Chess board state
│   │   ├── pieces.js              # Piece movement rules
│   │   ├── special-moves.js       # Castling, en passant
│   │   ├── move-validator.js      # Legal move checking
│   │   ├── game-state.js          # Chess state management
│   │   ├── ai/
│   │   │   ├── stockfish-engine.js
│   │   │   ├── ai-manager.js
│   │   │   └── coach-ai.js
│   │   └── tutorial/
│   │       └── chess-learn-mode.js
│   │
│   ├── checkers/                  # Checkers game module (FUTURE)
│   │   ├── checkers-engine.js     # Checkers orchestrator
│   │   ├── board.js               # Checkers board state
│   │   ├── pieces.js              # Regular & King pieces
│   │   ├── move-validator.js      # Mandatory captures
│   │   ├── game-state.js          # Checkers state
│   │   ├── ai/
│   │   │   ├── minimax-engine.js  # Simple minimax AI
│   │   │   ├── ai-manager.js
│   │   │   └── coach-ai.js
│   │   └── tutorial/
│   │       └── checkers-learn-mode.js
│   │
│   └── game-registry.js           # Register available games
│
└── app.js                         # Main app (game-agnostic router)
```

---

## 🔌 Game Engine Interface

All games must implement this interface:

```javascript
// games/game-engine-interface.js
export class GameEngine {
  // Core game lifecycle
  newGame()                           // Start fresh game
  reset()                             // Reset to initial state
  
  // Move system
  makeMove(fromRow, fromCol, toRow, toCol, extra)  // Execute move
  getLegalMoves(row, col)            // Get valid moves for piece
  validateMove(from, to)             // Check if move is legal
  
  // Game state
  getBoard()                         // Get current board state
  getCurrentTurn()                   // Whose turn is it?
  getGameStatus()                    // active, check, win, draw
  getMoveHistory()                   // List of all moves
  getLastMove()                      // Most recent move
  
  // Win conditions (game-specific)
  isGameOver()                       // Has game ended?
  getWinner()                        // Who won? (or null/draw)
  
  // Serialization (for URL sharing)
  exportState()                      // Serialize for URL
  importState(state)                 // Load from URL
  
  // AI support
  supportsAI()                       // Does this game have AI?
  getAIManager()                     // Get AI opponent
  
  // Tutorial support
  supportsTutorial()                 // Does this game have tutorial?
  getTutorialManager()               // Get tutorial system
}
```

---

## 🎮 Game Registry

```javascript
// games/game-registry.js
import { ChessEngine } from './chess/chess-engine.js';
import { CheckersEngine } from './checkers/checkers-engine.js';

export const GAME_REGISTRY = {
  chess: {
    id: 'chess',
    name: 'Chess',
    icon: '♟️',
    shortName: 'Chess',
    description: 'The classic game of strategy',
    engine: ChessEngine,
    boardSize: 8,
    urlPrefix: 'c',      // chess.523.life/c/g4f2-e4
    color: '#769656',
    difficulty: 'Hard',
    avgGameTime: '30-45 min',
    players: '2',
    available: true
  },
  
  checkers: {
    id: 'checkers',
    name: 'Checkers',
    icon: '🔴',
    shortName: 'Checkers',
    description: 'Jump and capture your way to victory',
    engine: CheckersEngine,
    boardSize: 8,
    urlPrefix: 'k',      // chess.523.life/k/g4f2-3-5
    color: '#c41e3a',
    difficulty: 'Medium',
    avgGameTime: '15-20 min',
    players: '2',
    available: false     // Set to true when implemented
  }
};

export function getGame(gameId) {
  return GAME_REGISTRY[gameId];
}

export function getAvailableGames() {
  return Object.values(GAME_REGISTRY).filter(g => g.available);
}
```

---

## 🎨 Game Selector UI

```javascript
// When multiple games are available:
<div class="game-selector">
  <button class="current-game">
    ♟️ Chess ▼
  </button>
  
  <div class="game-dropdown">
    <div class="game-option active" data-game="chess">
      <span class="game-icon">♟️</span>
      <div class="game-info">
        <strong>Chess</strong>
        <span class="game-meta">Hard • 30-45 min</span>
      </div>
    </div>
    
    <div class="game-option" data-game="checkers">
      <span class="game-icon">🔴</span>
      <div class="game-info">
        <strong>Checkers</strong>
        <span class="game-meta">Medium • 15-20 min</span>
      </div>
    </div>
  </div>
</div>
```

---

## 🔗 URL Structure (Game-Aware)

### Current (Chess-only):
```
chess.523.life/m/g4f2-e4
```

### Future (Multi-game):
```
chess.523.life/c/m/g4f2-e4        ← Chess game
chess.523.life/k/m/g4f2-3-5       ← Checkers game
                 │  │
                 │  └─ Move prefix
                 └──── Game type (c=chess, k=checkers)
```

### Alternative (Subdomain):
```
chess.523.life/m/g4f2-e4          ← Chess
checkers.523.life/m/g4f2-3-5      ← Checkers
```

---

## 🏗️ Refactoring Checklist

### Phase: Multi-Game Foundation (Pre-Checkers)

**When implementing Checkers, we'll need to:**

#### 1. Abstract Board Rendering
- [ ] Move board rendering to `/core/board/board-renderer.js`
- [ ] Accept piece rendering function as parameter
- [ ] Support different piece sets per game

#### 2. Abstract Storage
- [ ] Add `gameType` field to stored games
- [ ] Support game-specific state serialization
- [ ] Filter games by type in game list

#### 3. Abstract URL Encoding
- [ ] Add game type to URL format
- [ ] Support game-specific move notation
- [ ] Route to correct engine based on URL

#### 4. Abstract UI Components
- [ ] Game selector dropdown
- [ ] Game-aware notifications
- [ ] Game-specific settings

#### 5. Keep Chess Isolated
- [ ] Move all chess logic to `/games/chess/`
- [ ] No chess-specific code in `/core/`
- [ ] Chess becomes a "plugin"

---

## 🔴 Checkers-Specific Implementation

### What Makes Checkers Different:

1. **Simpler Pieces**
   - Only 2 types: Regular, King
   - All pieces move diagonally only
   - No complex moves like castling

2. **Mandatory Captures**
   - If you can capture, you must
   - Chain captures in one turn
   - Jump over opponent pieces

3. **Win Condition**
   - Eliminate all opponent pieces
   - OR block opponent from moving

4. **Easier AI**
   - Minimax algorithm (pure JS)
   - No external libraries needed
   - Faster computation

5. **Faster Games**
   - Average 15-20 minutes
   - Simpler decision tree
   - More accessible

### Checkers AI Strategy:

```javascript
// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, alpha, beta, maximizing) {
  if (depth === 0 || gameOver(board)) {
    return evaluateBoard(board);
  }
  
  // Much simpler than chess:
  // - Fewer pieces (12 vs 16)
  // - Simpler moves (diagonal only)
  // - Can search deeper (8-10 ply vs 4-5)
  // - Faster evaluation
}

function evaluateBoard(board) {
  let score = 0;
  
  // Simple evaluation:
  score += countPieces(board, 'regular') * 1;
  score += countPieces(board, 'king') * 3;
  score += centerControl(board) * 0.5;
  score += mobility(board) * 0.3;
  
  return score;
}
```

---

## 📊 Comparison: Chess vs Checkers

| Feature | Chess | Checkers |
|---------|-------|----------|
| **Board** | 8×8 | 8×8 ✅ Same! |
| **Pieces** | 6 types | 2 types (simpler) |
| **Initial Pieces** | 16 each | 12 each |
| **Movement** | Complex | Diagonal only |
| **Special Moves** | 3 (castle, en passant, promotion) | 1 (multi-jump) |
| **Win Condition** | Checkmate | Eliminate/block |
| **AI Complexity** | Very hard (Stockfish) | Medium (Minimax) |
| **AI Library** | ~300KB WASM | Pure JS (~5KB) |
| **Game Length** | 30-45 min | 15-20 min |
| **Learning Curve** | Steep | Gentle |
| **URL Encoding** | Complex | Simple |

---

## 🎯 Implementation Timeline

### Phase 4: Multi-Game Foundation (After Chess Stable)
**Est: 2-3 days**
- Refactor to game engine interface
- Move chess to `/games/chess/`
- Create game registry
- Abstract board renderer
- Add game selector UI

### Phase 5: Checkers Implementation
**Est: 3-4 days**
- Implement CheckersEngine
- Build piece movement rules
- Mandatory capture logic
- Minimax AI (pure JS)
- Checkers tutorial mode
- Theme support

### Phase 6: Polish & Test
**Est: 1-2 days**
- Test both games thoroughly
- Ensure URL sharing works for both
- Mobile testing
- Performance optimization

**Total: ~1 week** to go from Chess-only to Chess + Checkers!

---

## 🚀 Future Games (Post-Checkers)

### Easy Additions:
1. **Chess960** - Random starting position (1 day)
2. **Tic-Tac-Toe** - Tutorial game (1 day)
3. **Connect Four** - Simple rules (2 days)

### Medium Additions:
4. **Othello** - Flip mechanics (3 days)
5. **Go (9×9)** - Complex strategy (1 week)

### Advanced:
6. **Shogi** - Japanese chess (1 week)
7. **Xiangqi** - Chinese chess (1 week)

---

## 💡 Key Architectural Decisions

### 1. **Single PWA, Multiple Games**
- One app install
- Switch between games
- Shared infrastructure
- Better UX than separate apps

### 2. **Game-Specific Directories**
- Each game is self-contained
- Easy to add new games
- No cross-contamination
- Plugin-like architecture

### 3. **Progressive Enhancement**
- Launch with chess
- Add checkers when stable
- Add more games over time
- Each game is optional

### 4. **Shared AI Infrastructure**
- ChessAI uses Stockfish
- CheckersAI uses Minimax
- Future games choose best approach
- Coach system for each game

### 5. **Unified Storage**
- All games use same game IDs
- Same opponent management
- Same URL sharing
- Consistent UX

---

## ✅ Current Status: Chess-First, Checkers-Ready

**We're building chess with checkers in mind:**
- Board renderer will work for both ✅
- Storage system is game-agnostic ✅
- URL sharing is flexible ✅
- Game IDs work for any game ✅
- Opponent nicknames are universal ✅

**When chess is stable, we'll:**
1. Abstract the game engine interface
2. Move chess-specific code to `/games/chess/`
3. Implement checkers in `/games/checkers/`
4. Add game selector
5. Launch multi-game platform! 🚀

---

**This architecture ensures chess development continues smoothly while keeping the door wide open for checkers!** 🎯

