/**
 * Coach AI - Teaching and Strategy Assistant
 * Provides hints, analysis, and explanations while you play
 */

import { StockfishEngine } from './stockfish-engine.js';

export class CoachAI {
  constructor(chessApp) {
    this.app = chessApp;
    this.engine = null;
    this.enabled = false;
    this.autoHint = false; // Auto-show hints after opponent moves
    this.lastAnalysis = null;
  }
  
  /**
   * Initialize coach engine (separate from opponent AI)
   */
  async init() {
    if (this.engine) return true;
    
    try {
      console.log('Initializing Coach AI...');
      this.engine = new StockfishEngine();
      await this.engine.init();
      this.engine.setSkillLevel(20); // Coach is always max strength
      console.log('Coach AI ready!');
      return true;
    } catch (error) {
      console.error('Failed to initialize Coach AI:', error);
      return false;
    }
  }
  
  /**
   * Enable coaching mode
   */
  async enable(autoHint = false) {
    const initialized = await this.init();
    if (!initialized) return false;
    
    this.enabled = true;
    this.autoHint = autoHint;
    this.showCoachPanel();
    
    return true;
  }
  
  /**
   * Disable coaching mode
   */
  disable() {
    this.enabled = false;
    this.hideCoachPanel();
  }
  
  /**
   * Get move suggestion and explanation
   */
  async getHint(moveHistory = []) {
    if (!this.enabled || !this.engine) return null;
    
    try {
      // Get best move from coach
      const bestMove = await this.engine.getBestMove(null, moveHistory, 2000);
      
      if (!bestMove) return null;
      
      // Convert to readable format
      const move = StockfishEngine.uciToCoords(bestMove);
      
      // Generate explanation
      const explanation = this.explainMove(move, moveHistory);
      
      this.lastAnalysis = {
        bestMove: move,
        uciMove: bestMove,
        explanation: explanation
      };
      
      return this.lastAnalysis;
      
    } catch (error) {
      console.error('Coach hint error:', error);
      return null;
    }
  }
  
  /**
   * Explain why a move is good
   */
  explainMove(move, moveHistory) {
    // Get piece type
    const board = this.app.engine.getBoard();
    const piece = board.getPiece(move.from.row, move.from.col);
    const pieceType = piece ? piece[1] : '?';
    const pieceNames = {
      'P': 'pawn', 'N': 'knight', 'B': 'bishop', 
      'R': 'rook', 'Q': 'queen', 'K': 'king'
    };
    const pieceName = pieceNames[pieceType] || 'piece';
    
    // Get target square
    const files = 'abcdefgh';
    const ranks = '87654321';
    const toSquare = files[move.to.col] + ranks[move.to.row];
    
    // Generate context-aware explanation
    const explanations = [];
    
    // Opening phase (first 10 moves)
    if (moveHistory.length < 20) {
      explanations.push(
        `Move your ${pieceName} to ${toSquare}. ` +
        `In the opening, focus on controlling the center and developing your pieces.`
      );
    }
    
    // Check if it's a capture
    const targetPiece = board.getPiece(move.to.row, move.to.col);
    if (targetPiece) {
      const targetName = pieceNames[targetPiece[1]] || 'piece';
      explanations.push(`This captures the opponent's ${targetName}!`);
    }
    
    // Check if it develops a piece
    if (pieceType !== 'P' && moveHistory.length < 20) {
      explanations.push(`Good development - getting pieces into the game early is crucial.`);
    }
    
    // Default strategic advice
    const strategies = [
      `This move strengthens your position.`,
      `Look for tactical opportunities after this move.`,
      `This improves your piece coordination.`,
      `Consider your opponent's threats after moving.`
    ];
    
    if (explanations.length === 0) {
      explanations.push(strategies[Math.floor(Math.random() * strategies.length)]);
    }
    
    return explanations.join(' ');
  }
  
  /**
   * Analyze current position and give general advice
   */
  async analyzePosition(moveHistory = []) {
    if (!this.enabled) return null;
    
    const hint = await this.getHint(moveHistory);
    
    if (!hint) return null;
    
    // Add general strategic advice
    const stage = this.getGameStage(moveHistory);
    const advice = this.getStrategicAdvice(stage);
    
    return {
      ...hint,
      stage: stage,
      advice: advice
    };
  }
  
