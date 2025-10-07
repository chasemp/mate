/**
 * Learn to Play Mode
 * Interactive chess tutorial for beginners
 */

export class LearnMode {
  constructor(chessApp) {
    this.app = chessApp;
    this.currentLesson = 0;
    this.active = false;
    
    this.lessons = [
      {
        title: "Welcome to Chess!",
        description: "Let's learn how to play chess step by step.",
        setup: 'empty',
        pieces: [],
        instructions: "Chess is played on an 8×8 board with 64 squares. Each player starts with 16 pieces. Click 'Next' to continue!",
        task: null
      },
      {
        title: "The Pawn ♟️",
        description: "Pawns are the foot soldiers of chess",
        setup: 'custom',
        pieces: [{ piece: 'wP', row: 6, col: 4 }],
        instructions: "Pawns move forward one square. On their first move, they can move two squares! Try moving this white pawn forward.",
        task: {
          type: 'move_piece',
          from: { row: 6, col: 4 },
          validMoves: [{ row: 5, col: 4 }, { row: 4, col: 4 }]
        }
      },
      {
        title: "Pawn Captures ⚔️",
        description: "Pawns capture diagonally",
        setup: 'custom',
        pieces: [
          { piece: 'wP', row: 4, col: 4 },
          { piece: 'bP', row: 3, col: 5 }
        ],
        instructions: "Pawns capture pieces diagonally, one square forward. Capture the black pawn!",
        task: {
          type: 'capture',
          from: { row: 4, col: 4 },
          target: { row: 3, col: 5 }
        }
      },
      {
        title: "The Rook ♜",
        description: "Rooks move in straight lines",
        setup: 'custom',
        pieces: [{ piece: 'wR', row: 7, col: 0 }],
        instructions: "Rooks move any number of squares horizontally or vertically. Try moving the rook!",
        task: {
          type: 'move_piece',
          from: { row: 7, col: 0 },
          validMoves: [
            { row: 7, col: 3 }, { row: 7, col: 4 }, 
            { row: 4, col: 0 }, { row: 3, col: 0 }
          ]
        }
      },
      {
        title: "The Bishop ♝",
        description: "Bishops move diagonally",
        setup: 'custom',
        pieces: [{ piece: 'wB', row: 7, col: 2 }],
        instructions: "Bishops move any number of squares diagonally. Move the bishop along a diagonal!",
        task: {
          type: 'move_piece',
          from: { row: 7, col: 2 },
          validMoves: [
            { row: 5, col: 4 }, { row: 4, col: 5 },
            { row: 6, col: 3 }, { row: 5, col: 0 }
          ]
        }
      },
      {
        title: "The Knight ♞",
        description: "Knights jump in an L-shape",
        setup: 'custom',
        pieces: [{ piece: 'wN', row: 7, col: 1 }],
        instructions: "Knights move in an 'L' shape: 2 squares in one direction, then 1 square perpendicular. Knights can jump over other pieces!",
        task: {
          type: 'move_piece',
          from: { row: 7, col: 1 },
          validMoves: [
            { row: 5, col: 0 }, { row: 5, col: 2 },
            { row: 6, col: 3 }
          ]
        }
      },
      {
        title: "The Queen ♛",
        description: "The most powerful piece",
        setup: 'custom',
        pieces: [{ piece: 'wQ', row: 4, col: 4 }],
        instructions: "The Queen combines rook and bishop powers! She can move any number of squares horizontally, vertically, or diagonally.",
        task: {
          type: 'move_piece',
          from: { row: 4, col: 4 },
          validMoves: [
            { row: 4, col: 7 }, { row: 7, col: 4 },
            { row: 1, col: 1 }, { row: 2, col: 6 }
          ]
        }
      },
      {
        title: "The King ♚",
        description: "The most important piece",
        setup: 'custom',
        pieces: [{ piece: 'wK', row: 7, col: 4 }],
        instructions: "The King moves one square in any direction. The goal of chess is to checkmate the opponent's king! Move your king one square.",
        task: {
          type: 'move_piece',
          from: { row: 7, col: 4 },
          validMoves: [
            { row: 7, col: 3 }, { row: 7, col: 5 },
            { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }
          ]
        }
      },
      {
        title: "Check! ⚠️",
        description: "Attacking the enemy king",
        setup: 'custom',
        pieces: [
          { piece: 'wQ', row: 4, col: 3 },
          { piece: 'bK', row: 0, col: 3 }
        ],
        instructions: "When you attack the opponent's king, it's called 'CHECK'. The king must escape! Put the black king in check by moving your queen.",
        task: {
          type: 'check',
          from: { row: 4, col: 3 },
          target: { row: 0, col: 3 }
        }
      },
      {
        title: "Checkmate! 🏆",
        description: "Winning the game",
        setup: 'custom',
        pieces: [
          { piece: 'wQ', row: 7, col: 3 },
          { piece: 'wR', row: 1, col: 0 },
          { piece: 'bK', row: 0, col: 0 }
        ],
        instructions: "Checkmate means the king is in check and cannot escape! Move the queen to deliver checkmate!",
        task: {
          type: 'checkmate',
          from: { row: 7, col: 3 },
          to: { row: 0, col: 1 }
        }
      },
      {
        title: "Congratulations! 🎉",
        description: "You've learned the basics!",
        setup: 'start',
        pieces: [],
        instructions: "You now know how all the pieces move! Ready to play a full game? Start with the AI on beginner mode to practice!",
        task: null
      }
    ];
  }
  
