/**
 * Replay Manager
 * Allows stepping through game history move by move
 */

import { ChessEngine } from '../game/chess-engine.js';

export class ReplayManager {
  constructor(app) {
    this.app = app;
    this.engine = app.engine;
    this.isReplaying = false;
    this.replayIndex = 0;
    this.autoPlayInterval = null;
    this.replaySpeed = 1000; // ms between moves
    
    // Store original game state
    this.originalMoveHistory = [];
    this.originalBoard = null;
    this.originalTurn = null;
    
    this.setupEventListeners();
  }
  
  /**
   * Setup event listeners for replay controls
   */
  setupEventListeners() {
    // Replay button
    this.addTouchEvents('replay-btn', () => {
      if (this.isReplaying) {
        this.exit();
      } else {
        this.start();
      }
    });
    
    // Control buttons
    this.addTouchEvents('replay-start', () => this.jumpToStart());
    this.addTouchEvents('replay-prev', () => this.prevMove());
    this.addTouchEvents('replay-play', () => this.autoPlay());
    this.addTouchEvents('replay-pause', () => this.stopAutoPlay());
    this.addTouchEvents('replay-next', () => this.nextMove());
    this.addTouchEvents('replay-end', () => this.jumpToCurrent());
    this.addTouchEvents('replay-exit', () => this.exit());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!this.isReplaying) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prevMove();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextMove();
          break;
        case ' ':
          e.preventDefault();
          if (this.autoPlayInterval) {
            this.stopAutoPlay();
          } else {
            this.autoPlay();
          }
          break;
        case 'Home':
          e.preventDefault();
          this.jumpToStart();
          break;
        case 'End':
          e.preventDefault();
          this.jumpToCurrent();
          break;
        case 'Escape':
          e.preventDefault();
          this.exit();
          break;
      }
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
   * Start replay mode
   */
  start() {
    const moveHistory = this.engine.getMoveHistory();
    
    if (moveHistory.length === 0) {
      this.app.showNotification('No moves to replay!');
      return;
    }
    
    this.isReplaying = true;
    
    // Store original state
    this.originalMoveHistory = [...moveHistory];
    this.originalBoard = this.engine.getBoard();
    this.originalTurn = this.engine.getCurrentTurn();
    
    // Start at beginning
    this.jumpToStart();
    
    // Show replay controls
    this.showControls();
    
    // Hide game controls
    document.querySelector('.footer')?.style.setProperty('display', 'none');
    
    this.app.showNotification('🎬 Replay Mode - Use ← → or buttons');
  }
  
  /**
   * Exit replay mode and return to current position
   */
  exit() {
    if (!this.isReplaying) return;
    
    this.stopAutoPlay();
    this.isReplaying = false;
    
    // Restore original game state
    this.engine.gameState.reset();
    this.engine.gameState.moveHistory = [...this.originalMoveHistory];
    
    // Replay all moves to restore board state
    for (const move of this.originalMoveHistory) {
      this.engine.makeMove(
        move.from.row, 
        move.from.col, 
        move.to.row, 
        move.to.col,
        move.promotion?.to[1] // Promotion piece if any
      );
    }
    
    // Hide replay controls
    this.hideControls();
    
    // Show game controls
    document.querySelector('.footer')?.style.removeProperty('display');
    
    // Render final state
    this.app.render();
    
    this.app.showNotification('Exited replay mode');
  }
  
  /**
   * Jump to start of game
   */
  jumpToStart() {
    this.replayIndex = 0;
    this.renderAtIndex(0);
  }
  
  /**
   * Jump to current (end of game)
   */
  jumpToCurrent() {
    this.replayIndex = this.originalMoveHistory.length;
    this.renderAtIndex(this.replayIndex);
  }
  
  /**
   * Go to previous move
   */
  prevMove() {
    if (this.replayIndex > 0) {
      this.replayIndex--;
      this.renderAtIndex(this.replayIndex);
    }
  }
  
  /**
   * Go to next move
   */
  nextMove() {
    if (this.replayIndex < this.originalMoveHistory.length) {
      this.replayIndex++;
      this.renderAtIndex(this.replayIndex);
    }
  }
  
  /**
   * Auto-play through moves
   */
  autoPlay() {
    if (this.autoPlayInterval) return;
    
    // Show pause button, hide play button
    document.getElementById('replay-play').style.display = 'none';
    document.getElementById('replay-pause').style.display = 'inline-block';
    
    this.autoPlayInterval = setInterval(() => {
      if (this.replayIndex < this.originalMoveHistory.length) {
        this.nextMove();
      } else {
        this.stopAutoPlay();
      }
    }, this.replaySpeed);
  }
  
  /**
   * Stop auto-play
   */
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
      
      // Show play button, hide pause button
      document.getElementById('replay-play').style.display = 'inline-block';
      document.getElementById('replay-pause').style.display = 'none';
    }
  }
  
  /**
   * Render board at specific move index
   */
  renderAtIndex(index) {
    // Create fresh game state
    const tempEngine = new ChessEngine();
    tempEngine.newGame();
    
    // Replay moves up to this index
    for (let i = 0; i < index; i++) {
      const move = this.originalMoveHistory[i];
      tempEngine.makeMove(
        move.from.row,
        move.from.col,
        move.to.row,
        move.to.col,
        move.promotion?.to[1] // Promotion piece if any
      );
    }
    
    // Temporarily swap engines for rendering
    const originalEngine = this.app.engine;
    this.app.engine = tempEngine;
    
    // Set last move for highlighting
    if (index > 0) {
      this.app.lastMove = this.originalMoveHistory[index - 1];
    } else {
      this.app.lastMove = null;
    }
    
    // Render
    this.app.render();
    
    // Restore original engine
    this.app.engine = originalEngine;
    
    // Update UI
    this.updateReplayUI();
  }
  
  /**
   * Update replay UI elements
   */
  updateReplayUI() {
    const total = this.originalMoveHistory.length;
    const current = this.replayIndex;
    
    // Update position text
    const positionText = document.getElementById('replay-position');
    if (positionText) {
      positionText.textContent = `Move ${current} of ${total}`;
    }
    
    // Update current move display
    const moveDisplay = document.getElementById('current-move-display');
    if (moveDisplay && current > 0) {
      const move = this.originalMoveHistory[current - 1];
      const moveNum = Math.floor((current - 1) / 2) + 1;
      const side = (current - 1) % 2 === 0 ? '' : '...';
      moveDisplay.textContent = `${moveNum}${side}. ${move.notation}`;
    } else if (moveDisplay) {
      moveDisplay.textContent = 'Starting position';
    }
    
    // Update turn indicator
    const turnEl = document.getElementById('current-turn');
    if (turnEl) {
      const turn = current % 2 === 0 ? 'White' : 'Black';
      const turnText = `${turn} to move`;
      turnEl.textContent = turnText;
      
      // Update header turn indicator
      const headerTurnEl = document.getElementById('header-turn-text');
      if (headerTurnEl) {
        headerTurnEl.textContent = turnText;
      }
      
      // Update header turn piece
      const headerPieceEl = document.getElementById('header-turn-piece');
      if (headerPieceEl) {
        const turnPiece = turn === 'White' ? '♔' : '♚';
        headerPieceEl.textContent = turnPiece;
      }
    }
    
    // Enable/disable buttons
    const startBtn = document.getElementById('replay-start');
    const prevBtn = document.getElementById('replay-prev');
    const nextBtn = document.getElementById('replay-next');
    const endBtn = document.getElementById('replay-end');
    
    if (startBtn) startBtn.disabled = current === 0;
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total;
    if (endBtn) endBtn.disabled = current === total;
  }
  
  /**
   * Show replay controls
   */
  showControls() {
    const controls = document.getElementById('replay-controls');
    if (controls) {
      controls.style.display = 'flex';
    }
    
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
      replayBtn.textContent = '✖️ Exit Replay';
      replayBtn.classList.add('active');
    }
    
    // Add class to body for responsive layout adjustments
    document.body.classList.add('replay-active');
  }
  
  /**
   * Hide replay controls
   */
  hideControls() {
    const controls = document.getElementById('replay-controls');
    if (controls) {
      controls.style.display = 'none';
    }
    
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
      replayBtn.textContent = '🎬 Replay';
      replayBtn.classList.remove('active');
    }
    
    // Remove class from body for responsive layout adjustments
    document.body.classList.remove('replay-active');
  }
  
  /**
   * Check if currently replaying
   */
  isActive() {
    return this.isReplaying;
  }
  
  /**
   * Set replay speed
   */
  setSpeed(ms) {
    this.replaySpeed = ms;
    if (this.autoPlayInterval) {
      this.stopAutoPlay();
      this.autoPlay();
    }
  }
}

