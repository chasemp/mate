# Board Games PWA - Comprehensive Roadmap
## Offline SMS-Based Multiplayer Board Games

**Vision:** Start with Chess, expand to multi-game platform (Chess + Checkers + more)  
**Tech Stack:** Vanilla JavaScript + HTML5 + CSS3 + PWA APIs  
**Deployment:** GitHub Pages (via `/docs` directory)  
**Hosting:** chess.523.life (future: 523.games)  
**Port:** 3458

**📖 See Also:** `MULTI_GAME_ARCHITECTURE.md` - Details on checkers integration

---

## 🎯 Core Concept

**The Big Idea:** Two people can play chess completely offline if they have:
1. SMS/messaging capability
2. Your Chess PWA installed

**How It Works:**
1. Player 1 makes a move
2. Game state compressed into URL: `chess.523.life/g/Nc3-d5-Qh4-e6`
3. Player 1 sends shortened URL via SMS
4. Player 2 opens link → PWA loads → sees board state → makes their move
5. Repeat

**Key Insight:** The game state IS the multiplayer protocol. No server needed!

---

## 📋 Project Architecture (Based on Blockdoku Patterns)

```
chess/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Auto-deploy to GitHub Pages
├── src/                         # ✅ EDIT SOURCE HERE
│   ├── index.html              # Main game page
│   ├── splash.html             # PWA splash screen
│   ├── settings.html           # Settings page (separate page, not modal)
│   ├── game-history.html       # Game history viewer
│   ├── css/
│   │   ├── main.css           # Core styles
│   │   └── themes/
│   │       ├── classic.css    # Classic wood board
│   │       ├── modern.css     # Modern minimal
│   │       └── dark.css       # Dark mode
│   ├── js/
│   │   ├── app.js             # Main application controller
│   │   ├── game/
│   │   │   ├── chess-engine.js      # Core chess logic
│   │   │   ├── board.js             # Board representation
│   │   │   ├── pieces.js            # Piece definitions & movement
│   │   │   ├── move-validator.js    # Legal move validation
│   │   │   └── game-state.js        # State management
│   │   ├── ui/
│   │   │   ├── board-renderer.js    # Canvas/DOM board rendering
│   │   │   ├── piece-selector.js    # Piece selection & highlighting
│   │   │   ├── move-indicator.js    # Visual move indicators
│   │   │   └── drag-drop.js         # Touch + mouse drag & drop
│   │   ├── sharing/
│   │   │   ├── url-encoder.js       # Compress game state to URL
│   │   │   ├── url-decoder.js       # Parse URL game state
│   │   │   ├── share-manager.js     # Web Share API integration
│   │   │   └── qr-generator.js      # Optional QR code generation
│   │   ├── storage/
│   │   │   ├── game-storage.js      # LocalStorage management
│   │   │   └── history-manager.js   # Game history tracking
│   │   ├── pwa/
│   │   │   ├── install.js           # PWA install prompts
│   │   │   └── offline.js           # Offline detection
│   │   └── utils/
│   │       ├── notation.js          # Algebraic notation (e4, Nf3, etc.)
│   │       └── fen.js               # FEN notation support
│   └── sw.js                   # Service worker
├── public/                     # Static assets (copied as-is)
│   ├── CNAME                   # chess.523.life
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # PWA icons (72-512px)
│   └── sounds/                 # Move sounds, capture sounds
├── docs/                       # 🤖 AUTO-GENERATED (GitHub Pages)
├── scripts/
│   ├── generate-build-info.js
│   └── generate-icons.js       # Generate chess piece icons
├── vite.config.js             # Build configuration
├── package.json
└── README.md
```

---

## 🏗️ Development Phases

### **Phase 0: Project Setup** (1-2 days)
*Get the foundation right from day one*

#### 0.1 Repository & Build Setup
- [ ] Initialize npm project
- [ ] Install Vite: `npm install -D vite`
- [ ] Configure Vite for PWA (`root: 'src'`, `build.outDir: '../docs'`)
- [ ] Set up port 3458 in vite.config.js
- [ ] Create `/src`, `/public`, `/scripts` directories
- [ ] Configure .gitignore (ignore root-level build artifacts)
- [ ] Set up GitHub Actions deployment workflow

#### 0.2 PWA Foundation
- [ ] Create manifest.json (name: "Chess", theme, icons)
- [ ] Generate icon set (72px → 512px)
- [ ] Create basic service worker (offline-first strategy)
- [ ] Set up CNAME for chess.523.life
- [ ] Create splash.html (PWA entry point)

#### 0.3 Basic HTML Structure
- [ ] Create index.html (main game page)
- [ ] Set up responsive viewport meta tags
- [ ] Create basic CSS reset and theme system
- [ ] Test mobile-first responsive layout
- [ ] Verify PWA install works on mobile

**Success Criteria:** PWA installs correctly, offline capable, serves on port 3458

---

### **Phase 1: Core Chess Engine** (3-5 days)
*Build the game logic foundation*

#### 1.1 Board Representation
```javascript
// board.js - Simple array representation
class ChessBoard {
  constructor() {
    // 8x8 array: null = empty, 'wP' = white pawn, 'bK' = black king, etc.
    this.board = this.initializeBoard();
  }
  
  initializeBoard() {
    return [
      ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
      ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
      ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];
  }
  
  getPiece(row, col) { return this.board[row][col]; }
  setPiece(row, col, piece) { this.board[row][col] = piece; }
  isEmpty(row, col) { return this.board[row][col] === null; }
}
```

#### 1.2 Piece Movement Rules
```javascript
// pieces.js - Define legal moves for each piece type
class PieceRules {
  static getPossibleMoves(board, row, col) {
    const piece = board.getPiece(row, col);
    if (!piece) return [];
    
    const type = piece[1]; // 'P', 'N', 'B', 'R', 'Q', 'K'
    const color = piece[0]; // 'w', 'b'
    
    switch(type) {
      case 'P': return this.getPawnMoves(board, row, col, color);
      case 'N': return this.getKnightMoves(board, row, col, color);
      case 'B': return this.getBishopMoves(board, row, col, color);
      case 'R': return this.getRookMoves(board, row, col, color);
      case 'Q': return this.getQueenMoves(board, row, col, color);
      case 'K': return this.getKingMoves(board, row, col, color);
    }
  }
  
  static getPawnMoves(board, row, col, color) {
    const moves = [];
    const direction = color === 'w' ? -1 : 1; // White moves up, black down
    
    // Forward one square
    if (board.isEmpty(row + direction, col)) {
      moves.push({row: row + direction, col: col});
      
      // Forward two squares from starting position
      const startRow = color === 'w' ? 6 : 1;
      if (row === startRow && board.isEmpty(row + 2*direction, col)) {
        moves.push({row: row + 2*direction, col: col});
      }
    }
    
    // Captures (diagonal)
    for (const dcol of [-1, 1]) {
      const newRow = row + direction;
      const newCol = col + dcol;
      if (this.isValidSquare(newRow, newCol)) {
        const targetPiece = board.getPiece(newRow, newCol);
        if (targetPiece && targetPiece[0] !== color) {
          moves.push({row: newRow, col: newCol, capture: true});
        }
      }
    }
    
    return moves;
  }
  
  static getKnightMoves(board, row, col, color) {
    const moves = [];
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [drow, dcol] of offsets) {
      const newRow = row + drow;
      const newCol = col + dcol;
      if (this.isValidSquare(newRow, newCol)) {
        const targetPiece = board.getPiece(newRow, newCol);
        if (!targetPiece || targetPiece[0] !== color) {
          moves.push({row: newRow, col: newCol, capture: !!targetPiece});
        }
      }
    }
    
    return moves;
  }
  
  // Similar for bishop, rook, queen, king...
}
```

#### 1.3 Move Validation
- [ ] Implement basic move validation (in-bounds, piece ownership)
- [ ] Add capture detection
- [ ] Implement check detection
- [ ] Add checkmate detection (simplified for Phase 1)
- [ ] Handle special moves: castling, en passant, pawn promotion

#### 1.4 Game State Management
```javascript
// game-state.js
class GameState {
  constructor() {
    this.board = new ChessBoard();
    this.currentTurn = 'white'; // 'white' or 'black'
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.gameStatus = 'active'; // 'active', 'check', 'checkmate', 'stalemate'
  }
  
  makeMove(fromRow, fromCol, toRow, toCol) {
    // Validate move
    const isValid = this.validator.isLegalMove(
      this.board, fromRow, fromCol, toRow, toCol, this.currentTurn
    );
    
    if (!isValid) return false;
    
    // Execute move
    const capturedPiece = this.board.getPiece(toRow, toCol);
    this.board.setPiece(toRow, toCol, this.board.getPiece(fromRow, fromCol));
    this.board.setPiece(fromRow, fromCol, null);
    
    // Record move
    this.moveHistory.push({
      from: {row: fromRow, col: fromCol},
      to: {row: toRow, col: toCol},
      piece: this.board.getPiece(toRow, toCol),
      captured: capturedPiece,
      timestamp: Date.now()
    });
    
    // Update state
    if (capturedPiece) {
      this.capturedPieces[this.currentTurn].push(capturedPiece);
    }
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    this.updateGameStatus();
    
    return true;
  }
  
  updateGameStatus() {
    if (this.isInCheck(this.currentTurn)) {
      if (this.hasLegalMoves(this.currentTurn)) {
        this.gameStatus = 'check';
      } else {
        this.gameStatus = 'checkmate';
      }
    } else if (!this.hasLegalMoves(this.currentTurn)) {
      this.gameStatus = 'stalemate';
    } else {
      this.gameStatus = 'active';
    }
  }
}
```

**Success Criteria:** Can play a complete chess game locally (all piece movements, checkmate detection)

---

### **Phase 2: AI Features** 🤖 (3-4 days)
*Play against computer, get coaching, learn chess*

#### 2.1 AI Opponent (Stockfish.js) ✅ IMPLEMENTED
**Single-player mode with adjustable difficulty**

