/**
 * Checkers Theme Manager - Checkers-specific themes and rendering
 * Phase 10: Checkers Implementation
 * 
 * Manages checkers piece sets and board themes
 */

export class CheckersThemeManager {
  constructor() {
    this.pieceSets = this.initializePieceSets();
    this.boardThemes = this.initializeBoardThemes();
    this.currentPieceSet = 'classic';
    this.currentBoardTheme = 'brown';
  }
  
  /**
   * Initialize checkers piece sets
   */
  initializePieceSets() {
    return {
      classic: {
        name: 'Classic',
        description: 'Traditional checkers pieces',
        pieces: {
          'red': '●',
          'black': '●',
          'red_king': '♔',
          'black_king': '♔'
        },
        style: {
          fontSize: 0.7,
          redColor: '#dc3545',
          blackColor: '#343a40',
          redKingColor: '#dc3545',
          blackKingColor: '#343a40',
          redShadow: '#a71e2a',
          blackShadow: '#212529',
          glow: false
        }
      },
      modern: {
        name: 'Modern',
        description: 'Clean, modern checkers design',
        pieces: {
          'red': '●',
          'black': '●',
          'red_king': '♛',
          'black_king': '♛'
        },
        style: {
          fontSize: 0.75,
          redColor: '#e74c3c',
          blackColor: '#2c3e50',
          redKingColor: '#e74c3c',
          blackKingColor: '#2c3e50',
          redShadow: '#c0392b',
          blackShadow: '#1a252f',
          glow: true
        }
      },
      bold: {
        name: 'Bold',
        description: 'Bold, high-contrast pieces',
        pieces: {
          'red': '●',
          'black': '●',
          'red_king': '♚',
          'black_king': '♚'
        },
        style: {
          fontSize: 0.8,
          redColor: '#ff0000',
          blackColor: '#000000',
          redKingColor: '#ff0000',
          blackKingColor: '#000000',
          redShadow: '#cc0000',
          blackShadow: '#333333',
          glow: false
        }
      },
      neon: {
        name: 'Neon',
        description: 'Glowing neon checkers',
        pieces: {
          'red': '●',
          'black': '●',
          'red_king': '♔',
          'black_king': '♔'
        },
        style: {
          fontSize: 0.7,
          redColor: '#ff0080',
          blackColor: '#00ff80',
          redKingColor: '#ff0080',
          blackKingColor: '#00ff80',
          redShadow: '#cc0066',
          blackShadow: '#00cc66',
          glow: true
        }
      },
      royal: {
        name: 'Royal',
        description: 'Elegant royal checkers',
        pieces: {
          'red': '●',
          'black': '●',
          'red_king': '♔',
          'black_king': '♔'
        },
        style: {
          fontSize: 0.75,
          redColor: '#8b0000',
          blackColor: '#2f4f4f',
          redKingColor: '#8b0000',
          blackKingColor: '#2f4f4f',
          redShadow: '#660000',
          blackShadow: '#1a3a3a',
          glow: true
        }
      }
    };
  }
  
