/**
 * Game Variants - Custom game variants system
 * Phase 11: Advanced Features
 * 
 * Manages custom game variants and rule modifications
 */

export class GameVariants {
  constructor() {
    this.variants = this.initializeVariants();
    this.customVariants = this.loadCustomVariants();
  }
  
  /**
   * Initialize built-in variants
   */
  initializeVariants() {
    return {
      'chess': {
        name: 'Standard Chess',
        description: 'Classic chess with standard rules',
        gameType: 'chess',
        rules: {
          boardSize: { rows: 8, cols: 8 },
          pieceSetup: 'standard',
          specialMoves: ['castling', 'enPassant', 'promotion'],
          winConditions: ['checkmate', 'stalemate'],
          drawConditions: ['stalemate', 'insufficientMaterial', 'fiftyMoveRule', 'threefoldRepetition']
        },
        isDefault: true
      },
      'chess960': {
        name: 'Chess960 (Fischer Random)',
        description: 'Chess with randomized starting positions',
        gameType: 'chess',
        rules: {
          boardSize: { rows: 8, cols: 8 },
          pieceSetup: 'random960',
          specialMoves: ['castling', 'enPassant', 'promotion'],
          winConditions: ['checkmate', 'stalemate'],
          drawConditions: ['stalemate', 'insufficientMaterial', 'fiftyMoveRule', 'threefoldRepetition']
        },
        isDefault: false
      },
      'kingofthehill': {
        name: 'King of the Hill',
        description: 'Win by getting your king to the center',
        gameType: 'chess',
        rules: {
          boardSize: { rows: 8, cols: 8 },
          pieceSetup: 'standard',
          specialMoves: ['castling', 'enPassant', 'promotion'],
          winConditions: ['kingOfTheHill', 'checkmate', 'stalemate'],
          drawConditions: ['stalemate', 'insufficientMaterial', 'fiftyMoveRule', 'threefoldRepetition'],
          centerSquares: ['d4', 'd5', 'e4', 'e5']
        },
        isDefault: false
      },
      'atomic': {
        name: 'Atomic Chess',
        description: 'Pieces explode when captured',
        gameType: 'chess',
        rules: {
          boardSize: { rows: 8, cols: 8 },
          pieceSetup: 'standard',
          specialMoves: ['castling', 'enPassant', 'promotion', 'atomic'],
          winConditions: ['checkmate', 'stalemate', 'atomic'],
          drawConditions: ['stalemate', 'insufficientMaterial', 'fiftyMoveRule', 'threefoldRepetition'],
          explosionRadius: 1
        },
        isDefault: false
      },
      'horde': {
        name: 'Horde Chess',
        description: 'White has many pawns, Black has standard pieces',
        gameType: 'chess',
        rules: {
          boardSize: { rows: 8, cols: 8 },
          pieceSetup: 'horde',
          specialMoves: ['castling', 'enPassant', 'promotion'],
          winConditions: ['checkmate', 'stalemate', 'horde'],
          drawConditions: ['stalemate', 'insufficientMaterial', 'fiftyMoveRule', 'threefoldRepetition']
        },
        isDefault: false
      },
      'checkers': {
        name: 'Standard Checkers',
        description: 'Classic checkers with standard rules',
        gameType: 'checkers',
        rules: {
          boardSize: { rows: 8, cols: 8 },
          pieceSetup: 'standard',
          specialMoves: ['capture', 'kingPromotion'],
          winConditions: ['noPieces', 'noMoves'],
          drawConditions: ['noMoves', 'repetition']
        },
        isDefault: true
      },
      'international': {
        name: 'International Checkers',
        description: 'Checkers on 10x10 board with flying kings',
        gameType: 'checkers',
        rules: {
          boardSize: { rows: 10, cols: 10 },
          pieceSetup: 'international',
          specialMoves: ['capture', 'flyingKing'],
          winConditions: ['noPieces', 'noMoves'],
          drawConditions: ['noMoves', 'repetition']
        },
        isDefault: false
      },
      'giveaway': {
        name: 'Giveaway Checkers',
        description: 'Lose all your pieces to win',
        gameType: 'checkers',
        rules: {
          boardSize: { rows: 8, cols: 8 },
          pieceSetup: 'standard',
          specialMoves: ['capture', 'kingPromotion'],
          winConditions: ['noPieces', 'noMoves'],
          drawConditions: ['noMoves', 'repetition'],
          objective: 'lose'
        },
        isDefault: false
      }
    };
  }
  