```javascript
// ai/stockfish-engine.js
// WASM-based chess engine (~300KB)
// 20 difficulty levels (800-3000 ELO)
```

**Features:**
- ✅ Play vs computer (any difficulty)
- ✅ Choose your color (white/black)
- ✅ AI thinking indicator
- ✅ 20 skill levels (Beginner → Expert)
- ✅ Fast response time (0.5-2s)
- ✅ Runs in Web Worker (non-blocking)

**Implementation:**
```javascript
// ai/ai-manager.js
class AIManager {
  async startVsComputer(aiColor, skillLevel) {
    this.engine = new StockfishEngine();
    await this.engine.init();
    this.engine.setSkillLevel(skillLevel);
    // AI plays automatically on its turn
  }
}
```

**UI:**
- Difficulty slider (0-20)
- Color selection (white/black)
- "AI is thinking..." spinner
- Game mode selection

**Success Criteria:** Can play full games vs AI at any difficulty level

---

#### 2.2 Coach AI 🎓 ✅ IMPLEMENTED
**Two-AI system: Opponent + Coach teaching you simultaneously**

**Concept:** Play against one AI while another AI coaches you!

```javascript
// ai/coach-ai.js
class CoachAI {
  // Separate Stockfish instance at max strength
  async getHint(moveHistory) {
    // Returns: { bestMove, explanation, strategicAdvice }
  }
  
  analyzePosition(gameState) {
    // Opening/Middlegame/Endgame specific tips
  }
}
```

**Features:**
- ✅ **💡 Get Hint** - Shows best move with explanation
- ✅ **📊 Analyze** - Full position analysis + strategic tips
- ✅ **Context-aware** - Different advice for opening/middlegame/endgame
- ✅ **Visual hints** - Highlights suggested squares on board
- ✅ **Auto-hints** - Optional hints after opponent moves
- ✅ **Coach panel** - Persistent coaching sidebar

**Strategic Advice Examples:**
```javascript
// Opening tips
"🎯 Opening Tips: Control the center, develop knights before bishops"

// Middlegame
"⚔️ Middlegame Strategy: Look for tactical opportunities, coordinate pieces"

// Endgame  
"👑 Endgame Key: Activate your king! In endgame, king is strong"
```

**Move Explanations:**
```
"Move your knight to f3. In the opening, focus on 
controlling the center and developing your pieces."

"This captures the opponent's bishop! Good development - 
getting pieces into the game early is crucial."
```

**UI Components:**
- Coach panel (collapsible)
- Hint button
- Analyze button
- Strategic tips display
- Move explanation display

**Success Criteria:** Can get helpful hints and learn strategy while playing

---

#### 2.3 Learn to Play Mode 📚 ✅ IMPLEMENTED
**Interactive chess tutorial for complete beginners**

```javascript
// tutorial/learn-mode.js
class LearnMode {
  lessons: [
    { title: "Welcome to Chess!", ... },
    { title: "The Pawn ♟️", task: "move_piece" },
    { title: "Pawn Captures ⚔️", task: "capture" },
    { title: "The Rook ♜", ... },
    { title: "The Bishop ♝", ... },
    { title: "The Knight ♞", ... },
    { title: "The Queen ♛", ... },
    { title: "The King ♚", ... },
    { title: "Check! ⚠️", task: "check" },
    { title: "Checkmate! 🏆", task: "checkmate" }
  ]
}
```

**11 Progressive Lessons:**
1. **Introduction** - Chess board basics
2. **Pawn Movement** - Forward moves, first move double
3. **Pawn Captures** - Diagonal captures
4. **Rook** - Straight lines
5. **Bishop** - Diagonal lines
6. **Knight** - L-shaped jumps
7. **Queen** - Rook + Bishop combined
8. **King** - One square any direction
9. **Check** - Attacking the king
10. **Checkmate** - Winning the game
11. **Congratulations** - Ready to play!

**Interactive Features:**
- ✅ Custom board setups per lesson
- ✅ Guided tasks with validation
- ✅ "Try again" feedback for wrong moves
- ✅ Progress bar (Lesson X of 11)
- ✅ Next/Previous navigation
- ✅ Success animations

**UI:**
```
┌─────────────────────────────┐
│ 🎓 The Knight ♞             │
│ Knights jump in L-shape      │
├─────────────────────────────┤
│ Progress: ████░░░░░ 5/11    │
├─────────────────────────────┤
│ Knights move in an 'L'       │
│ shape: 2 squares + 1 square │
│ perpendicular. Try it!       │
│                              │
│ [← Previous] [Exit]          │
└─────────────────────────────┘
```

**Success Criteria:** Complete beginners can learn all pieces and basic tactics

---

### **Phase 3: UI & Rendering** (3-4 days)
*Make it beautiful and touch-friendly*

#### 3.1 Move Replay System 🎬
**PRIORITY FEATURE:** Essential for understanding game flow before making your move!

When you receive a game link, you can replay all previous moves:

```javascript
// replay-manager.js
class ReplayManager {
  constructor(gameState, renderer) {
    this.gameState = gameState;
    this.renderer = renderer;
    this.replayIndex = gameState.moveHistory.length; // Start at current position
    this.isReplaying = false;
  }
  
  startReplay() {
    this.isReplaying = true;
    this.replayIndex = 0;
    this.renderMoveAtIndex(0);
    this.showReplayControls();
  }
  
  renderMoveAtIndex(index) {
    // Create a temporary board state
    const tempState = new GameState();
    
    // Replay moves up to this index
    for (let i = 0; i < index; i++) {
      const move = this.gameState.moveHistory[i];
      tempState.makeMove(
        move.from.row, move.from.col,
        move.to.row, move.to.col
      );
    }
    
    // Render this board state
    this.renderer.render(tempState.board);
    this.updateReplayUI(index);
  }
  
  nextMove() {
    if (this.replayIndex < this.gameState.moveHistory.length) {
      this.replayIndex++;
      this.renderMoveAtIndex(this.replayIndex);
    }
  }
  
  prevMove() {
    if (this.replayIndex > 0) {
      this.replayIndex--;
      this.renderMoveAtIndex(this.replayIndex);
    }
  }
  
  jumpToStart() {
    this.replayIndex = 0;
    this.renderMoveAtIndex(0);
  }
  
  jumpToCurrent() {
    this.replayIndex = this.gameState.moveHistory.length;
    this.renderMoveAtIndex(this.replayIndex);
  }
  
  autoPlay(speed = 1000) {
    this.autoPlayInterval = setInterval(() => {
      if (this.replayIndex < this.gameState.moveHistory.length) {
        this.nextMove();
      } else {
        this.stopAutoPlay();
      }
    }, speed);
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  exitReplay() {
    this.isReplaying = false;
    this.stopAutoPlay();
    this.jumpToCurrent();
    this.hideReplayControls();
  }
  
  updateReplayUI(index) {
    document.getElementById('replay-position').textContent = 
      `Move ${index} of ${this.gameState.moveHistory.length}`;
    
    // Highlight the current move in history
    if (index > 0) {
      const move = this.gameState.moveHistory[index - 1];
      document.getElementById('current-move-display').textContent = 
        `${index}. ${move.notation}`;
    }
  }
}
```

**Replay UI in index.html:**
```html
<!-- Replay Controls (shown when in replay mode) -->
<div id="replay-controls" class="replay-controls" style="display: none;">
  <div class="replay-info">
    <span id="replay-position">Move 0 of 10</span>
    <span id="current-move-display"></span>
  </div>
  <div class="replay-buttons">
    <button id="replay-start" class="btn-replay" title="Jump to start">⏮️</button>
    <button id="replay-prev" class="btn-replay" title="Previous move">◀️</button>
    <button id="replay-play" class="btn-replay" title="Auto-play">▶️</button>
    <button id="replay-pause" class="btn-replay" title="Pause" style="display: none;">⏸️</button>
    <button id="replay-next" class="btn-replay" title="Next move">▶️</button>
    <button id="replay-end" class="btn-replay" title="Jump to current">⏭️</button>
  </div>
  <button id="replay-exit" class="btn-secondary">Exit Replay</button>
</div>

<!-- Replay button (shown when game has moves) -->
<button id="replay-btn" class="btn-secondary">🎬 Replay Game</button>
```