  /**
   * Start tutorial
   */
  start() {
    this.currentLesson = 0;
    this.active = true;
    this.showLesson();
  }
  
  /**
   * Show current lesson
   */
  showLesson() {
    const lesson = this.lessons[this.currentLesson];
    
    // Set up board
    this.setupBoard(lesson);
    
    // Show lesson UI
    this.showLessonUI(lesson);
    
    // Enable interaction if there's a task
    if (lesson.task) {
      this.enableTask(lesson.task);
    }
  }
  
  /**
   * Setup board for lesson
   */
  setupBoard(lesson) {
    const board = this.app.engine.getBoard();
    board.clear();
    
    if (lesson.setup === 'start') {
      this.app.engine.newGame();
    } else if (lesson.setup === 'custom' && lesson.pieces) {
      lesson.pieces.forEach(({ piece, row, col }) => {
        board.setPiece(row, col, piece);
      });
    }
    
    this.app.render();
  }
  
  /**
   * Show lesson UI
   */
  showLessonUI(lesson) {
    let panel = document.getElementById('learn-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'learn-panel';
      panel.className = 'learn-panel';
      document.body.appendChild(panel);
    }
    
    const progress = ((this.currentLesson + 1) / this.lessons.length * 100).toFixed(0);
    
    panel.innerHTML = `
      <div class="learn-header">
        <span class="learn-icon">🎓</span>
        <div class="learn-title">
          <h3>${lesson.title}</h3>
          <p>${lesson.description}</p>
        </div>
        <button class="learn-close" onclick="window.app.learnMode.exit()">×</button>
      </div>
      <div class="learn-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="progress-text">Lesson ${this.currentLesson + 1} of ${this.lessons.length}</span>
      </div>
      <div class="learn-content">
        <p class="learn-instructions">${lesson.instructions}</p>
      </div>
      <div class="learn-actions">
        ${this.currentLesson > 0 ? '<button class="btn-secondary" onclick="window.app.learnMode.previousLesson()">← Previous</button>' : ''}
        ${!lesson.task ? '<button class="btn-primary" onclick="window.app.learnMode.nextLesson()">Next →</button>' : ''}
      </div>
    `;
    
    panel.style.display = 'flex';
  }
  
  /**
   * Enable task interaction
   */
  enableTask(task) {
    // Task will be validated in the main app's move handler
    this.app.currentTask = task;
  }
  
  /**
   * Validate task completion
   */
  validateTask(fromRow, fromCol, toRow, toCol) {
    const task = this.app.currentTask;
    if (!task) return false;
    
    // Check if correct piece was moved
    if (task.from && (task.from.row !== fromRow || task.from.col !== fromCol)) {
      return false;
    }
    
    if (task.type === 'move_piece') {
      return task.validMoves.some(m => m.row === toRow && m.col === toCol);
    }
    
    if (task.type === 'capture' || task.type === 'check' || task.type === 'checkmate') {
      return task.to ? (task.to.row === toRow && task.to.col === toCol) :
             task.target ? (task.target.row === toRow && task.target.col === toCol) :
             false;
    }
    
    return false;
  }
  
  /**
   * Task completed - move to next lesson
   */
  taskCompleted() {
    this.app.showNotification('✅ Great job! Moving to next lesson...');
    setTimeout(() => this.nextLesson(), 1500);
  }
  
  /**
   * Next lesson
   */
  nextLesson() {
    if (this.currentLesson < this.lessons.length - 1) {
      this.currentLesson++;
      this.showLesson();
    } else {
      this.complete();
    }
  }
  
  /**
   * Previous lesson
   */
  previousLesson() {
    if (this.currentLesson > 0) {
      this.currentLesson--;
      this.showLesson();
    }
  }
  
  /**
   * Complete tutorial
   */
  complete() {
    this.app.showNotification('🎉 Tutorial complete! You\'re ready to play!');
    this.exit();
  }
  
  /**
   * Exit tutorial
   */
  exit() {
    this.active = false;
    this.app.currentTask = null;
    
    const panel = document.getElementById('learn-panel');
    if (panel) {
      panel.style.display = 'none';
    }
    
    // Return to normal game
    this.app.engine.newGame();
    this.app.render();
  }
}