  /**
   * Get all variants for a game type
   */
  getVariantsForGameType(gameType) {
    const variants = Object.values(this.variants).filter(v => v.gameType === gameType);
    const custom = Object.values(this.customVariants).filter(v => v.gameType === gameType);
    return [...variants, ...custom];
  }
  
  /**
   * Get variant by ID
   */
  getVariant(variantId) {
    return this.variants[variantId] || this.customVariants[variantId] || null;
  }
  
  /**
   * Create custom variant
   */
  createCustomVariant(config) {
    const variant = {
      id: `custom-${Date.now()}`,
      name: config.name,
      description: config.description,
      gameType: config.gameType,
      rules: config.rules,
      isDefault: false,
      isCustom: true,
      createdAt: Date.now(),
      createdBy: 'user'
    };
    
    this.customVariants[variant.id] = variant;
    this.saveCustomVariants();
    
    return variant;
  }
  
  /**
   * Update custom variant
   */
  updateCustomVariant(variantId, updates) {
    if (!this.customVariants[variantId]) {
      return false;
    }
    
    this.customVariants[variantId] = {
      ...this.customVariants[variantId],
      ...updates,
      updatedAt: Date.now()
    };
    
    this.saveCustomVariants();
    return true;
  }
  
  /**
   * Delete custom variant
   */
  deleteCustomVariant(variantId) {
    if (!this.customVariants[variantId]) {
      return false;
    }
    
    delete this.customVariants[variantId];
    this.saveCustomVariants();
    return true;
  }
  
  /**
   * Get variant rules
   */
  getVariantRules(variantId) {
    const variant = this.getVariant(variantId);
    return variant ? variant.rules : null;
  }
  
  /**
   * Check if variant supports a rule
   */
  supportsRule(variantId, rule) {
    const rules = this.getVariantRules(variantId);
    if (!rules) return false;
    
    // Check special moves
    if (rule.startsWith('specialMove:')) {
      const moveType = rule.split(':')[1];
      return rules.specialMoves && rules.specialMoves.includes(moveType);
    }
    
    // Check win conditions
    if (rule.startsWith('winCondition:')) {
      const condition = rule.split(':')[1];
      return rules.winConditions && rules.winConditions.includes(condition);
    }
    
    // Check draw conditions
    if (rule.startsWith('drawCondition:')) {
      const condition = rule.split(':')[1];
      return rules.drawConditions && rules.drawConditions.includes(condition);
    }
    
    return false;
  }
  
  /**
   * Get board setup for variant
   */
  getBoardSetup(variantId) {
    const variant = this.getVariant(variantId);
    if (!variant) return null;
    
    const rules = variant.rules;
    
    switch (rules.pieceSetup) {
      case 'standard':
        return this.getStandardSetup(rules.gameType);
      case 'random960':
        return this.getRandom960Setup();
      case 'horde':
        return this.getHordeSetup();
      case 'international':
        return this.getInternationalCheckersSetup();
      default:
        return this.getStandardSetup(rules.gameType);
    }
  }
  