**CSS for replay controls:**
```css
.replay-controls {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}

.replay-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: white;
  font-size: 0.9rem;
}

.replay-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-replay {
  padding: 0.5rem 0.75rem;
  font-size: 1.2rem;
  min-width: 44px;
  background-color: #454442;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-replay:active {
  transform: scale(0.95);
}

.btn-replay:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**User Flow:**
1. Receive game link via SMS: `chess.523.life/g/e4-e5-Nf3-Nc6-Bb5`
2. Tap link → PWA opens → see current board state (after 5 moves)
3. Tap "🎬 Replay Game" button
4. Board jumps to starting position
5. Tap "▶️" to step through moves one-by-one
6. OR tap "▶️ Auto-play" to watch all moves
7. Study the game flow and opponent's strategy
8. Tap "Exit Replay" → back to current position
9. Make your move!

**Why This is Essential:**
- ♟️ Understand opponent's strategy before responding
- 🧠 See the full context, not just current position
- 📚 Learn from reviewing completed games
- 🎯 Make better decisions with full information
- 🎬 Share impressive games with friends

#### 2.1 Board Rendering
- [ ] Canvas-based board rendering (following Blockdoku pattern)
- [ ] Render 8x8 grid with alternating colors
- [ ] Render chess pieces (Unicode symbols or SVG)
- [ ] Responsive sizing (fill viewport appropriately)
- [ ] Theme support (classic wood, modern, dark)

```javascript
// board-renderer.js
class BoardRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.squareSize = 0;
    this.setupCanvas();
  }
  
  setupCanvas() {
    // Responsive sizing
    const container = this.canvas.parentElement;
    const size = Math.min(container.clientWidth, container.clientHeight);
    this.canvas.width = size;
    this.canvas.height = size;
    this.squareSize = size / 8;
  }
  
  render(board, highlightSquares = []) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        this.drawSquare(row, col, highlightSquares);
        const piece = board.getPiece(row, col);
        if (piece) {
          this.drawPiece(piece, row, col);
        }
      }
    }
  }
  
  drawSquare(row, col, highlightSquares) {
    const x = col * this.squareSize;
    const y = row * this.squareSize;
    
    // Alternating colors
    const isLight = (row + col) % 2 === 0;
    this.ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
    
    // Highlight if selected or valid move
    if (highlightSquares.some(s => s.row === row && s.col === col)) {
      this.ctx.fillStyle = '#baca44';
    }
    
    this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
  }
  
  drawPiece(piece, row, col) {
    const x = col * this.squareSize + this.squareSize / 2;
    const y = row * this.squareSize + this.squareSize / 2;
    
    // Use Unicode chess symbols
    const symbols = {
      'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
      'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
    };
    
    this.ctx.font = `${this.squareSize * 0.7}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = piece[0] === 'w' ? '#ffffff' : '#000000';
    this.ctx.strokeStyle = piece[0] === 'w' ? '#000000' : '#ffffff';
    this.ctx.lineWidth = 2;
    
    this.ctx.strokeText(symbols[piece], x, y);
    this.ctx.fillText(symbols[piece], x, y);
  }
}
```

#### 2.2 Touch & Mouse Interaction
- [ ] Universal event handling (touch + mouse, following Blockdoku pattern)
- [ ] Tap to select piece → show valid moves → tap destination
- [ ] Drag & drop support for desktop
- [ ] Highlight selected piece and valid moves
- [ ] Visual feedback for illegal moves
- [ ] Undo button

```javascript
// drag-drop.js - Universal touch/mouse handling
class MoveInput {
  constructor(canvas, gameState, renderer) {
    this.canvas = canvas;
    this.gameState = gameState;
    this.renderer = renderer;
    this.selectedSquare = null;
    this.validMoves = [];
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Both touch and mouse events
    this.canvas.addEventListener('mousedown', this.handleStart.bind(this));
    this.canvas.addEventListener('touchstart', this.handleStart.bind(this), {passive: false});
    
    this.canvas.addEventListener('mouseup', this.handleEnd.bind(this));
    this.canvas.addEventListener('touchend', this.handleEnd.bind(this), {passive: false});
  }
  
  handleStart(e) {
    e.preventDefault();
    const pos = this.getSquareFromEvent(e);
    
    if (this.selectedSquare) {
      // Check if clicking a valid move destination
      const isValidMove = this.validMoves.some(
        m => m.row === pos.row && m.col === pos.col
      );
      
      if (isValidMove) {
        // Make the move
        this.gameState.makeMove(
          this.selectedSquare.row, this.selectedSquare.col,
          pos.row, pos.col
        );
        this.selectedSquare = null;
        this.validMoves = [];
      } else if (this.gameState.board.getPiece(pos.row, pos.col)) {
        // Select different piece
        this.selectSquare(pos);
      } else {
        // Deselect
        this.selectedSquare = null;
        this.validMoves = [];
      }
    } else {
      // Select piece
      this.selectSquare(pos);
    }
    
    this.renderer.render(this.gameState.board, this.getHighlightSquares());
  }
  
  selectSquare(pos) {
    const piece = this.gameState.board.getPiece(pos.row, pos.col);
    if (piece && piece[0] === this.gameState.currentTurn[0]) {
      this.selectedSquare = pos;
      this.validMoves = PieceRules.getPossibleMoves(
        this.gameState.board, pos.row, pos.col
      );
    }
  }
  
  getSquareFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const col = Math.floor(x / (this.canvas.width / 8));
    const row = Math.floor(y / (this.canvas.height / 8));
    
    return {row, col};
  }
  
  getHighlightSquares() {
    const squares = [];
    if (this.selectedSquare) {
      squares.push(this.selectedSquare);
      squares.push(...this.validMoves);
    }
    return squares;
  }
}
```

#### 2.3 UI Polish
- [ ] Move history display (list of moves in algebraic notation)
- [ ] Captured pieces display
- [ ] Current turn indicator
- [ ] Check/Checkmate notifications
- [ ] Settings button → settings.html page
- [ ] New game button with confirmation

**Success Criteria:** Smooth touch interaction, beautiful UI, works on mobile and desktop

---

### **Phase 4: URL-Based Game Sharing** (2-3 days)
*The magic multiplayer feature*

#### 3.1 URL Encoding Strategy

**THE CHALLENGE:** Keep URLs short enough for SMS and messaging apps!

**KEY INSIGHT:** You don't need to send the ENTIRE game every time - just the latest move!

**Two URL Formats:**

### Format 1: Single Move (Regular Turns) - ULTRA SHORT! 🎯

**Use during active play** - just share your latest move:

```
chess.523.life/m/[game-id][move][?msg=text]

Examples:
chess.523.life/m/x7pqAB                (26 chars) ✅✅✅
chess.523.life/m/x7pqCd                (26 chars) ✅✅✅
chess.523.life/m/x7pqAB?msg=GoodMove   (41 chars) ✅✅ with comment!
chess.523.life/m/x7pqCd?msg=Oops       (37 chars) ✅✅ with comment!
```

**Optional message parameter:**
- Query param: `?msg=` (5 chars overhead)
- Message: URL-encoded text (limit: 20 chars recommended)
- Total with message: ~46 chars max
- **XSS-safe by design** (see security section below)

**Encoding breakdown:**
- Base URL: `chess.523.life/m/` (18 chars) - fixed
- Game ID: 4 chars (base36: a-z,0-9)
- Move: 2 chars (base64 encoded binary)
- **Total: 24-26 characters! 🔥**

**Move encoding (2 chars via base64):**
```
Single move = 14 bits:
- From square: 6 bits (0-63 for a1-h8)
- To square: 6 bits (0-63)
- Special flags: 2 bits (promotion/castle/en passant)

14 bits → 2 bytes → 2-3 base64 chars

Example:
e2e4: from=52, to=36, flags=00
→ binary: 110100 100100 00
→ base64: "AB"
→ URL: chess.523.life/m/x7pqAB
```

**Game ID (4 chars):**
- Base36 encoding (0-9, a-z)
- 36^4 = 1,679,616 unique games
- Collision probability: negligible for casual play

**How it works:**
1. Both players store **full game history** locally (key: game-id)
2. Each turn, send only the **NEW move** (2 chars!)
3. Receiver loads local game + appends new move
4. Ultra-short URLs for entire game!

**Local Storage maintains:**
- Complete move history for entire game
- Full replay capability at any time
- Can export full game state anytime for sharing/backup
- If local storage lost, request `/g/` URL for full resync

**Total: ~26 characters per turn! ✅✅✅**

**Character savings:**
| Encoding | Chars/Move | Example | Total URL |
|----------|------------|---------|-----------|
| Algebraic (e4) | 2-4 | e4 | 35-40 chars |
| Coordinate (e2e4) | 4 | e2e4 | 39 chars |
| **Binary + Base64** | **2-3** | **AB** | **~26 chars** ✅ |

### Format 2: Full Game State (Replay/Share Complete Games)

**Maximum compression - no external services needed!**

```
chess.523.life/g/[compressed-binary]

Examples (length grows with game):
chess.523.life/g/Aa7       (22 chars) - 1 move
chess.523.life/g/Aa7Bc8De  (28 chars) - 3 moves
chess.523.life/g/Aa7Bc...  (60 chars) - 20 moves
chess.523.life/g/Aa7Bc...  (140 chars) - 80 moves ✅
```

**Ultra-compact binary encoding:**
```
Each move = 12 bits (NOT 14!):
- From square: 6 bits (0-63 for 8×8 board)
- To square: 6 bits (0-63)
- Special moves detected from context (no flag bits needed!)

Castling: Detected when king moves 2 squares
En passant: Detected when pawn captures empty square
Promotion: Detected when pawn reaches rank 1/8
  → Promotion piece: next 2 bits (Q=00, R=01, B=10, N=11)

12 bits per move × 80 moves = 960 bits = 120 bytes
Base64 encoding: 120 bytes → 160 chars
Base URL: 22 chars
Total: ~180 chars for full 80-move game ✅
```

**Even shorter with base85:**
```
Base85 (instead of base64) = 20% more efficient
120 bytes → base85 → ~134 chars
Total: ~156 chars for 80-move game! ✅✅
```

**Our own encoding (pure JS, no libraries):**
```javascript
// Custom base85 encoding - no external dependencies!
const BASE85_CHARS = 
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~';

function encodeBase85(bytes) {
  let result = '';
  for (let i = 0; i < bytes.length; i += 4) {
    // Process 4 bytes at a time
    let value = 0;
    for (let j = 0; j < 4 && i + j < bytes.length; j++) {
      value = (value << 8) | bytes[i + j];
    }
    
    // Convert to 5 base85 digits
    for (let k = 0; k < 5; k++) {
      result = BASE85_CHARS[value % 85] + result;
      value = Math.floor(value / 85);
    }
  }
  return result;
}
```

**Final URL lengths:**

| Moves | Binary | Base85 | URL Length |
|-------|--------|--------|------------|
| 1 | 12 bits | 2 chars | 24 chars |
| 5 | 60 bits | 9 chars | 31 chars |
| 20 | 240 bits | 36 chars | 58 chars |
| 40 | 480 bits | 72 chars | 94 chars |
| 80 | 960 bits | 134 chars | **156 chars** ✅ |

**SMS-friendly for most games!** Average game (40 moves) = ~94 chars total

**Complete Workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│ PLAYER 1                    VS                    PLAYER 2  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. New Game                                                  │
│    ↓                                                          │
│    Generates game ID: "abc123"                               │
│    Local: game-abc123 → []                                   │
│    Makes move: e4                                            │
│    Local: game-abc123 → [e4]                                 │
│    ↓                                                          │
│    SMS: chess.523.life/m/x7pqAB  (26 chars) ────────────→  │
│                                                        ↓      │
│                                                   Opens URL  │
│                                      Local: game-x7pq → [e2e4]│
│                                                   Makes move: e5│
│                                      Local: game-x7pq → [e2e4,e7e5]│
│    ←───────────── SMS: chess.523.life/m/x7pqCd (26 chars)   │
│    ↓                                                          │
│    Opens URL                                                  │
│    Local: game-x7pq → [e2e4,e7e5]                            │
│    Makes move: Nf3                                           │
│    Local: game-x7pq → [e2e4,e7e5,g1f3]                       │
│    ↓                                                          │
│    ... game continues ...                                    │
│    (Each turn = 26 char URL!)                                │
│                                                               │
│ 2. Anytime During Game                                       │
│    ↓                                                          │
│    Tap "🎬 Replay" → Watch all moves from local storage      │
│    (Both players can do this independently)                  │
│                                                               │
│ 3. Game Ends (Checkmate!)                                    │
│    ↓                                                          │
│    Tap "Share Full Game"                                     │
│    Generates: chess.523.life/g/AaBb...Zz (210 chars)         │
│    ↓                                                          │
│    Share on Twitter/Reddit/Friend ──────────────────────→   │
│                                                        ↓      │
│                                             Anyone can watch! │
│                                             Full replay!      │
│                                                               │
│ 4. Lost Local Storage? (Rare)                               │
│    ↓                                                          │
│    SMS opponent: "Send full game link?"                      │
│    ←────────── chess.523.life/g/AaBb...Zz                   │
│    ↓                                                          │
│    Resynced! Continue playing with /m/ URLs                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**URL Length Comparison:**

| Scenario | Format | URL Length | SMS-Safe? |
|----------|--------|------------|-----------|
| **Each turn (active play)** | `/m/x7pqAB` | **~26 chars** | ✅✅✅ **Perfect!** |
| Start new game | Full state | ~24 chars | ✅✅✅ Perfect! |
| Mid-game (20 moves) | Full state | ~58 chars | ✅✅✅ Great! |
| **Average game (40 moves)** | **Full state** | **~94 chars** | ✅✅✅ **Great!** |
| Full game (80 moves) | Full state | ~156 chars | ✅✅ Good! |
| Epic game (120 moves) | Full state | ~222 chars | ✅ OK! |

**Key Benefits:**
- 💬 **Ultra SMS-friendly** - 26 chars per turn, ~46 with message, ~94 for full game
- 💾 **Full history** - Both players have complete game locally  
- 🎬 **Instant replay** - No network needed, stored locally
- 🌐 **Share anywhere** - Generate full game link after completion
- 🔄 **Resync** - Can recover from lost storage
- ⚡ **Fast** - Minimal data transfer per turn
- 🚫 **No external dependencies** - Pure JS, no URL shortener services
- 🔒 **Privacy** - Everything client-side, no server tracking
- 💭 **Comments** - Add short messages with moves (XSS-safe)

```javascript
// url-encoder.js - ULTRA-COMPACT ENCODING (No external dependencies!)
class URLEncoder {
  /**
   * Encode game state to ultra-compact Base85 URL
   * Target: ~156 chars for 80 moves (SMS-friendly!)
   */
  static encodeGameState(gameState) {
    const moves = gameState.moveHistory;
    const totalBits = this.calculateBitsNeeded(moves);
    const totalBytes = Math.ceil(totalBits / 8);
    
    // Create byte array
    const bytes = new Uint8Array(totalBytes);
    let bitOffset = 0;
    
    for (const move of moves) {
      const encoded = this.encodeMoveCompact(move);
      const numBits = move.promotion ? 14 : 12; // 12 bits normally, 14 with promotion
      this.writeBits(bytes, bitOffset, encoded, numBits);
      bitOffset += numBits;
    }
    
    // Convert to Base85 (more efficient than Base64)
    return this.bytesToBase85(bytes);
  }
  
  /**
   * Encode a single move into 12 bits (or 14 with promotion):
   * - From square: 6 bits (0-63)
   * - To square: 6 bits (0-63)
   * - Special moves auto-detected from context!
   * - Promotion: +2 bits (Q=00, R=01, B=10, N=11)
   */
  static encodeMoveCompact(move) {
    const fromSquare = move.from.row * 8 + move.from.col; // 0-63
    const toSquare = move.to.row * 8 + move.to.col; // 0-63
    
    if (move.promotion) {
      // 14 bits: [from:6][to:6][piece:2]
      const pieceMap = { 'Q': 0, 'R': 1, 'B': 2, 'N': 3 };
      const piece = pieceMap[move.promotion] || 0;
      return (fromSquare << 8) | (toSquare << 2) | piece;
    }
    
    // 12 bits: [from:6][to:6]
    // Castling, en passant detected during decode from move pattern
    return (fromSquare << 6) | toSquare;
  }
  
  calculateBitsNeeded(moves) {
    return moves.reduce((total, move) => total + (move.promotion ? 14 : 12), 0);
  }
  
  /**
   * Write bits to byte array at given offset
   */
  static writeBits(bytes, bitOffset, value, numBits) {
    for (let i = numBits - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      const byteIndex = Math.floor(bitOffset / 8);
      const bitIndex = 7 - (bitOffset % 8);
      
      if (bit) {
        bytes[byteIndex] |= (1 << bitIndex);
      }
      
      bitOffset++;
    }
  }
  
  /**
   * Convert bytes to URL-safe Base64
   * Uses - instead of + and _ instead of /
   */
  static bytesToBase64URL(bytes) {
    // Standard Base64
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    let base64 = btoa(binary);
    
    // Make URL-safe
    base64 = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''); // Remove padding
    
    return base64;
  }
  
  /**
   * Human-readable format (for debugging)
   * Returns algebraic notation
   */
  static encodeGameStateReadable(gameState) {
    return gameState.moveHistory
      .map(move => this.moveToAlgebraic(move))
      .join('-');
  }
  
  static moveToAlgebraic(move) {
    const from = this.squareToAlgebraic(move.from.row, move.from.col);
    const to = this.squareToAlgebraic(move.to.row, move.to.col);
    return `${from}${to}`; // e.g., "e2e4"
  }
  
  static squareToAlgebraic(row, col) {
    const file = String.fromCharCode(97 + col); // 'a' + col
    const rank = 8 - row;
    return `${file}${rank}`;
  }
}
```

```javascript
// url-decoder.js
class URLDecoder {
  static decodeGameState(encodedMoves) {
    const gameState = new GameState(); // Fresh game
    const moves = encodedMoves.split('-');
    
    for (const algebraicMove of moves) {
      const move = this.parseAlgebraicMove(algebraicMove, gameState);
      if (move) {
        gameState.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
      }
    }
    
    return gameState;
  }
  
  static parseAlgebraicMove(algebraic, gameState) {
    // Parse algebraic notation back to coordinates
    // This is more complex due to ambiguity resolution
    // e.g., "Nf3" - which knight moves to f3?
    
    const isCapture = algebraic.includes('x');
    const moveText = algebraic.replace('x', '');
    
    let piece, toSquare;
    if (/^[a-h][1-8]$/.test(moveText)) {
      // Pawn move (no piece letter)
      piece = 'P';
      toSquare = moveText;
    } else {
      piece = moveText[0];
      toSquare = moveText.slice(-2);
    }
    
    const to = this.algebraicToSquare(toSquare);
    const from = this.findPiecePosition(piece, to, gameState);
    
    return {
      fromRow: from.row,
      fromCol: from.col,
      toRow: to.row,
      toCol: to.col
    };
  }
  
  static algebraicToSquare(algebraic) {
    const file = algebraic[0].charCodeAt(0) - 97; // 'a' = 0
    const rank = parseInt(algebraic[1]);
    return {
      row: 8 - rank,  // rank 8 = row 0
      col: file
    };
  }
  
  static findPiecePosition(pieceType, toSquare, gameState) {
    // Find which piece of this type can move to toSquare
    const color = gameState.currentTurn[0];
    const piece = color + pieceType;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (gameState.board.getPiece(row, col) === piece) {
          const validMoves = PieceRules.getPossibleMoves(
            gameState.board, row, col
          );
          if (validMoves.some(m => m.row === toSquare.row && m.col === toSquare.col)) {
            return {row, col};
          }
        }
      }
    }
    
    return null; // Should never happen with valid input
  }
}
```

#### 3.2 Share Manager (with XSS-Safe Messages)

```javascript
// share-manager.js
class ShareManager {
  constructor(gameState) {
    this.gameState = gameState;
  }
  
  /**
   * Share next move (regular turns) - ULTRA SHORT URL (~26 chars, ~46 with message)
   */
  async shareNextMove(lastMove, message = null) {
    const gameId = this.gameState.gameId || this.generateGameId();
    const encodedMove = this.encodeMoveCompact(lastMove); // 2-3 chars base64
    let shortURL = `${window.location.origin}/m/${gameId}${encodedMove}`;
    
    // Add optional message (sanitized!)
    if (message) {
      const safeMsg = this.sanitizeMessage(message);
      shortURL += `?msg=${encodeURIComponent(safeMsg)}`;
    }
    
    // Examples: 
    // chess.523.life/m/x7pqAB (26 chars)
    // chess.523.life/m/x7pqAB?msg=GoodMove (41 chars)
    
    return this.doShare({
      title: 'Chess - Your Move!',
      text: message ? `Your turn! "${message}"` : `Your turn!`,
      url: shortURL
    });
  }
  
  /**
   * Sanitize message - CRITICAL for XSS prevention!
   * Limit length and remove dangerous characters
   */
  sanitizeMessage(message) {
    if (!message) return '';
    
    // 1. Limit length (keep URLs short)
    message = message.slice(0, 20);
    
    // 2. Remove ALL HTML/script characters
    message = message
      .replace(/[<>\"'`]/g, '') // Remove HTML chars
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
    
    // 3. Keep only safe alphanumeric + basic punctuation
    message = message.replace(/[^a-zA-Z0-9\s\!\?\.\,\-]/g, '');
    
    // 4. Trim whitespace
    return message.trim();
  }
  
  /**
   * Share full game state (for replay/resync) - LONGER URL
   */
  async shareFullGame() {
    const encodedState = URLEncoder.encodeGameState(this.gameState);
    const fullURL = `${window.location.origin}/g/${encodedState}`;
    
    // Example: chess.523.life/g/AaBbCc1DeEfF2...
    
    const isFinished = this.gameState.gameStatus === 'checkmate';
    return this.doShare({
      title: isFinished ? 'Chess Game Complete!' : 'Chess Game',
      text: isFinished ? 
        `Check out this game! ${this.gameState.moveHistory.length} moves.` :
        `Continue our chess game!`,
      url: fullURL
    });
  }
  
  /**
   * Generate short game ID (6 chars)
   */
  generateGameId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }
  
  /**
   * Encode single move to compact notation
   */
  encodeMove(move) {
    // Simple coordinate notation: e2e4
    const from = this.squareToAlgebraic(move.from.row, move.from.col);
    const to = this.squareToAlgebraic(move.to.row, move.to.col);
    return `${from}${to}`; // 4 chars
  }
  
  squareToAlgebraic(row, col) {
    const file = String.fromCharCode(97 + col); // 'a' + col
    const rank = 8 - row;
    return `${file}${rank}`;
  }
  
  /**
   * Actual sharing logic (Web Share API or clipboard)
   */
  async doShare(options) {
    // Use Web Share API if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share(options);
        return true;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
    
    // Fallback: copy to clipboard
    await this.copyToClipboard(options.url);
    this.showNotification('Link copied to clipboard!');
    return true;
  }
  
  async copyToClipboard(text) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // Generate QR code for easy scanning (optional)
  generateQRCode(url) {
    // Use qrcodejs library or similar
    // Store in /public/libs/ for offline support
  }
}
```

#### 3.3 URL Routing (with XSS-Safe Message Display)

```javascript
// app.js - Handle incoming game URLs with safe message display
class ChessApp {
  constructor() {
    this.gameState = null;
    this.renderer = null;
    this.moveInput = null;
    this.messageDisplay = new MessageDisplay(); // XSS-safe message handler
    
    this.init();
  }
  
