/**
 * Chess PWA - Main Application
 * Phase 1: Playable Chess Game with Themes + AI + Replay
 */

import { ChessEngine } from './game/chess-engine.js';
import { ThemeManager } from './ui/theme-manager.js';
import { AIManager } from './ai/ai-manager.js';
import { LearnMode } from './tutorial/learn-mode.js';
import { ReplayManager } from './ui/replay-manager.js';
import { ShareManager } from './sharing/share-manager.js';
import { URLDecoder } from './sharing/url-decoder.js';
import { SoundManager } from './audio/sound-manager.js';
import { AnimationManager } from './animation/animation-manager.js';
import { HapticManager } from './mobile/haptic-manager.js';
import { MultiGameApp } from './multi-game-app.js';
import { GameUIManager } from './games/shared/game-ui-manager.js';
import { GameStatistics } from './analytics/game-statistics.js';

console.log('♟️ Mate starting...');

class ChessApp {
  constructor() {
    console.log('Chess app initialized!');
    
    this.canvas = document.getElementById('chess-board');
    this.ctx = this.canvas.getContext('2d');
    this.squareSize = this.canvas.width / 8;
    
    // Chess engine
    this.engine = new ChessEngine();
    this.engine.newGame();
    
    // Theme manager
    this.themeManager = new ThemeManager();
    
    // Sound manager
    this.soundManager = new SoundManager();
    
    // Animation manager
    this.animationManager = new AnimationManager(this.canvas, this.ctx, this.squareSize);
    
    // Haptic manager
    this.hapticManager = new HapticManager();
    
    // Multi-game app
    this.multiGameApp = new MultiGameApp();
    this.gameUIManager = new GameUIManager();
    
    // Game statistics
    this.gameStats = new GameStatistics();
    
    // AI manager (includes coach AI)
    this.aiManager = new AIManager(this);
    
    // Learn mode
    this.learnMode = new LearnMode(this);
    
    // Replay manager
    this.replayManager = new ReplayManager(this);
    
    // Share manager
    this.shareManager = new ShareManager(this);
    
    // UI state
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.coachSuggestion = null; // For highlighting coach suggestions
    this.currentTask = null; // For tutorial tasks
    this.boardOrientation = localStorage.getItem('mate-board-orientation') || 'bottom';
    this.showHints = localStorage.getItem('mate-show-hints');
    this.showHints = this.showHints === null || this.showHints === 'true'; // Default to true
    
    this.setupEventListeners();
    
    // Check for new game from setup pages
    this.checkForNewGame();
    
    // Check for shared game in URL
    this.loadGameFromUrl();
    
    // Check for game selection from games page
    this.checkForGameSelection();
    
    // Restore saved game state (if any)
    this.restoreGameState();
    
    this.render();
    console.log('✅ Chess PWA ready!');
  }
  