  /**
   * Get standard chess setup
   */
  getStandardSetup(gameType) {
    if (gameType === 'chess') {
      return {
        'a1': 'rook', 'b1': 'knight', 'c1': 'bishop', 'd1': 'queen', 'e1': 'king', 'f1': 'bishop', 'g1': 'knight', 'h1': 'rook',
        'a2': 'pawn', 'b2': 'pawn', 'c2': 'pawn', 'd2': 'pawn', 'e2': 'pawn', 'f2': 'pawn', 'g2': 'pawn', 'h2': 'pawn',
        'a7': 'pawn', 'b7': 'pawn', 'c7': 'pawn', 'd7': 'pawn', 'e7': 'pawn', 'f7': 'pawn', 'g7': 'pawn', 'h7': 'pawn',
        'a8': 'rook', 'b8': 'knight', 'c8': 'bishop', 'd8': 'queen', 'e8': 'king', 'f8': 'bishop', 'g8': 'knight', 'h8': 'rook'
      };
    } else if (gameType === 'checkers') {
      const setup = {};
      // Red pieces (top 3 rows)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
          if ((row + col) % 2 === 1) {
            setup[String.fromCharCode(97 + col) + (8 - row)] = 'red';
          }
        }
      }
      // Black pieces (bottom 3 rows)
      for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if ((row + col) % 2 === 1) {
            setup[String.fromCharCode(97 + col) + (8 - row)] = 'black';
          }
        }
      }
      return setup;
    }
    return {};
  }
  
  /**
   * Get random 960 setup
   */
  getRandom960Setup() {
    // Simplified 960 setup - in practice, this would be more complex
    const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    const shuffled = this.shuffleArray([...pieces]);
    
    const setup = {};
    for (let i = 0; i < 8; i++) {
      const file = String.fromCharCode(97 + i);
      setup[file + '1'] = shuffled[i];
      setup[file + '2'] = 'pawn';
      setup[file + '7'] = 'pawn';
      setup[file + '8'] = shuffled[i];
    }
    
    return setup;
  }
  
  /**
   * Get horde setup
   */
  getHordeSetup() {
    const setup = {};
    
    // White pieces (horde)
    for (let col = 0; col < 8; col++) {
      setup[String.fromCharCode(97 + col) + '4'] = 'pawn';
      setup[String.fromCharCode(97 + col) + '5'] = 'pawn';
    }
    
    // Black pieces (standard)
    setup['a8'] = 'rook'; setup['b8'] = 'knight'; setup['c8'] = 'bishop'; setup['d8'] = 'queen';
    setup['e8'] = 'king'; setup['f8'] = 'bishop'; setup['g8'] = 'knight'; setup['h8'] = 'rook';
    for (let col = 0; col < 8; col++) {
      setup[String.fromCharCode(97 + col) + '7'] = 'pawn';
    }
    
    return setup;
  }
  
  /**
   * Get international checkers setup
   */
  getInternationalCheckersSetup() {
    const setup = {};
    
    // Red pieces (top 4 rows)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        if ((row + col) % 2 === 1) {
          setup[String.fromCharCode(97 + col) + (10 - row)] = 'red';
        }
      }
    }
    
    // Black pieces (bottom 4 rows)
    for (let row = 6; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if ((row + col) % 2 === 1) {
          setup[String.fromCharCode(97 + col) + (10 - row)] = 'black';
        }
      }
    }
    
    return setup;
  }
  
  /**
   * Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Load custom variants from localStorage
   */
  loadCustomVariants() {
    const saved = localStorage.getItem('mate-custom-variants');
    return saved ? JSON.parse(saved) : {};
  }
  
  /**
   * Save custom variants to localStorage
   */
  saveCustomVariants() {
    localStorage.setItem('mate-custom-variants', JSON.stringify(this.customVariants));
  }
  
  /**
   * Export custom variants
   */
  exportCustomVariants() {
    return {
      variants: this.customVariants,
      exportDate: new Date().toISOString()
    };
  }
  
  /**
   * Import custom variants
   */
  importCustomVariants(data) {
    if (data.variants) {
      this.customVariants = { ...this.customVariants, ...data.variants };
      this.saveCustomVariants();
    }
  }
}