  init() {
    // Check if loading a shared game
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    // Handle single move URLs: /m/x7pqAB?msg=GoodMove
    const moveMatch = path.match(/\/m\/([a-z0-9]{4})([A-Za-z0-9_-]{2,3})/);
    if (moveMatch) {
      const gameId = moveMatch[1];
      const encodedMove = moveMatch[2];
      
      // Load existing game from local storage
      this.gameState = this.storage.loadGame(gameId) || new GameState();
      this.gameState.gameId = gameId;
      
      // Decode and apply the new move
      const move = URLDecoder.decodeSingleMove(encodedMove);
      this.gameState.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
      
      // Display opponent's message (XSS-SAFE!)
      if (params.has('msg')) {
        const rawMessage = params.get('msg');
        this.messageDisplay.showOpponentMessage(rawMessage);
      }
      
      this.showNotification(`${this.gameState.currentTurn} to move.`);
    }
    
    // Handle full game URLs: /g/AaBbCc...
    const gameMatch = path.match(/\/g\/([A-Za-z0-9!#$%&()*+\-;<=>?@^_`{|}~]+)/);
    if (gameMatch) {
      const encodedMoves = gameMatch[1];
      this.gameState = URLDecoder.decodeGameState(encodedMoves);
      
      // Display game comment if present (XSS-SAFE!)
      if (params.has('msg')) {
        const rawMessage = params.get('msg');
        this.messageDisplay.showGameComment(rawMessage);
      }
      
      this.showNotification(`Loaded game. ${this.gameState.currentTurn} to move.`);
    }
    
    // Default: new game
    if (!this.gameState) {
      this.gameState = new GameState();
    }
    
    // Initialize UI
    this.renderer = new BoardRenderer('chess-board');
    this.moveInput = new MoveInput(
      this.renderer.canvas,
      this.gameState,
      this.renderer
    );
    
    // Initial render
    this.render();
    
    // Set up share button with message input
    document.getElementById('share-btn').addEventListener('click', () => {
      this.showShareDialog();
    });
  }
  
  showShareDialog() {
    // Show dialog with optional message input
    const message = prompt('Add a message? (optional, 20 chars max)');
    this.shareManager.shareNextMove(this.gameState.lastMove, message);
  }
  
  render() {
    this.renderer.render(this.gameState.board);
    this.updateUI();
  }
  
  updateUI() {
    // Update turn indicator
    document.getElementById('current-turn').textContent = 
      `${this.gameState.currentTurn} to move`;
    
    // Update move history
    const historyEl = document.getElementById('move-history');
    historyEl.innerHTML = this.gameState.moveHistory
      .map((move, idx) => `<div>${idx + 1}. ${move.notation}</div>`)
      .join('');
    
    // Update game status
    if (this.gameState.gameStatus !== 'active') {
      this.showNotification(this.gameState.gameStatus.toUpperCase());
    }
  }
}

/**
 * XSS-SAFE Message Display Handler
 * CRITICAL: Never use innerHTML with user input!
 */
class MessageDisplay {
  constructor() {
    this.messageContainer = document.getElementById('opponent-message');
  }
  
  /**
   * Display opponent's message - XSS SAFE
   */
  showOpponentMessage(rawMessage) {
    if (!rawMessage || !this.messageContainer) return;
    
    // STEP 1: Sanitize (defense in depth)
    const safe = this.sanitize(rawMessage);
    
    // STEP 2: Use textContent (NOT innerHTML!) - prevents XSS
    const messageEl = document.createElement('div');
    messageEl.className = 'opponent-message';
    messageEl.textContent = `Opponent says: "${safe}"`; // textContent is XSS-safe
    
    // Clear previous messages
    this.messageContainer.innerHTML = '';
    this.messageContainer.appendChild(messageEl);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }
  
  /**
   * Display game comment - XSS SAFE
   */
  showGameComment(rawMessage) {
    if (!rawMessage) return;
    
    const safe = this.sanitize(rawMessage);
    const commentEl = document.createElement('div');
    commentEl.className = 'game-comment';
    commentEl.textContent = safe; // textContent is XSS-safe
    
    document.getElementById('game-info').appendChild(commentEl);
  }
  
  /**
   * Sanitize message - multiple layers of defense
   */
  sanitize(message) {
    if (!message || typeof message !== 'string') return '';
    
    // 1. Length limit
    message = message.slice(0, 20);
    
    // 2. Remove dangerous characters
    message = message
      .replace(/[<>\"'`]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
    
    // 3. Whitelist safe characters only
    message = message.replace(/[^a-zA-Z0-9\s\!\?\.\,\-]/g, '');
    
    // 4. Trim
    return message.trim();
  }
}

// Initialize app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new ChessApp();
});
```

#### 3.4 URL Shortening (Optional but Recommended)

**Option 1: Use a URL shortening service**
- TinyURL API (free tier available)
- Bit.ly API
- Your own shortener (minimal backend)

**Option 2: Base64 compression**
```javascript
// Ultra-compact encoding using base64
static encodeCompact(gameState) {
  // Use move indices instead of algebraic notation
  // Even more compact!
  const binary = gameState.moveHistory.map(move => {
    return (move.from.row << 9) | (move.from.col << 6) | 
           (move.to.row << 3) | move.to.col;
  });
  
  // Convert to base64
  const bytes = new Uint16Array(binary);
  return btoa(String.fromCharCode(...new Uint8Array(bytes.buffer)));
}
```

**Success Criteria:** Can share game via SMS, recipient opens link and sees exact board state

---

### **Phase 4.5: Security Hardening** 🔒
*CRITICAL: Protect against malicious URLs*

#### Additional Security Concerns & Mitigations

**1. Game State Validation (Poisoning Attack)**
```javascript
// validation.js - CRITICAL: Validate decoded game state
class GameValidator {
  /**
   * Validate that a decoded game state is legal
   * Prevents malicious URLs with impossible positions
   */
  static validateGameState(gameState) {
    // 1. Check board integrity
    if (!this.isValidBoardState(gameState.board)) {
      throw new Error('Invalid board state detected');
    }
    
    // 2. Check move history is legal
    if (!this.isLegalMoveSequence(gameState.moveHistory)) {
      throw new Error('Illegal move sequence detected');
    }
    
    // 3. Check piece counts (can't have 10 queens!)
    if (!this.isValidPieceCount(gameState.board)) {
      throw new Error('Invalid piece count detected');
    }
    
    return true;
  }
  
  static isValidBoardState(board) {
    // Must have exactly one king per side
    let whiteKings = 0, blackKings = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece === 'wK') whiteKings++;
        if (piece === 'bK') blackKings++;
      }
    }
    
    return whiteKings === 1 && blackKings === 1;
  }
  
