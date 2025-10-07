/**
 * Stockfish Engine Wrapper
 * Manages communication with Stockfish WASM engine via Web Worker
 */

export class StockfishEngine {
  constructor() {
    this.worker = null;
    this.ready = false;
    this.resolveMove = null;
    this.rejectMove = null;
    this.currentFen = '';
    this.skillLevel = 10; // Default skill level
    this.thinkingTime = 1000; // Default thinking time in ms
  }

  /**
   * Initialize the Stockfish Web Worker.
   * @returns {Promise<boolean>} True if initialized successfully.
   */
  async init() {
    if (this.worker) {
      this.quit();
    }
    
    try {
      // Load Stockfish worker from public directory (loads from CDN)
      this.worker = new Worker('/stockfish-worker.js');
      
      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = (error) => {
        console.error('❌ Stockfish Worker Error:', error);
        if (this.rejectMove) {
          this.rejectMove(new Error('Stockfish worker error'));
          this.rejectMove = null;
        }
      };
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Stockfish initialization timeout'));
        }, 10000);
        
        const messageHandler = (e) => {
          const msg = e.data;
          
          // Check for ready message from our worker
          if (msg && msg.type === 'ready') {
            clearTimeout(timeout);
            this.sendCommand('uci');
            
            // Wait for uciok
            const uciWaiter = () => {
              const line = e.data;
              if (typeof line === 'string' && line === 'uciok') {
                this.ready = true;
                console.log('✅ Stockfish initialized');
                this.worker.removeEventListener('message', uciWaiter);
                this.configureEngine();
                resolve(true);
              }
            };
            
            this.worker.addEventListener('message', uciWaiter);
          }
        };
        
        this.worker.addEventListener('message', messageHandler);
      });
    } catch (error) {
      console.error('❌ Failed to initialize Stockfish:', error);
      throw error;
    }
  }

  /**
   * Configure engine settings
   */
  configureEngine() {
    this.setSkillLevel(this.skillLevel);
    this.sendCommand('ucinewgame');
  }

  /**
   * Handle messages from Stockfish
   */
  handleMessage(e) {
    const line = e.data;
    if (typeof line !== 'string') return;

    console.log('Stockfish:', line);

    // Parse best move
    if (line.startsWith('bestmove')) {
      const match = line.match(/bestmove ([a-h][1-8][a-h][1-8])([qrbn])?/);
      if (match && this.resolveMove) {
        const move = {
          from: match[1].substring(0, 2),
          to: match[1].substring(2, 4),
          promotion: match[2] || null
        };
        this.resolveMove(move);
        this.resolveMove = null;
        this.rejectMove = null;
      }
    }

    // Handle uciok
    if (line === 'uciok') {
      this.ready = true;
    }
  }

  /**
   * Send command to Stockfish
   */
  sendCommand(cmd) {
    if (this.worker) {
      console.log('→ Stockfish:', cmd);
      this.worker.postMessage(cmd);
    }
  }

  /**
   * Set skill level (0-20)
   */
  setSkillLevel(level) {
    this.skillLevel = Math.max(0, Math.min(20, level));
    const elo = 800 + (this.skillLevel * 110); // Approximate ELO
    
    // Configure strength
    this.sendCommand('setoption name Skill Level value ' + this.skillLevel);
    this.sendCommand('setoption name UCI_LimitStrength value true');
    this.sendCommand('setoption name UCI_Elo value ' + elo);
  }

  /**
   * Get best move for current position
   * @param {string} fen - FEN string of current position
   * @param {Array} moveHistory - Array of moves in UCI format
   * @returns {Promise<Object>} Best move {from, to, promotion}
   */
  async getBestMove(fen, moveHistory = []) {
    if (!this.ready) {
      throw new Error('Stockfish not ready');
    }

    return new Promise((resolve, reject) => {
      this.resolveMove = resolve;
      this.rejectMove = reject;

      // Set up position
      if (moveHistory.length > 0) {
        const movesUCI = moveHistory.map(m => this.moveToUCI(m)).join(' ');
        this.sendCommand(`position startpos moves ${movesUCI}`);
      } else {
        this.sendCommand(`position fen ${fen}`);
      }

      // Start thinking
      this.sendCommand(`go movetime ${this.thinkingTime}`);

      // Timeout fallback
      setTimeout(() => {
        if (this.rejectMove) {
          this.rejectMove(new Error('Move calculation timeout'));
          this.rejectMove = null;
          this.resolveMove = null;
        }
      }, this.thinkingTime + 5000);
    });
  }

  /**
   * Convert move object to UCI notation
   */
  moveToUCI(move) {
    if (typeof move === 'string') return move;
    
    const fromSquare = this.positionToSquare(move.from.row, move.from.col);
    const toSquare = this.positionToSquare(move.to.row, move.to.col);
    const promotion = move.promotion ? move.promotion.to[1].toLowerCase() : '';
    return fromSquare + toSquare + promotion;
  }

  /**
   * Convert row/col to square notation (e.g. e2, e4)
   */
  positionToSquare(row, col) {
    const file = String.fromCharCode(97 + col); // a-h
    const rank = 8 - row; // 1-8
    return file + rank;
  }

  /**
   * Convert square notation to row/col
   */
  squareToPosition(square) {
    const file = square.charCodeAt(0) - 97; // a-h → 0-7
    const rank = 8 - parseInt(square[1]); // 1-8 → 7-0
    return { row: rank, col: file };
  }

  /**
   * Stop current analysis
   */
  stop() {
    if (this.worker) {
      this.sendCommand('stop');
    }
  }

  /**
   * Quit and cleanup
   */
  quit() {
    if (this.worker) {
      this.sendCommand('quit');
      this.worker.terminate();
      this.worker = null;
      this.ready = false;
    }
  }
}
