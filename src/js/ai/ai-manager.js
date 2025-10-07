/**
 * AI Game Manager
 * Handles single-player games against the computer
 */

import { StockfishEngine } from './stockfish-engine.js';
import { CoachAI } from './coach-ai.js';

export class AIManager {
  constructor(chessApp) {
    this.app = chessApp;
    this.engine = null;
    this.coachAI = null;
    this.enabled = false;
    this.vsComputerActive = false; // Track if vs computer game is active
    this.aiColor = 'black'; // AI plays black by default
    this.skillLevel = 10; // Medium difficulty
    this.thinking = false;
    this.moveHistory = []; // UCI format moves
    
    // Initialize coach AI
    this.coachAI = new CoachAI(chessApp);
  }
  
  /**
   * Initialize AI engine
   */
  async init() {
    if (this.engine) return true;
    
    try {
      console.log('Initializing Stockfish engine...');
      this.engine = new StockfishEngine();
      await this.engine.init();
      this.engine.setSkillLevel(this.skillLevel);
      console.log('Stockfish engine ready!');
      return true;
    } catch (error) {
      console.error('Failed to initialize AI:', error);
      this.app.showNotification('Failed to load AI engine');
      return false;
    }
  }
  
  /**
   * Start a game vs computer
   */
  async startVsComputer(aiColor = 'black', skillLevel = 10) {
    const initialized = await this.init();
    if (!initialized) return false;
    
    this.enabled = true;
    this.vsComputerActive = true;
    this.aiColor = aiColor;
    this.skillLevel = skillLevel;
    this.moveHistory = [];
    this.engine.setSkillLevel(skillLevel);
    
    // Reset game
    this.app.engine.newGame();
    this.app.lastMove = null;
    this.app.selectedSquare = null;
    this.app.legalMoves = [];
    this.app.render();
    
    console.log(`Starting game vs computer (AI plays ${aiColor}, skill ${skillLevel})`);
    
    // If AI plays white, make first move
    if (aiColor === 'white') {
      setTimeout(() => this.makeAIMove(), 500);
    }
    
    return true;
  }
  
  /**
   * Start AI game (alias for startVsComputer)
   */
  async startAIGame(aiColor = 'black', skillLevel = 10) {
    return this.startVsComputer(aiColor, skillLevel);
  }

  /**
   * Stop playing vs computer
   */
  stopVsComputer() {
    this.enabled = false;
    this.vsComputerActive = false;
    this.thinking = false;
    this.moveHistory = [];
    this.hideThinkingIndicator();
  }
  
  /**
   * Check if it's AI's turn
   */
  isAITurn() {
    if (!this.enabled) {
      console.log('AI not enabled');
      return false;
    }
    
    const currentTurn = this.app.engine.getCurrentTurn();
    const isTurn = (currentTurn === 'white' && this.aiColor === 'white') ||
                   (currentTurn === 'black' && this.aiColor === 'black');
    
    console.log('AI turn check:', {
      enabled: this.enabled,
      currentTurn,
      aiColor: this.aiColor,
      isTurn
    });
    
    return isTurn;
  }
  
  /**
   * Make AI move
   */
  async makeAIMove() {
    if (!this.enabled || this.thinking) return;
    
    // Check if game is over
    const status = this.app.engine.getGameStatus();
    if (status === 'checkmate' || status === 'stalemate') {
      return;
    }
    
    this.thinking = true;
    this.showThinkingIndicator();
    
    try {
      // Calculate think time based on skill level
      const baseTime = 500;
      const maxTime = 2000;
      const thinkTime = baseTime + ((this.skillLevel / 20) * (maxTime - baseTime));
      
      console.log(`AI thinking... (${Math.round(thinkTime)}ms)`);
      
      // Get best move from Stockfish
      const uciMove = await this.engine.getBestMove(null, this.moveHistory, thinkTime);
      
      if (!uciMove) {
        console.error('AI failed to find a move');
        this.thinking = false;
        this.hideThinkingIndicator();
        return;
      }
      
      console.log('AI chose move:', uciMove);
      
      // Convert UCI to coordinates
      const move = StockfishEngine.uciToCoords(uciMove);
      
      // Execute move
      const result = this.app.engine.makeMove(
        move.from.row, 
        move.from.col, 
        move.to.row, 
        move.to.col,
        move.promotion
      );
      
      if (result === 'promotion') {
        // AI always promotes to queen
        this.app.engine.makeMove(0, 0, 0, 0, move.promotion || 'Q');
      }
      
      // Update move history
      this.moveHistory.push(uciMove);
      
      // Update UI
      this.app.lastMove = this.app.engine.getLastMove();
      this.app.selectedSquare = null;
      this.app.legalMoves = [];
      this.app.render();
      this.app.updateGameInfo();
      
      // Check game status
      const newStatus = this.app.engine.getGameStatus();
      if (newStatus === 'checkmate') {
        const winner = this.app.engine.getCurrentTurn() === 'white' ? 'Black' : 'White';
        this.app.showNotification(`Checkmate! ${winner} wins!`);
        this.stopVsComputer();
      } else if (newStatus === 'check') {
        this.app.showNotification('Check!');
      } else if (newStatus === 'stalemate') {
        this.app.showNotification('Stalemate! Game is a draw.');
        this.stopVsComputer();
      }
      
    } catch (error) {
      console.error('AI move error:', error);
      this.app.showNotification('AI error - please try again');
    } finally {
      this.thinking = false;
      this.hideThinkingIndicator();
    }
  }
  
  /**
   * Record human move (for AI context)
   */
  recordMove(fromRow, fromCol, toRow, toCol, promotion = null) {
    if (!this.enabled) return;
    
    const uciMove = StockfishEngine.coordsToUci(fromRow, fromCol, toRow, toCol, promotion);
    this.moveHistory.push(uciMove);
    
    // Trigger AI move after a short delay
    if (this.isAITurn()) {
      setTimeout(() => this.makeAIMove(), 300);
    }
  }
  
  /**
   * Show "AI is thinking..." indicator
   */
  showThinkingIndicator() {
    let indicator = document.getElementById('ai-thinking');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'ai-thinking';
      indicator.className = 'ai-thinking';
      indicator.innerHTML = `
        <div class="thinking-content">
          <div class="thinking-spinner"></div>
          <span>AI is thinking...</span>
        </div>
      `;
      document.body.appendChild(indicator);
    }
    indicator.style.display = 'flex';
  }
  
  /**
   * Hide thinking indicator
   */
  hideThinkingIndicator() {
    const indicator = document.getElementById('ai-thinking');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
  
  /**
   * Get skill level name
   */
  static getSkillLevelName(level) {
    if (level <= 3) return 'Beginner';
    if (level <= 7) return 'Casual';
    if (level <= 12) return 'Intermediate';
    if (level <= 16) return 'Advanced';
    return 'Expert';
  }
  
  /**
   * Get approximate ELO for skill level
   */
  static getApproxELO(level) {
    return 800 + (level * 110);
  }
}