  static isValidPieceCount(board) {
    const counts = { w: 0, b: 0, wQ: 0, bQ: 0, wP: 0, bP: 0 };
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece) continue;
        
        const color = piece[0];
        const type = piece[1];
        
        counts[color]++;
        if (type === 'Q') counts[color + 'Q']++;
        if (type === 'P') counts[color + 'P']++;
      }
    }
    
    // Maximum 16 pieces per side
    // Maximum 9 queens per side (1 + 8 promotions)
    // Maximum 8 pawns per side
    return counts.w <= 16 && counts.b <= 16 &&
           counts.wQ <= 9 && counts.bQ <= 9 &&
           counts.wP <= 8 && counts.bP <= 8;
  }
  
  static isLegalMoveSequence(moveHistory) {
    // Replay all moves from start and verify each is legal
    const testState = new GameState();
    
    for (const move of moveHistory) {
      if (!testState.isLegalMove(move.from, move.to)) {
        return false;
      }
      testState.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
    }
    
    return true;
  }
}
```

**2. Replay Attack Prevention**
```javascript
// Check move hasn't already been applied
class GameState {
  applySharedMove(move, gameId) {
    // Load local game
    const localGame = this.storage.loadGame(gameId);
    
    // Check if this move was already applied
    const lastLocalMove = localGame.moveHistory[localGame.moveHistory.length - 1];
    if (this.movesEqual(lastLocalMove, move)) {
      console.warn('Duplicate move detected - already applied');
      return false; // Don't apply twice
    }
    
    // Validate move is for correct turn
    if (!this.isCorrectTurn(move, localGame)) {
      throw new Error('Move out of sequence');
    }
    
    return true;
  }
  