  /**
   * Initialize checkers board themes
   */
  initializeBoardThemes() {
    return {
      brown: {
        name: 'Classic Brown',
        description: 'Traditional brown and tan checkers board',
        light: '#f0d9b5',
        dark: '#b58863',
        border: '#8b4513',
        highlight: '#ffeb3b',
        lastMove: '#4caf50',
        check: '#f44336'
      },
      blue: {
        name: 'Ocean Blue',
        description: 'Cool blue and white checkers board',
        light: '#e3f2fd',
        dark: '#1976d2',
        border: '#0d47a1',
        highlight: '#ffeb3b',
        lastMove: '#4caf50',
        check: '#f44336'
      },
      green: {
        name: 'Forest Green',
        description: 'Natural green checkers board',
        light: '#e8f5e8',
        dark: '#4caf50',
        border: '#2e7d32',
        highlight: '#ffeb3b',
        lastMove: '#2196f3',
        check: '#f44336'
      },
      purple: {
        name: 'Purple Haze',
        description: 'Mystical purple checkers board',
        light: '#f3e5f5',
        dark: '#9c27b0',
        border: '#6a1b9a',
        highlight: '#ffeb3b',
        lastMove: '#4caf50',
        check: '#f44336'
      },
      marble: {
        name: 'Marble',
        description: 'Elegant marble checkers board',
        light: '#f5f5f5',
        dark: '#9e9e9e',
        border: '#616161',
        highlight: '#ffeb3b',
        lastMove: '#4caf50',
        check: '#f44336'
      },
      tournament: {
        name: 'Tournament',
        description: 'Professional tournament checkers board',
        light: '#ffffff',
        dark: '#000000',
        border: '#333333',
        highlight: '#ffeb3b',
        lastMove: '#4caf50',
        check: '#f44336'
      },
      dark: {
        name: 'Dark Mode',
        description: 'Dark theme checkers board',
        light: '#424242',
        dark: '#212121',
        border: '#000000',
        highlight: '#ffeb3b',
        lastMove: '#4caf50',
        check: '#f44336'
      },
      neon: {
        name: 'Neon Nights',
        description: 'Glowing neon checkers board',
        light: '#1a1a2e',
        dark: '#16213e',
        border: '#0f3460',
        highlight: '#00ff80',
        lastMove: '#ff0080',
        check: '#ff0000'
      }
    };
  }
  
  /**
   * Get all piece sets
   */
  getAllPieceSets() {
    return Object.keys(this.pieceSets).map(key => ({
      id: key,
      ...this.pieceSets[key]
    }));
  }
  
  /**
   * Get all board themes
   */
  getAllBoardThemes() {
    return Object.keys(this.boardThemes).map(key => ({
      id: key,
      ...this.boardThemes[key]
    }));
  }
  
  /**
   * Get current piece set
   */
  getCurrentPieceSet() {
    return this.pieceSets[this.currentPieceSet];
  }
  
  /**
   * Get current board theme
   */
  getCurrentBoardTheme() {
    return this.boardThemes[this.currentBoardTheme];
  }
  
  /**
   * Set piece set
   */
  setPieceSet(pieceSetId) {
    if (this.pieceSets[pieceSetId]) {
      this.currentPieceSet = pieceSetId;
      this.saveSettings();
    }
  }
  
  /**
   * Set board theme
   */
  setBoardTheme(themeId) {
    if (this.boardThemes[themeId]) {
      this.currentBoardTheme = themeId;
      this.saveSettings();
    }
  }
  
  /**
   * Get piece symbol
   */
  getPieceSymbol(piece) {
    const pieceSet = this.getCurrentPieceSet();
    return pieceSet.pieces[piece] || '?';
  }
  
  /**
   * Get piece style
   */
  getPieceStyle(piece) {
    const pieceSet = this.getCurrentPieceSet();
    const style = pieceSet.style;
    
    if (piece === 'red') {
      return {
        color: style.redColor,
        shadow: style.redShadow
      };
    } else if (piece === 'black') {
      return {
        color: style.blackColor,
        shadow: style.blackShadow
      };
    } else if (piece === 'red_king') {
      return {
        color: style.redKingColor,
        shadow: style.redShadow
      };
    } else if (piece === 'black_king') {
      return {
        color: style.blackKingColor,
        shadow: style.blackShadow
      };
    }
    
    return {
      color: '#666666',
      shadow: '#333333'
    };
  }
  
  /**
   * Load settings from localStorage
   */
  loadSettings() {
    const savedPieceSet = localStorage.getItem('mate-checkers-piece-set');
    const savedBoardTheme = localStorage.getItem('mate-checkers-board-theme');
    
    if (savedPieceSet && this.pieceSets[savedPieceSet]) {
      this.currentPieceSet = savedPieceSet;
    }
    
    if (savedBoardTheme && this.boardThemes[savedBoardTheme]) {
      this.currentBoardTheme = savedBoardTheme;
    }
  }
  
  /**
   * Save settings to localStorage
   */
  saveSettings() {
    localStorage.setItem('mate-checkers-piece-set', this.currentPieceSet);
    localStorage.setItem('mate-checkers-board-theme', this.currentBoardTheme);
  }
  
  /**
   * Initialize theme manager
   */
  init() {
    this.loadSettings();
  }
}