  setupEventListeners() {
    // Canvas click/touch events
    this.canvas.addEventListener('click', this.handleBoardClick.bind(this));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      console.log('Touch start:', e.touches[0]);
      this.handleBoardClick(e.touches[0]);
    }, { passive: false });
    
    // Learn to Play button
    this.addTouchEvents('learn-btn', () => {
      this.learnMode.start();
    });
    
    // Coach Mode button
    this.addTouchEvents('coach-btn', () => {
      this.toggleCoachMode();
    });
    
    // Share button
    this.addTouchEvents('share-btn', () => {
      this.shareManager.shareGame();
    });
    
    // Game selection button
    this.addTouchEvents('game-select-btn', () => {
      window.location.href = '/games.html';
    });
    
    // Settings button
    this.addTouchEvents('settings-btn', () => {
      // Save game state before navigating
      this.saveGameState();
      window.location.href = '/settings.html';
    });
    
    // Undo button
    this.addTouchEvents('undo-btn', () => {
      if (this.engine.undoMove()) {
        this.selectedSquare = null;
        this.legalMoves = [];
        this.render();
        this.showNotification('Move undone');
      }
    });
    
    // New Game button (link)
    this.addTouchEvents('new-game-btn', () => {
      // Link navigation will handle this
    });
    
    // New Game header button
    this.addTouchEvents('new-game-header', () => {
      window.location.href = '/new-game.html';
    });
    
    // Stats button (link)
    this.addTouchEvents('stats-btn', () => {
      // Link navigation will handle this
    });
  }
  
  /**
   * Add both click and touch events for mobile compatibility
   */
  addTouchEvents(elementId, handler) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Add click event
    element.addEventListener('click', handler);
    
    // Add touch events for mobile
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handler();
    }, { passive: false });
    
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      // Prevent double-firing by only handling touchend
    }, { passive: false });
  }
  
  /**
   * Handle board click/touch
   */
  handleBoardClick(event) {
    // Don't allow moves during replay
    if (this.replayManager.isActive()) {
      this.showNotification('Exit replay mode to make moves');
      return;
    }
    
    // Reload orientation setting (in case changed in settings)
    this.boardOrientation = localStorage.getItem('mate-board-orientation') || 'bottom';
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let col = Math.floor(x / this.squareSize);
    let row = Math.floor(y / this.squareSize);
    
    console.log('handleBoardClick:', { 
      clientX: event.clientX, 
      clientY: event.clientY, 
      rectLeft: rect.left, 
      rectTop: rect.top, 
      x, y, 
      squareSize: this.squareSize,
      rawCol: col,
      rawRow: row
    });
    
    // Flip coordinates if board is oriented from top
    if (this.boardOrientation === 'top') {
      row = 7 - row;
      col = 7 - col;
    }

    if (row < 0 || row > 7 || col < 0 || col > 7) {
      console.log('Click outside board bounds');
      return;
    }

    console.log('Clicked square:', { row, col });
    
    if (this.selectedSquare) {
      // Try to move selected piece
      this.tryMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
    } else {
      // Select piece
      this.selectPiece(row, col);
    }
  }
  
  /**
   * Select a piece
   */
  selectPiece(row, col) {
    const board = this.engine.getBoard();
    const piece = board.getPiece(row, col);
    const currentTurn = this.engine.getCurrentTurn();
    
    console.log('selectPiece called:', { row, col, piece, currentTurn });
    
    if (piece && piece[0] === currentTurn[0]) {
      this.selectedSquare = { row, col };
      
      // Play select sound and haptic feedback
      this.soundManager.play('select');
      this.hapticManager.select();
      
      // Reload hints preference (in case changed in settings)
      this.showHints = localStorage.getItem('mate-show-hints');
      this.showHints = this.showHints === null || this.showHints === 'true';
      
      this.legalMoves = this.engine.getLegalMoves(row, col);
      console.log('Selected piece:', piece, 'Legal moves:', this.legalMoves.length);
      
      // Visual feedback for no legal moves
      if (this.legalMoves.length === 0 && this.showHints) {
        this.flashSquare(row, col);
        this.soundManager.play('illegal');
        this.hapticManager.illegal();
        this.showNotification('❌ No legal moves for this piece!');
      }
      
      this.render();
    } else {
      console.log('Piece selection failed:', { piece, currentTurn, pieceColor: piece ? piece[0] : 'none', currentTurnColor: currentTurn[0] });
    }
  }
  
  /**
   * Flash a square to indicate no legal moves
   */
  flashSquare(row, col) {
    // Store original selection
    const originalSelected = this.selectedSquare;
    
    // Flash effect: deselect, wait, reselect
    this.selectedSquare = null;
    this.render();
    
    setTimeout(() => {
      this.selectedSquare = originalSelected;
      this.render();
    }, 150);
  }
  
  /**
   * Try to make a move
   */
  tryMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    // Check if this is a tutorial task
    if (this.currentTask && this.learnMode.active) {
      const valid = this.learnMode.validateTask(fromRow, fromCol, toRow, toCol);
      if (!valid) {
        this.showNotification('❌ Try again! Follow the instructions.');
        this.selectedSquare = null;
        this.legalMoves = [];
        this.render();
        return;
      }
    }
    
    // Check if there's a piece to capture
    const board = this.engine.getBoard();
    const capturedPiece = board.getPiece(toRow, toCol);
    const movingPiece = board.getPiece(fromRow, fromCol);
    
    const result = this.engine.makeMove(fromRow, fromCol, toRow, toCol, promotionPiece);
    
    if (result === 'promotion') {
      // Show promotion dialog
      console.log('Pawn promotion required!');
      this.showPromotionDialog(fromRow, fromCol, toRow, toCol);
      
      // Store last move for highlighting
      this.lastMove = this.engine.getLastMove();
      
      this.selectedSquare = null;
      this.legalMoves = [];
      this.render();
      this.updateGameInfo();
    } else if (result) {
      console.log('Move successful!');
      
      // Tutorial task completed
      if (this.currentTask && this.learnMode.active) {
        this.learnMode.taskCompleted();
        this.currentTask = null;
      }
      
      // Record move for AI
      this.aiManager.recordMove(fromRow, fromCol, toRow, toCol, promotionPiece);
      
      // Store last move for highlighting
      this.lastMove = this.engine.getLastMove();
      
      this.selectedSquare = null;
      this.legalMoves = [];
      
      // Animate the move
      this.animateMove(fromRow, fromCol, toRow, toCol, movingPiece, capturedPiece);
      
      // Trigger AI move if it's AI's turn
      console.log('Checking AI turn...', {
        enabled: this.aiManager.enabled,
        currentTurn: this.engine.getCurrentTurn(),
        aiColor: this.aiManager.aiColor,
        isAITurn: this.aiManager.isAITurn()
      });
      
      if (this.aiManager.isAITurn()) {
        console.log('AI turn detected, triggering move...');
        setTimeout(() => {
          this.aiManager.makeAIMove();
        }, 1000); // Wait 1 second after player move
      } else {
        console.log('Not AI turn, skipping...');
      }
      
    } else {
      console.log('Illegal move');
      this.soundManager.play('illegal');
      this.hapticManager.illegal();
      this.selectedSquare = null;
      this.legalMoves = [];
      this.render();
    }
  }
  
  /**
   * Animate a move
   */
  animateMove(fromRow, fromCol, toRow, toCol, movingPiece, capturedPiece) {
    // If there's a captured piece, animate its fade out first
    if (capturedPiece) {
      this.animationManager.animateCapture(toRow, toCol, capturedPiece, () => {
        // After capture animation, animate the move
        this.animationManager.animateMove(fromRow, fromCol, toRow, toCol, movingPiece, () => {
          this.onMoveAnimationComplete(fromRow, fromCol, toRow, toCol, capturedPiece);
        });
      });
    } else {
      // Just animate the move
      this.animationManager.animateMove(fromRow, fromCol, toRow, toCol, movingPiece, () => {
        this.onMoveAnimationComplete(fromRow, fromCol, toRow, toCol, capturedPiece);
      });
    }
  }
  
  /**
   * Called when move animation completes
   */
  onMoveAnimationComplete(fromRow, fromCol, toRow, toCol, capturedPiece) {
    // Update UI
    this.render();
    this.updateGameInfo();
    
    // Save game state
    this.saveGameState();
    
    // Check game status and play sounds
    const status = this.engine.getGameStatus();
    const wasCapture = this.lastMove && this.lastMove.captured;
    
    if (status === 'checkmate') {
      const winner = this.engine.getCurrentTurn() === 'white' ? 'Black' : 'White';
      this.showNotification(`Checkmate! ${winner} wins!`);
      this.soundManager.play('checkmate');
      this.hapticManager.checkmate();
      this.aiManager.stopVsComputer();
    } else if (status === 'check') {
      this.showNotification(`${this.engine.getCurrentTurn()} is in check!`);
      this.soundManager.play('check');
      this.hapticManager.check();
    } else if (status === 'stalemate') {
      this.showNotification('Stalemate! Game is a draw.');
      this.soundManager.play('move');
      this.hapticManager.move();
      this.aiManager.stopVsComputer();
    } else {
      // Normal move - play capture or move sound
      if (wasCapture) {
        this.soundManager.play('capture');
        this.hapticManager.capture();
      } else {
        this.soundManager.play('move');
        this.hapticManager.move();
      }
    }
  }
  
  /**
   * Check for game selection from games page
   */
  checkForGameSelection() {
    const selectedGame = localStorage.getItem('mate-selected-game');
    if (selectedGame) {
      // Clear the selection
      localStorage.removeItem('mate-selected-game');
      // Switch to the selected game
      this.switchToGame(selectedGame);
    }
  }
  
  /**
   * Switch to a different game
   * @param {string} gameId - Game identifier
   */
  switchToGame(gameId) {
    if (this.multiGameApp.switchGame(gameId)) {
      // Update UI
      const gameInfo = this.multiGameApp.getCurrentGameInfo();
      this.gameUIManager.init(gameId, gameInfo);
      
      // Start new game
      this.multiGameApp.startNewGame();
      
      // Update game info display
      this.updateGameInfo();
      
      this.showNotification(`Switched to ${gameInfo.name}! 🎮`);
    } else {
      this.showNotification('Failed to switch game. Please try again.');
    }
  }
  
  /**
   * Show promotion dialog
   */
  showPromotionDialog(fromRow, fromCol, toRow, toCol) {
    const modal = document.getElementById('promotion-modal');
    modal.style.display = 'flex';
    
    // Handle promotion choice with touch support
    const buttons = modal.querySelectorAll('.promotion-btn');
    buttons.forEach(btn => {
      // Remove existing listeners
      btn.onclick = null;
      btn.removeEventListener('click', btn._promotionHandler);
      btn.removeEventListener('touchstart', btn._promotionTouchHandler);
      
      // Create handlers
      const clickHandler = () => {
        const piece = btn.dataset.piece;
        this.handlePromotion(piece, fromRow, fromCol, toRow, toCol);
        modal.style.display = 'none';
      };
      
      const touchHandler = (e) => {
        e.preventDefault();
        clickHandler();
      };
      
      // Store handlers for cleanup
      btn._promotionHandler = clickHandler;
      btn._promotionTouchHandler = touchHandler;
      
      // Add both click and touch events
      btn.addEventListener('click', clickHandler);
      btn.addEventListener('touchstart', touchHandler, { passive: false });
    });
  }
  
  /**
   * Handle promotion choice
   */
  handlePromotion(piece, fromRow, fromCol, toRow, toCol) {
    // Make the promotion move
    this.tryMove(0, 0, 0, 0, piece); // Dummy coordinates, actual promotion handled in engine
    
    // Record for AI
    this.aiManager.recordMove(fromRow, fromCol, toRow, toCol, piece);
  }
  
  /**
   * Show new game dialog
   */
  showNewGameDialog() {
    const modal = document.getElementById('new-game-modal');
    modal.style.display = 'flex';
  }
  
  /**
   * Check for new game setup from new-game.html or ai-setup.html
   */
  checkForNewGame() {
    const newGameFlag = localStorage.getItem('mate-new-game');
    if (newGameFlag === 'true') {
      localStorage.removeItem('mate-new-game');
      
      const aiMode = localStorage.getItem('mate-ai-mode');
      if (aiMode === 'true') {
        // Start AI game
        const aiColor = localStorage.getItem('mate-ai-color');
        const skillLevel = parseInt(localStorage.getItem('mate-ai-skill') || '10');
        
        localStorage.removeItem('mate-ai-mode');
        localStorage.removeItem('mate-ai-color');
        localStorage.removeItem('mate-ai-skill');
        
        this.startVsAIFromSetup(aiColor, skillLevel);
      } else {
        // Start two-player game
        this.startTwoPlayerGame();
      }
    }
  }
  
  /**
   * Start new 2-player game
   */
  startTwoPlayerGame() {
    this.aiManager.stopVsComputer();
    this.engine.newGame();
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    
    // Generate new game ID
    const gameId = this.shareManager.newGame();
    
    // Clear saved game (starting fresh)
    this.clearSavedGame();
    
    this.render();
    this.showNotification(`New 2-player game started! (Game ID: ${gameId})`);
  }
  
  /**
   * Start AI game from setup page
   */
  async startVsAIFromSetup(aiColor, skillLevel) {
    this.engine.newGame();
    this.shareManager.newGame();
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    
    // Clear saved game (starting fresh)
    this.clearSavedGame();
    
    await this.aiManager.startVsComputer(aiColor, skillLevel);
    this.render();
    this.updateGameInfo();
    this.showNotification(`🤖 AI game started! (Level ${skillLevel})`);
  }
  
  /**
   * Show AI difficulty dialog
   */
  showAIDialog() {
    const modal = document.getElementById('ai-modal');
    modal.style.display = 'flex';
    
    // Update skill level display
    const slider = document.getElementById('ai-skill-level');
    const display = document.getElementById('skill-level-display');
    if (slider && display) {
      slider.oninput = () => {
        const level = parseInt(slider.value);
        const name = AIManager.getSkillLevelName(level);
        const elo = AIManager.getApproxELO(level);
        display.textContent = `${name} (Level ${level}, ~${elo} ELO)`;
      };
      slider.oninput(); // Trigger initial update
    }
  }
  
  /**
   * Start game vs AI
   */
  async startVsAI(color) {
    const slider = document.getElementById('ai-skill-level');
    const skillLevel = slider ? parseInt(slider.value) : 10;
    const aiColor = color === 'white' ? 'black' : 'white';
    
    document.getElementById('ai-modal').style.display = 'none';
    this.showNotification('Loading AI engine...');
    
    const success = await this.aiManager.startVsComputer(aiColor, skillLevel);
    
    if (success) {
      this.render();
      const skillName = AIManager.getSkillLevelName(skillLevel);
      this.showNotification(`Game started! AI: ${skillName} (${aiColor})`);
    }
  }
  
  /**
   * Toggle coach mode
   */
  async toggleCoachMode() {
    if (this.aiManager.coachAI.enabled) {
      this.aiManager.coachAI.disable();
      this.showNotification('Coach mode disabled');
    } else {
      this.showNotification('Loading chess coach...');
      const success = await this.aiManager.coachAI.enable();
      if (success) {
        this.showNotification('🎓 Coach ready! Click "Get Hint" for help.');
      }
    }
  }
  
  /**
   * Request hint from coach
   */
  async requestHint() {
    if (!this.aiManager.coachAI.enabled) {
      await this.toggleCoachMode();
    }
    
    this.showNotification('Coach is analyzing...');
    const hint = await this.aiManager.coachAI.getHint(this.aiManager.moveHistory);
    
    if (hint) {
      this.aiManager.coachAI.displayHint(hint);
    } else {
      this.showNotification('Unable to get hint');
    }
  }
  
  /**
   * Request position analysis from coach
   */
  async requestAnalysis() {
    if (!this.aiManager.coachAI.enabled) {
      await this.toggleCoachMode();
    }
    
    this.showNotification('Coach is analyzing...');
    const analysis = await this.aiManager.coachAI.analyzePosition(this.aiManager.moveHistory);
    
    if (analysis) {
      this.aiManager.coachAI.displayHint(analysis);
    } else {
      this.showNotification('Unable to analyze position');
    }
  }
  
  /**
   * Update game info display
   */
  updateGameInfo() {
    const turn = this.engine.getCurrentTurn();
    const turnText = `${turn.charAt(0).toUpperCase() + turn.slice(1)} to move`;
    document.getElementById('current-turn').textContent = turnText;
    
    // Update header turn indicator
    document.getElementById('header-turn-text').textContent = turnText;
    
    // Update header turn piece
    const turnPiece = turn === 'white' ? '♔' : '♚';
    document.getElementById('header-turn-piece').textContent = turnPiece;
    
    // Update move history
    const history = this.engine.getMoveHistory();
    const historyEl = document.getElementById('move-history');
    if (historyEl) {
      historyEl.innerHTML = history
        .map((move, idx) => `<div>${idx + 1}. ${move.notation}</div>`)
        .join('');
      // Scroll to bottom
      historyEl.scrollTop = historyEl.scrollHeight;
    }
  }
  
  /**
   * Render the entire board
   */
  render() {
    this.drawBoard();
    this.drawPieces();
    
    // Render animations on top
    this.animationManager.renderAnimations((piece, x, y, size) => {
      this.drawPieceAt(piece, x, y, size);
    });
    
    this.updateGameInfo();
  }
  
  /**
   * Draw the chess board squares
   */
  drawBoard() {
    const boardTheme = this.themeManager.getCurrentBoardTheme();
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        // Calculate display position (may be flipped based on orientation)
        let displayRow = row;
        let displayCol = col;
        
        if (this.boardOrientation === 'top') {
          displayRow = 7 - row;
          displayCol = 7 - col;
        }
        
        const x = displayCol * this.squareSize;
        const y = displayRow * this.squareSize;
        
        // Determine square color
        const isLight = (row + col) % 2 === 0;
        let fillColor = isLight ? boardTheme.light : boardTheme.dark;
        
        // Highlight last move
        if (this.lastMove && 
            ((this.lastMove.from.row === row && this.lastMove.from.col === col) ||
             (this.lastMove.to.row === row && this.lastMove.to.col === col))) {
          fillColor = boardTheme.lastMove;
        }
        
        // Highlight selected square
        if (this.selectedSquare && 
            this.selectedSquare.row === row && 
            this.selectedSquare.col === col) {
          fillColor = boardTheme.selected;
        }
        
        // Highlight legal move squares (if hints enabled)
        if (this.showHints && this.legalMoves.some(m => m.row === row && m.col === col)) {
          fillColor = boardTheme.legalMove;
        }
        
        // Highlight if king is in check
        const board = this.engine.getBoard();
        const piece = board.getPiece(row, col);
        const status = this.engine.getGameStatus();
        if (piece && piece[1] === 'K' && status === 'check') {
          const currentTurn = this.engine.getCurrentTurn();
          if (piece[0] === currentTurn[0]) {
            fillColor = boardTheme.check;
          }
        }
        
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
      }
    }
    
    // Draw border
    this.ctx.strokeStyle = boardTheme.border;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Draw chess pieces using current piece set
   */
  drawPieces() {
    const board = this.engine.getBoard();
    const pieceSet = this.themeManager.getCurrentPieceSet();
    const style = pieceSet.style;
    
    this.ctx.font = `${this.squareSize * style.fontSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Apply glow effect if enabled
    if (style.glow) {
      this.ctx.shadowBlur = 8;
    } else {
      this.ctx.shadowBlur = 0;
    }
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece(row, col);
        if (piece) {
          const symbol = pieceSet.pieces[piece];
          
          // Calculate display position (may be flipped based on orientation)
          let displayCol = col;
          let displayRow = row;
          
          if (this.boardOrientation === 'top') {
            displayCol = 7 - col;
            displayRow = 7 - row;
          }
          
          const x = displayCol * this.squareSize + this.squareSize / 2;
          const y = displayRow * this.squareSize + this.squareSize / 2;
          
          // Styling based on piece color
          const isBlackPiece = piece[0] === 'b';
          
          if (isBlackPiece) {
            this.ctx.strokeStyle = style.blackShadow;
            this.ctx.fillStyle = style.blackColor;
            if (style.glow) this.ctx.shadowColor = style.blackColor;
          } else {
            this.ctx.strokeStyle = style.whiteShadow;
            this.ctx.fillStyle = style.whiteColor;
            if (style.glow) this.ctx.shadowColor = style.whiteColor;
          }
          
          this.ctx.lineWidth = style.strokeWidth;
          
          // Draw piece with stroke and fill
          this.ctx.strokeText(symbol, x, y);
          this.ctx.fillText(symbol, x, y);
        }
      }
    }
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }
  
  /**
   * Draw a single piece at specific coordinates
   */
  drawPieceAt(piece, x, y, size) {
    const pieceSet = this.themeManager.getCurrentPieceSet();
    const style = pieceSet.style;
    
    // Set font size based on piece size
    const fontSize = size * style.fontSize;
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Apply glow effect if enabled
    if (style.glow) {
      this.ctx.shadowBlur = 8;
    } else {
      this.ctx.shadowBlur = 0;
    }
    
    // Get piece symbol
    const symbol = pieceSet.pieces[piece];
    
    // Styling based on piece color
    const isBlackPiece = piece[0] === 'b';
    
    if (isBlackPiece) {
      this.ctx.strokeStyle = style.blackShadow;
      this.ctx.fillStyle = style.blackColor;
      if (style.glow) this.ctx.shadowColor = style.blackColor;
    } else {
      this.ctx.strokeStyle = style.whiteShadow;
      this.ctx.fillStyle = style.whiteColor;
      if (style.glow) this.ctx.shadowColor = style.whiteColor;
    }
    
    // Draw piece with stroke
    this.ctx.lineWidth = 1;
    this.ctx.strokeText(symbol, x, y);
    this.ctx.fillText(symbol, x, y);
  }
  
  /**
   * Check if a piece is currently being animated
   */
  isPieceAnimating(row, col) {
    // This is a simple check - in a more complex system, we'd track which pieces are animating
    // For now, we'll let the animation manager handle this
    return false;
  }
  
  /**
   * Load game from URL if shared link
   */
  loadGameFromUrl() {
    const path = window.location.pathname;
    
    // Check if this is a game URL (/m/g4f2-e4-e5...)
    if (!path.startsWith('/m/')) {
      return;
    }

    console.log('Loading game from URL:', path);

    try {
      const decoder = new URLDecoder();
      const encoder = this.shareManager.encoder;
      
      // Parse URL
      const gameData = encoder.decodeGameState(path);
      
      // Decode and validate game
      const result = decoder.decodeGame(gameData.gameId, gameData.moves);
      
      if (!result.valid) {
        console.error('Invalid game URL:', result.error);
        this.showNotification(`❌ Invalid game link: ${result.error}`);
        return;
      }

      // Load the game state
      this.engine = result.engine;
      this.shareManager.setGameId(gameData.gameId);
      
      // Update UI
      this.lastMove = this.engine.getLastMove();
      this.render();
      
      // Show notification
      const turn = this.engine.getCurrentTurn();
      const opponent = turn === 'white' ? 'Black' : 'White';
      this.showNotification(`✅ Game loaded! ${opponent} to move (${gameData.moves.length} moves)`);
      
      console.log('✅ Game loaded successfully:', {
        gameId: gameData.gameId,
        moves: gameData.moves.length,
        turn: turn
      });
    } catch (error) {
      console.error('Failed to load game from URL:', error);
      this.showNotification('❌ Failed to load game from link');
    }
  }
  
  /**
   * Save current game state to localStorage
   */
  saveGameState() {
    try {
      // Don't save if it's a new empty game
      if (this.engine.getMoveHistory().length === 0) {
        console.log('No moves yet, skipping save');
        return;
      }
      
      const gameState = {
        // Board state (2D array of pieces)
        board: this.engine.getBoard().squares,
        
        // Game metadata
        currentTurn: this.engine.getCurrentTurn(),
        moveHistory: this.engine.getMoveHistory(),
        capturedPieces: this.engine.getCapturedPieces(),
        gameStatus: this.engine.getGameStatus(),
        gameId: this.shareManager.gameId,
        
        // AI state
        isAIGame: this.aiManager.vsComputerActive,
        aiColor: this.aiManager.aiColor,
        aiSkillLevel: this.aiManager.skillLevel,
        
        // Timestamp
        savedAt: Date.now(),
        
        // Track which pieces have moved (for castling)
        pieceMoveTracker: Array.from(this.engine.gameState.pieceMoveTracker || [])
      };
      
      localStorage.setItem('mate-current-game', JSON.stringify(gameState));
      console.log('✅ Game state saved:', {
        moves: gameState.moveHistory.length,
        turn: gameState.currentTurn,
        gameId: gameState.gameId
      });
    } catch (error) {
      console.error('❌ Failed to save game state:', error);
    }
  }
  
  /**
   * Restore game state from localStorage
   */
  restoreGameState() {
    try {
      const saved = localStorage.getItem('mate-current-game');
      
      if (!saved) {
        console.log('No saved game found');
        return;
      }
      
      const gameState = JSON.parse(saved);
      
      // Check if saved state is recent (within 7 days)
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - gameState.savedAt > sevenDays) {
        console.log('Saved game is too old, discarding');
        localStorage.removeItem('mate-current-game');
        return;
      }
      
      console.log('Restoring saved game:', {
        moves: gameState.moveHistory.length,
        turn: gameState.currentTurn,
        savedAt: new Date(gameState.savedAt).toLocaleString()
      });
      
      // Restore board state
      this.engine.gameState.board.squares = gameState.board;
      this.engine.gameState.currentTurn = gameState.currentTurn;
      this.engine.gameState.moveHistory = gameState.moveHistory;
      this.engine.gameState.capturedPieces = gameState.capturedPieces;
      this.engine.gameState.gameStatus = gameState.gameStatus;
      this.engine.gameState.gameId = gameState.gameId;
      
      // Restore piece move tracker (for castling)
      if (gameState.pieceMoveTracker) {
        this.engine.gameState.pieceMoveTracker = new Set(gameState.pieceMoveTracker);
      }
      
      // Restore game ID
      if (gameState.gameId) {
        this.shareManager.setGameId(gameState.gameId);
      }
      
      // Restore AI state if applicable
      if (gameState.isAIGame) {
        this.aiManager.startVsComputer(gameState.aiColor, gameState.aiSkillLevel);
      }
      
      // Update last move for highlighting
      if (gameState.moveHistory.length > 0) {
        this.lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
      }
      
      this.showNotification(`✅ Game resumed! (${gameState.moveHistory.length} moves)`);
      
    } catch (error) {
      console.error('❌ Failed to restore game state:', error);
      // Clear corrupted save
      localStorage.removeItem('mate-current-game');
    }
  }
  
  /**
   * Clear saved game state
   */
  clearSavedGame() {
    localStorage.removeItem('mate-current-game');
    console.log('Saved game cleared');
  }
  
  /**
   * Show notification message
   */
  showNotification(message) {
    const statusEl = document.getElementById('game-status');
    if (statusEl) {
      statusEl.textContent = message;
      setTimeout(() => {
        statusEl.textContent = '';
      }, 3000);
    }
  }
}

// Initialize app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.app = new ChessApp();
    console.log('✅ Chess PWA ready!');
  } catch (error) {
    console.error('❌ Failed to initialize Chess PWA:', error);
  }
});