  movesEqual(move1, move2) {
    return move1?.from.row === move2?.from.row &&
           move1?.from.col === move2?.from.col &&
           move1?.to.row === move2?.to.row &&
           move1?.to.col === move2?.to.col;
  }
}
```

**3. Resource Exhaustion (DoS Attack)**
```javascript
// Limit move count and game count
class URLDecoder {
  static decodeGameState(encodedMoves) {
    const bytes = this.base85ToBytes(encodedMoves);
    
    // SECURITY: Limit maximum move count
    const maxMoves = 300; // ~150 moves per side (very long game)
    const estimatedMoves = (bytes.length * 8) / 12;
    
    if (estimatedMoves > maxMoves) {
      throw new Error('Game too long - possible DoS attack');
    }
    
    // Decode with limits...
  }
}

// Limit stored games
class GameStorage {
  saveGame(gameState, gameId) {
    const games = this.getAllGames();
    
    // SECURITY: Limit total stored games (prevent localStorage exhaustion)
    const maxGames = 100;
    if (games.length >= maxGames) {
      // Remove oldest games
      games.sort((a, b) => a.date - b.date);
      games.splice(0, games.length - maxGames + 1);
    }
    
    // Save game...
  }
}
```

**4. URL Parsing Attack (Malformed Data)**
```javascript
// Robust error handling for malformed URLs
class URLDecoder {
  static decodeSingleMove(encodedMove) {
    try {
      // Validate format first
      if (!/^[A-Za-z0-9_-]{2,3}$/.test(encodedMove)) {
        throw new Error('Invalid move format');
      }
      
      const bytes = this.base64ToBytes(encodedMove);
      
      // Validate decoded values are in range
      const fromSquare = (bytes[0] >> 2) & 0x3F;
      const toSquare = ((bytes[0] & 0x03) << 4) | ((bytes[1] >> 4) & 0x0F);
      
      if (fromSquare > 63 || toSquare > 63) {
        throw new Error('Invalid square coordinates');
      }
      
      return { fromSquare, toSquare };
      
    } catch (error) {
      console.error('Failed to decode move:', error);
      // Show user-friendly error
      this.showError('Invalid game link - please check the URL');
      return null;
    }
  }
}
```

**5. Game ID Collision Attack**
```javascript
// Detect and handle game ID collisions
class GameStorage {
  createNewGame() {
    let gameId;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      gameId = this.generateGameId();
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error('Failed to generate unique game ID');
      }
    } while (this.gameExists(gameId));
    
    return gameId;
  }
  
  gameExists(gameId) {
    return localStorage.getItem(`chess_game_${gameId}`) !== null;
  }
}
```

**6. Phishing Protection (Domain Validation)**
```javascript
// Warn user if opening link from different domain
class SecurityManager {
  checkLinkOrigin() {
    const expectedOrigin = 'https://chess.523.life';
    
    if (window.location.origin !== expectedOrigin &&
        window.location.origin !== 'http://localhost:3458') {
      
      // Show warning banner
      this.showWarning(
        '⚠️ Warning: This link is not from the official Chess PWA. ' +
        'Only open chess links from trusted sources.'
      );
    }
  }
  