  /**
   * Determine game stage
   */
  getGameStage(moveHistory) {
    const moveCount = moveHistory.length;
    
    if (moveCount < 20) return 'opening';
    if (moveCount < 60) return 'middlegame';
    return 'endgame';
  }
  
  /**
   * Get strategic advice for game stage
   */
  getStrategicAdvice(stage) {
    const advice = {
      opening: [
        "🎯 Opening Tips: Control the center, develop knights before bishops, castle early for king safety.",
        "📚 Opening Goals: Get your pieces out, control key squares, prepare for the middlegame.",
        "♟️ Opening Principles: Don't move the same piece twice, develop with a threat when possible."
      ],
      middlegame: [
        "⚔️ Middlegame Strategy: Look for tactical opportunities, improve piece placement, create threats.",
        "🎭 Middlegame Focus: Attack weak points, coordinate your pieces, consider pawn breaks.",
        "🧩 Middlegame Plans: Improve your worst piece, target opponent weaknesses, maintain tension."
      ],
      endgame: [
        "👑 Endgame Key: Activate your king! In the endgame, the king becomes a strong piece.",
        "⚡ Endgame Priority: Passed pawns are crucial, keep your king active, use opposition.",
        "🏆 Endgame Technique: Push passed pawns, use your king actively, be precise with moves."
      ]
    };
    
    const stageAdvice = advice[stage] || advice.middlegame;
    return stageAdvice[Math.floor(Math.random() * stageAdvice.length)];
  }
  
  /**
   * Show coach panel in UI
   */
  showCoachPanel() {
    let panel = document.getElementById('coach-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'coach-panel';
      panel.className = 'coach-panel';
      panel.innerHTML = `
        <div class="coach-header">
          <span class="coach-icon">🎓</span>
          <span class="coach-title">Chess Coach</span>
          <button class="coach-close" onclick="window.app.aiManager.coachAI.disable()">×</button>
        </div>
        <div class="coach-content">
          <div class="coach-hint" id="coach-hint">
            <em>Click "Get Hint" to see the best move!</em>
          </div>
          <div class="coach-advice" id="coach-advice"></div>
        </div>
        <div class="coach-actions">
          <button class="btn-primary" onclick="window.app.requestHint()">💡 Get Hint</button>
          <button class="btn-secondary" onclick="window.app.requestAnalysis()">📊 Analyze</button>
        </div>
      `;
      document.body.appendChild(panel);
    }
    panel.style.display = 'flex';
  }
  
  /**
   * Hide coach panel
   */
  hideCoachPanel() {
    const panel = document.getElementById('coach-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }
  
  /**
   * Update coach panel with hint
   */
  displayHint(analysis) {
    const hintEl = document.getElementById('coach-hint');
    const adviceEl = document.getElementById('coach-advice');
    
    if (hintEl && analysis) {
      const files = 'abcdefgh';
      const ranks = '87654321';
      const fromSquare = files[analysis.bestMove.from.col] + ranks[analysis.bestMove.from.row];
      const toSquare = files[analysis.bestMove.to.col] + ranks[analysis.bestMove.to.row];
      
      hintEl.innerHTML = `
        <strong>💡 Best Move:</strong> ${fromSquare} → ${toSquare}<br>
        <em>${analysis.explanation}</em>
      `;
      
      // Highlight the suggested squares on the board
      this.highlightSuggestion(analysis.bestMove);
    }
    
    if (adviceEl && analysis && analysis.advice) {
      adviceEl.innerHTML = `<div class="strategic-tip">${analysis.advice}</div>`;
    }
  }
  
  /**
   * Highlight suggested move on board
   */
  highlightSuggestion(move) {
    // Store suggestion for board rendering
    this.app.coachSuggestion = move;
    this.app.render();
    
    // Clear after 10 seconds
    setTimeout(() => {
      this.app.coachSuggestion = null;
      this.app.render();
    }, 10000);
  }
  
  /**
   * Clear displayed hint
   */
  clearHint() {
    const hintEl = document.getElementById('coach-hint');
    if (hintEl) {
      hintEl.innerHTML = '<em>Click "Get Hint" to see the best move!</em>';
    }
    
    this.app.coachSuggestion = null;
    this.app.render();
  }
}