  showWarning(message) {
    const banner = document.createElement('div');
    banner.className = 'security-warning';
    banner.textContent = message;
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff9800;
      color: black;
      padding: 1rem;
      text-align: center;
      z-index: 9999;
      font-weight: bold;
    `;
    document.body.prepend(banner);
  }
}
```

**7. Privacy Considerations**
```javascript
// Don't leak sensitive data in URLs
class ShareManager {
  async shareNextMove(lastMove, message = null) {
    // Good: Only game state, no personal info
    const url = `${window.location.origin}/m/${gameId}${encodedMove}`;
    
    // Bad: Don't include:
    // - Player names
    // - Device IDs
    // - Timestamps (can be used for tracking)
    // - IP addresses
    // - Location data
    
    return this.doShare({ url });
  }
}
```

**8. Content Security Policy**
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:; 
               connect-src 'self';">
```

**9. Subresource Integrity (for any CDN assets)**
```html
<!-- If you MUST use external resources (you shouldn't!), use SRI -->
<script src="external-lib.js" 
        integrity="sha384-hash..." 
        crossorigin="anonymous"></script>
```

---

### Security Checklist

Before deploying:

- [ ] **Input validation** - All URL parameters validated and sanitized
- [ ] **Game state validation** - Impossible positions rejected
- [ ] **Move sequence validation** - Illegal moves rejected
- [ ] **Replay attack prevention** - Duplicate moves detected
- [ ] **Resource limits** - Max moves, max games enforced
- [ ] **Error handling** - Malformed URLs handled gracefully
- [ ] **XSS protection** - textContent only, never innerHTML
- [ ] **CSP headers** - Content Security Policy configured
- [ ] **No external dependencies** - All code self-contained
- [ ] **Privacy** - No personal data in URLs
- [ ] **Domain validation** - Warning for non-official domains
- [ ] **Rate limiting** - Prevent rapid-fire game creation
- [ ] **Storage quotas** - LocalStorage limits respected

---

**Key Principle:** 
> **"Never trust user input - even if it comes from your own PWA via URL!"**
> 
> A malicious user could craft URLs by hand, so validate everything!

---

### **Phase 5: Local Storage & Game History** (2-3 days)
*Remember games and allow replay*

#### 4.1 Game Storage
```javascript
// game-storage.js
class GameStorage {
  constructor() {
    this.storageKey = 'chess_games';
  }
  
  saveGame(gameState, name = null) {
    const games = this.getAllGames();
    const gameData = {
      id: Date.now(),
      name: name || `Game ${games.length + 1}`,
      moves: URLEncoder.encodeGameState(gameState),
      date: new Date().toISOString(),
      result: gameState.gameStatus,
      turns: gameState.moveHistory.length
    };
    
    games.push(gameData);
    localStorage.setItem(this.storageKey, JSON.stringify(games));
    return gameData.id;
  }
  
  getAllGames() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }
  
  getGame(id) {
    const games = this.getAllGames();
    return games.find(g => g.id === id);
  }
  
  deleteGame(id) {
    const games = this.getAllGames();
    const filtered = games.filter(g => g.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }
  
  // Auto-save current game
  autoSaveCurrentGame(gameState) {
    const currentGame = {
      moves: URLEncoder.encodeGameState(gameState),
      date: new Date().toISOString(),
      turn: gameState.currentTurn
    };
    localStorage.setItem('chess_current_game', JSON.stringify(currentGame));
  }
  
  loadCurrentGame() {
    const data = localStorage.getItem('chess_current_game');
    return data ? JSON.parse(data) : null;
  }
}
```

#### 4.2 Game History UI (game-history.html)
- [ ] List all saved games
- [ ] Show game metadata (date, turns, result)
- [ ] Replay game move-by-move
- [ ] Delete saved games
- [ ] Export game as PGN (optional)

**Success Criteria:** Games persist across sessions, can replay past games

---

### **Phase 6: Settings & Themes** (1-2 days)
*Polish and customization*

#### 5.1 Settings Page (settings.html)
Following Blockdoku pattern: settings is a separate PAGE, not a modal

```html
<!-- settings.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chess Settings</title>
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="" id="theme-css">
</head>
<body>
  <div class="settings-page">
    <header>
      <button id="back-btn" class="btn-back">← Back to Game</button>
      <h1>Settings</h1>
    </header>
    
    <main class="settings-content">
      <!-- Theme Selection -->
      <section class="settings-section">
        <h2>Board Theme</h2>
        <div class="theme-options">
          <button class="theme-option" data-theme="classic">
            <span class="theme-preview classic-preview"></span>
            <span>Classic</span>
          </button>
          <button class="theme-option" data-theme="modern">
            <span class="theme-preview modern-preview"></span>
            <span>Modern</span>
          </button>
          <button class="theme-option" data-theme="dark">
            <span class="theme-preview dark-preview"></span>
            <span>Dark</span>
          </button>
        </div>
      </section>
      
      <!-- Game Options -->
      <section class="settings-section">
        <h2>Game Options</h2>
        <label>
          <input type="checkbox" id="show-legal-moves" checked>
          Show Legal Moves
        </label>
        <label>
          <input type="checkbox" id="sound-effects" checked>
          Sound Effects
        </label>
        <label>
          <input type="checkbox" id="auto-save" checked>
          Auto-save Games
        </label>
      </section>
      
      <!-- Notation Style -->
      <section class="settings-section">
        <h2>Notation</h2>
        <select id="notation-style">
          <option value="algebraic">Algebraic (e4, Nf3)</option>
          <option value="long">Long Algebraic (e2-e4)</option>
          <option value="descriptive">Descriptive (P-K4)</option>
        </select>
      </section>
      
      <!-- PWA Install -->
      <section class="settings-section">
        <h2>Install App</h2>
        <p>Install Chess as a PWA for offline play and better performance.</p>
        <button id="install-btn" class="btn-primary">Install Chess</button>
      </section>
    </main>
  </div>
  
  <script type="module" src="js/settings.js"></script>
</body>
</html>
```

#### 5.2 Theme System
- [ ] Classic wood board theme
- [ ] Modern minimalist theme
- [ ] Dark mode theme
- [ ] Theme persistence in localStorage
- [ ] Smooth theme transitions

#### 5.3 Settings Persistence
```javascript
// settings.js
class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.applySettings();
  }
  
  loadSettings() {
    const defaults = {
      theme: 'classic',
      showLegalMoves: true,
      soundEffects: true,
      autoSave: true,
      notation: 'algebraic'
    };
    
    const saved = localStorage.getItem('chess_settings');
    return saved ? {...defaults, ...JSON.parse(saved)} : defaults;
  }
  
  saveSettings() {
    localStorage.setItem('chess_settings', JSON.stringify(this.settings));
  }
  
  applySettings() {
    // Apply theme
    this.applyTheme(this.settings.theme);
    
    // Update UI to match settings
    document.getElementById('show-legal-moves').checked = this.settings.showLegalMoves;
    document.getElementById('sound-effects').checked = this.settings.soundEffects;
    document.getElementById('auto-save').checked = this.settings.autoSave;
    document.getElementById('notation-style').value = this.settings.notation;
  }
  
  applyTheme(themeName) {
    const themeLink = document.getElementById('theme-css');
    themeLink.href = `css/themes/${themeName}.css`;
    document.body.className = `theme-${themeName}`;
  }
  
  updateSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }
}
```

**Success Criteria:** Settings persist, themes look great, smooth UX

---

### **Phase 7: PWA Enhancements** (2-3 days)
*Make it truly app-like*

#### 6.1 Service Worker Strategy
```javascript
// sw.js - Offline-first service worker
const CACHE_NAME = 'chess-v1.0.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/splash.html',
  '/settings.html',
  '/game-history.html',
  '/css/main.css',
  '/css/themes/classic.css',
  '/css/themes/modern.css',
  '/css/themes/dark.css',
  '/js/app.js',
  '/js/game/chess-engine.js',
  '/js/game/board.js',
  '/js/game/pieces.js',
  '/js/ui/board-renderer.js',
  '/js/sharing/url-encoder.js',
  '/js/sharing/share-manager.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('chess-') && name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - offline-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return cached version
        }
        
        // Not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(() => {
        // Network failed, return offline page if available
        return caches.match('/index.html');
      })
  );
});
```

#### 6.2 PWA Manifest
```json
{
  "name": "Chess - Offline Multiplayer",
  "short_name": "Chess",
  "description": "Play chess offline with SMS-based multiplayer",
  "start_url": "/splash.html",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#312e2b",
  "theme_color": "#769656",
  "categories": ["games", "board", "strategy"],
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "New Game",
      "short_name": "New Game",
      "description": "Start a new chess game",
      "url": "/?action=new-game",
      "icons": [
        {
          "src": "icons/icon-96x96.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

#### 6.3 Install Prompt
```javascript
// pwa/install.js
class PWAInstallManager {
  constructor() {
    this.deferredPrompt = null;
    this.setupInstallPrompt();
  }
  
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
    
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.hideInstallButton();
      this.showNotification('Chess installed successfully!');
    });
  }
  
  showInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.style.display = 'block';
      installBtn.addEventListener('click', () => this.promptInstall());
    }
  }
  
  hideInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  }
  
  async promptInstall() {
    if (!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    this.deferredPrompt = null;
  }
}
```

#### 6.4 Offline Detection
```javascript
// pwa/offline.js
class OfflineManager {
  constructor() {
    this.setupOfflineDetection();
  }
  
  setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.showNotification('Back online!', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.showNotification('Playing offline', 'info');
    });
    
    // Initial check
    if (!navigator.onLine) {
      this.showNotification('Playing offline', 'info');
    }
  }
  
  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }
}
```

**Success Criteria:** Works 100% offline, installs as native app, fast loading

---

### **Phase 8: Polish & Production** (2-3 days)
*Final touches*

#### 7.1 Sound Effects
- [ ] Move sound
- [ ] Capture sound
- [ ] Check sound
- [ ] Checkmate sound
- [ ] Store sounds locally (no CDN)

```javascript
// sound-manager.js (following Blockdoku pattern)
class SoundManager {
  constructor() {
    this.sounds = {
      move: new Audio('/sounds/move.mp3'),
      capture: new Audio('/sounds/capture.mp3'),
      check: new Audio('/sounds/check.mp3'),
      checkmate: new Audio('/sounds/checkmate.mp3')
    };
    
    this.enabled = this.loadSoundSetting();
  }
  
  playSound(soundName) {
    if (!this.enabled) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Sound play failed:', err));
    }
  }
  
  loadSoundSetting() {
    const settings = JSON.parse(localStorage.getItem('chess_settings') || '{}');
    return settings.soundEffects !== false;
  }
  
  toggle() {
    this.enabled = !this.enabled;
  }
}
```

#### 7.2 Animations
- [ ] Smooth piece movement animation
- [ ] Fade out for captured pieces
- [ ] Highlight last move
- [ ] Board flip animation

#### 7.3 Mobile Optimization
- [ ] Prevent zoom on double-tap
- [ ] Proper viewport scaling
- [ ] Touch target sizes (minimum 44px)
- [ ] Haptic feedback on moves (if supported)

```css
/* Mobile optimizations */
html {
  touch-action: manipulation; /* Prevent double-tap zoom */
  -webkit-tap-highlight-color: transparent;
}

.chess-board {
  touch-action: none; /* Prevent scrolling on board */
}

button, .clickable {
  min-height: 44px; /* iOS touch target minimum */
  min-width: 44px;
}
```

#### 7.4 Testing Checklist
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on desktop browsers
- [ ] Test offline functionality
- [ ] Test PWA installation
- [ ] Test share functionality
- [ ] Test URL routing
- [ ] Test all piece movements
- [ ] Test checkmate detection
- [ ] Test game saving/loading
- [ ] Test theme switching
- [ ] Performance audit (Lighthouse)

#### 7.5 Documentation
- [ ] README.md with screenshots
- [ ] How to play instructions
- [ ] Development setup guide
- [ ] Deployment instructions

**Success Criteria:** Production-ready, tested on all platforms, documented

---

### **Phase 9: Multi-Game Foundation** 🎮 (2-3 days)
*Refactor architecture to support multiple games*

**Goal:** Prepare codebase for Checkers (and future games) without breaking chess

**See:** `MULTI_GAME_ARCHITECTURE.md` for full details

#### 9.1 Game Engine Abstraction
```javascript
// games/game-engine-interface.js
export class GameEngine {
  newGame()
  makeMove(from, to)
  getLegalMoves(position)
  getGameStatus()
  getBoard()
  supportsAI()
  supportsTutorial()
}
```

#### 9.2 Directory Restructuring
```
src/
├── core/              # Universal (board, storage, sharing, UI)
├── games/
│   ├── chess/         # Move all chess-specific code here
│   └── game-registry.js
└── app.js             # Game-agnostic router
```

**Tasks:**
- [ ] Create `/core/` directory for universal components
- [ ] Move board renderer to `/core/board/`
- [ ] Move URL sharing to `/core/sharing/`
- [ ] Create `/games/chess/` and move chess logic
- [ ] Create game registry system
- [ ] Add game selector UI (hidden until multiple games)
- [ ] Test chess works identically after refactor

**Success Criteria:** Chess works exactly the same, but architecture supports multiple games

---

### **Phase 10: Checkers Implementation** 🔴 (5-7 days)
*Add Checkers as second game*

**Goal:** Launch with two complete games: Chess + Checkers

**See:** `CHECKERS_IMPLEMENTATION.md` for full details

#### 10.1 Checkers Game Engine (2 days)
- [ ] `CheckersBoard` class (32 playable squares)
- [ ] `CheckersPiece` (Regular, King)
- [ ] Move validation (diagonal only)
- [ ] Mandatory capture detection
- [ ] Chain jump logic
- [ ] Promotion to king
- [ ] Win/draw detection

#### 10.2 Checkers AI (2 days)
**Pure JavaScript minimax - no external libraries!**
- [ ] Minimax algorithm with alpha-beta pruning
- [ ] Board evaluation function
- [ ] Move ordering optimization
- [ ] 5 difficulty levels (depth 4, 6, 8, 10, 12)

#### 10.3 Checkers Tutorial (1 day)
- [ ] 7-lesson interactive tutorial
- [ ] Movement lesson
- [ ] Capture lesson
- [ ] Chain jump practice
- [ ] King promotion demo
- [ ] Mandatory capture lesson
- [ ] Win condition lesson

#### 10.4 URL Sharing (1 day)
```
chess.523.life/k/m/g4f2-14-21-30
              │ │  │    └─ Chain jump!
              │ │  └────── Game ID
              │ └───────── Move prefix
              └──────────── Game type (k = checkers)
```

#### 10.5 Integration & Polish (1 day)
- [ ] Add to game registry (`available: true`)
- [ ] Game selector dropdown
- [ ] Checkers piece rendering
- [ ] Theme support
- [ ] Test both games work together
- [ ] Test multi-game storage

**Success Criteria:** 
- Both chess and checkers fully playable
- Can manage multiple games of each type
- AI works for both
- URL sharing works for both
- Smooth game switching

---

## 🔧 Build & Deployment Configuration

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'src/index.html',
        splash: 'src/splash.html',
        settings: 'src/settings.html',
        history: 'src/game-history.html'
      }
    }
  },
  server: {
    port: 3458,
    host: '0.0.0.0',
    strictPort: true
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'sounds/*.mp3'],
      manifest: {
        name: 'Chess - Offline Multiplayer',
        short_name: 'Chess',
        description: 'Play chess offline with SMS-based multiplayer',
        start_url: '/splash.html',
        display: 'standalone',
        background_color: '#312e2b',
        theme_color: '#769656',
        orientation: 'any'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,mp3,svg}']
      }
    })
  ]
})
```

### package.json
```json
{
  "name": "chess-pwa",
  "version": "1.0.0",
  "type": "module",
  "description": "Offline multiplayer chess PWA with SMS-based game sharing",
  "scripts": {
    "dev": "vite",
    "start": "echo 'Chess PWA will be available at: http://localhost:3458' && npm run dev",
    "prebuild": "node scripts/generate-build-info.js",
    "build": "vite build",
    "postbuild": "node scripts/generate-build-info.js",
    "preview": "vite preview",
    "deploy": "npm run build && git add docs/ && git commit -m 'Deploy' && git push",
    "port:check": "lsof -i :3458 || echo 'Port 3458 is free'",
    "port:kill": "lsof -ti :3458 | xargs kill -9 2>/dev/null || echo 'No process on port 3458'"
  },
  "keywords": [
    "chess",
    "pwa",
    "offline",
    "multiplayer",
    "sms",
    "board-game"
  ],
  "author": "Chase Pettet",
  "license": "MIT",
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/chasemp/chess.git"
  },
  "homepage": "https://chess.523.life/"
}
```

### Deployment Workflow (Following Blockdoku Pattern)

**No GitHub Actions needed!** We commit `/docs` directly to git.

```bash
# Development workflow
npm run dev              # Work on your changes in /src

# When ready to deploy
npm run build            # Builds /src → /docs
git add -A               # Stage everything (including /docs)
git commit -m "Update"   # Commit source + build
git push origin main     # Push to GitHub → auto-deploys

# GitHub Pages serves /docs automatically (configured once)
```

**Why this pattern?**
- ✅ Simple - no CI/CD complexity
- ✅ Fast - no waiting for Actions to run
- ✅ Reliable - you see exactly what will be deployed
- ✅ Proven - works perfectly for Blockdoku

**GitHub Pages Configuration (one-time):**
1. Repository Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `main`
4. Folder: `/docs`
5. Save

That's it! Every push to main automatically deploys `/docs`.

---

## 📊 Timeline Summary

| Phase | Description | Duration | Priority | Status |
|-------|-------------|----------|----------|--------|
| **Phase 0** | Project Setup | 1-2 days | Critical | ✅ Done |
| **Phase 1** | Core Chess Engine | 3-5 days | Critical | ✅ Done |
| **Phase 2** | AI Features (vs AI, Coach, Learn) | 3-4 days | High | ✅ Done |
| **Phase 3** | UI & Rendering | 3-4 days | Critical | 🚧 In Progress |
| **Phase 4** | URL-Based Sharing | 2-3 days | Critical | 📋 Planned |
| **Phase 5** | Storage & History | 2-3 days | High | 📋 Planned |
| **Phase 6** | Settings & Themes | 1-2 days | High | ✅ Partial (themes done) |
| **Phase 7** | PWA Enhancements | 2-3 days | High | 📋 Planned |
| **Phase 8** | Polish & Production | 2-3 days | Medium | 📋 Planned |
| **Phase 9** | Multi-Game Foundation | 2-3 days | Future | 📋 Planned |
| **Phase 10** | Checkers Implementation | 5-7 days | Future | 📋 Planned |

**Chess Launch:** 16-25 days (3-5 weeks)  
**Multi-Game Platform:** +10-14 days (~2 weeks more)

---

## 🎮 User Flow Examples

### Flow 1: Starting a New Game
1. Open chess.523.life
2. See empty chess board, white to move
3. Tap piece → see legal moves highlighted
4. Tap destination → piece moves
5. After black's turn → tap "Share" button
6. Send URL via SMS to opponent
7. Opponent opens link → sees exact board state → their turn

### Flow 2: Continuing a Game
1. Receive SMS with game URL
2. Tap link → PWA opens (or opens in browser)
3. See board state with your turn
4. Make move
5. Share updated URL back to opponent
6. Repeat until checkmate

### Flow 3: Offline Play
1. Install PWA from chess.523.life
2. Turn off WiFi/data
3. Open Chess app from home screen
4. Play local game (no sharing, but works offline)
5. Game saves automatically
6. When online, can share game state

---

## 🔑 Key Technical Decisions

### Why URL-Based State?
- **No server required** - fully decentralized
- **Works with any messaging app** - SMS, WhatsApp, Signal, etc.
- **Compact representation** - algebraic notation is tiny
- **Human-readable** - can see the moves in URL
- **Replay capability** - URL is a complete game record

### Why Vanilla JS?
- **No build complexity** - simple mental model
- **Fast load times** - no framework overhead
- **Full control** - no abstraction layers
- **PWA-friendly** - easy to cache all assets
- **Educational** - clear, understandable code

### Why Canvas Rendering?
- **Performance** - smooth animations
- **Flexibility** - custom piece rendering
- **Touch-friendly** - precise coordinate handling
- **Theme support** - easy color/style changes

---

## 🚀 Launch Checklist

### Before Launch
- [ ] All chess rules implemented correctly
- [ ] Share functionality works on iOS and Android
- [ ] PWA installs correctly on both platforms
- [ ] Offline functionality tested
- [ ] Game saving/loading works
- [ ] Settings persist correctly
- [ ] Themes look good
- [ ] Performance is acceptable (Lighthouse score > 90)
- [ ] Tested on real devices
- [ ] Documentation complete

### Deployment
- [ ] GitHub Pages configured
- [ ] Custom domain (chess.523.life) configured
- [ ] HTTPS working
- [ ] Service worker caching correctly
- [ ] PWA manifest serving correctly

### Post-Launch
- [ ] Monitor user feedback
- [ ] Fix critical bugs immediately
- [ ] Add analytics (privacy-respecting)
- [ ] Consider additional features:
  - [ ] Chess puzzles
  - [ ] AI opponent (Stockfish.js)
  - [ ] Game analysis
  - [ ] Opening book
  - [ ] Player ratings (local)

---

## 💡 Future Enhancement Ideas

### Short-term (v1.1-1.2)
- **Timer modes** - Add chess clocks for timed games
- **Undo/Redo** - Allow taking back moves
- **Board rotation** - Flip board for black's perspective
- **Move annotations** - Add comments to moves
- **Export PGN** - Standard chess format export

### Medium-term (v1.3-1.5)
- **AI opponent** - Integrate Stockfish.js for solo play
- **Puzzles** - Daily chess puzzles
- **Opening explorer** - Learn common openings
- **Game analysis** - Post-game move analysis
- **Multiple board themes** - More visual options

### Long-term (v2.0+)
- **Real-time multiplayer** - WebRTC peer-to-peer
- **Tournaments** - Local tournament management
- **Training mode** - Practice specific scenarios
- **Chess variants** - Chess960, King of the Hill, etc.
- **Social features** - Player profiles, friends list

---

## 📚 Learning Resources

### Chess Programming
- [Chess Programming Wiki](https://www.chessprogramming.org/)
- [How to Build a Chess Engine](https://www.freecodecamp.org/news/simple-chess-ai-step-by-step-1d55a9266977/)
- [FEN Notation](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation)
- [PGN Notation](https://en.wikipedia.org/wiki/Portable_Game_Notation)

### PWA Development
- Your own `peadoubleueh/PWA_AGENT_GUIDE.md`
- Your own `peadoubleueh/project-docs/PWA_DEVELOPMENT_WORKFLOW.md`
- [PWA Developer Guide (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

### JavaScript Chess Libraries (for reference, not dependencies)
- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic (don't use, but study the code)
- [chessboard.js](https://chessboardjs.com/) - Board rendering (don't use, but study the code)

---

## 🎯 Success Metrics

### Technical Metrics
- **Load time:** < 2 seconds on 3G
- **Offline capability:** 100% functional offline
- **PWA score:** Lighthouse > 90
- **Bundle size:** < 500KB total
- **Install rate:** > 20% of visitors

### User Experience Metrics
- **Share success rate:** > 80% successful shares
- **Game completion rate:** > 60% games reach endgame
- **Return rate:** > 40% users return within 7 days
- **Average session:** > 10 minutes

---

## 🔧 Development Best Practices

### From Your PWA Lessons
1. **Edit in `/src`, build to `/docs`** - Never edit /docs directly!
2. **Mobile-first** - Design for touch from day one
3. **Offline-first** - Assume no network connection
4. **Local libraries** - Never use CDN dependencies
5. **Settings as pages** - Not modals (better mobile UX)
6. **Universal event handling** - Touch + mouse together
7. **Test on real devices** - Emulation misses issues
8. **Behavioral tests** - Test user workflows
9. **Clean commits** - Auto-build via pre-commit hooks
10. **Documentation** - Write it as you build

### Chess-Specific
1. **Start simple** - Basic rules first, special moves later
2. **Notation matters** - Use standard algebraic notation
3. **Test edge cases** - En passant, castling, promotion
4. **Validate everything** - Never trust move input
5. **Performance counts** - Legal move generation is hot path

---

## 🤝 Contributing Guidelines (Future)

### Code Style
- **Vanilla JS** - ES6+ features welcome
- **No dependencies** - Keep it simple
- **Comments** - Explain chess logic clearly
- **Naming** - Chess terms (rank, file, etc.)

### Testing
- **Manual testing** - Play full games
- **Edge cases** - Test special moves
- **Mobile testing** - Real devices required
- **Offline testing** - Airplane mode

### Pull Requests
- **Small PRs** - One feature at a time
- **Describe changes** - What and why
- **Test thoroughly** - On multiple devices
- **Update docs** - Keep README current

---

## 📞 Support & Community

### Getting Help
- **Issues:** GitHub Issues for bugs/features
- **Discussions:** GitHub Discussions for questions
- **Examples:** See Blockdoku PWA for patterns

### Reporting Bugs
- **Clear title** - "Castling fails after check"
- **Steps to reproduce** - Exact moves to trigger bug
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Environment** - Device, OS, browser

---

**Let's build an amazing offline chess PWA! 🎮♟️**

*This roadmap is based on lessons learned from Blockdoku PWA and peadoubleueh projects. Follow the patterns that worked, avoid the pitfalls we discovered.*

