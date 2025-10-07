/**
 * Checkers Tutorial - Interactive learning system
 * Phase 10: Checkers Implementation
 * 
 * Provides step-by-step tutorials for learning checkers
 */

export class CheckersTutorial {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentLesson = 0;
    this.active = false;
    this.currentTask = null;
    
    this.lessons = this.initializeLessons();
  }
  
  /**
   * Initialize tutorial lessons
   */
  initializeLessons() {
    return [
      {
        id: 'basic-moves',
        title: 'Basic Moves',
        description: 'Learn how pieces move diagonally',
        steps: [
          {
            instruction: 'Red pieces move diagonally forward (down)',
            highlight: { row: 2, col: 1 },
            explanation: 'Click on the red piece to see its possible moves'
          },
          {
            instruction: 'Black pieces move diagonally forward (up)',
            highlight: { row: 5, col: 0 },
            explanation: 'Black pieces move in the opposite direction'
          }
        ]
      },
      {
        id: 'captures',
        title: 'Capturing Pieces',
        description: 'Learn how to capture by jumping over opponents',
        steps: [
          {
            instruction: 'To capture, jump over an opponent piece diagonally',
            highlight: { row: 2, col: 3 },
            explanation: 'You can only capture if there\'s an empty square beyond the opponent'
          },
          {
            instruction: 'Multiple captures are possible in one turn',
            highlight: { row: 3, col: 4 },
            explanation: 'If you can capture again after a capture, you must continue'
          }
        ]
      },
      {
        id: 'kings',
        title: 'King Promotion',
        description: 'Learn about promoting pieces to kings',
        steps: [
          {
            instruction: 'When a piece reaches the opposite end, it becomes a king',
            highlight: { row: 7, col: 0 },
            explanation: 'Kings can move in any diagonal direction'
          },
          {
            instruction: 'Kings are more powerful and can move backwards',
            highlight: { row: 0, col: 7 },
            explanation: 'Kings can capture in any diagonal direction'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Basic Strategy',
        description: 'Learn fundamental checkers strategy',
        steps: [
          {
            instruction: 'Control the center of the board',
            highlight: { row: 3, col: 3 },
            explanation: 'Center pieces have more mobility and options'
          },
          {
            instruction: 'Keep your pieces together for support',
            highlight: { row: 2, col: 1 },
            explanation: 'Isolated pieces are easier to capture'
          }
        ]
      }
    ];
  }
  
  /**
   * Start tutorial
   */
  startTutorial() {
    this.active = true;
    this.currentLesson = 0;
    this.currentTask = null;
    this.gameEngine.newGame();
    this.showLesson(this.lessons[0]);
  }
  
  /**
   * Show a specific lesson
   */
  showLesson(lesson) {
    this.currentTask = lesson.steps[0];
    this.showInstruction();
  }
  
  /**
   * Show current instruction
   */
  showInstruction() {
    if (!this.currentTask) return;
    
    // This would integrate with the UI to show instructions
    console.log(`[CheckersTutorial] ${this.currentTask.instruction}`);
    console.log(`[CheckersTutorial] ${this.currentTask.explanation}`);
    
    // Highlight the relevant piece
    if (this.currentTask.highlight) {
      this.highlightPiece(this.currentTask.highlight.row, this.currentTask.highlight.col);
    }
  }
  
  /**
   * Highlight a piece
   */
  highlightPiece(row, col) {
    // This would integrate with the rendering system
    console.log(`[CheckersTutorial] Highlighting piece at ${row}, ${col}`);
  }
  
  /**
   * Complete current task
   */
  completeTask() {
    if (!this.currentTask) return;
    
    const currentLesson = this.lessons[this.currentLesson];
    const currentStepIndex = currentLesson.steps.indexOf(this.currentTask);
    
    if (currentStepIndex < currentLesson.steps.length - 1) {
      // Move to next step
      this.currentTask = currentLesson.steps[currentStepIndex + 1];
      this.showInstruction();
    } else {
      // Lesson complete, move to next lesson
      this.nextLesson();
    }
  }
  
  /**
   * Move to next lesson
   */
  nextLesson() {
    this.currentLesson++;
    
    if (this.currentLesson < this.lessons.length) {
      this.showLesson(this.lessons[this.currentLesson]);
    } else {
      this.completeTutorial();
    }
  }
  
  /**
   * Complete tutorial
   */
  completeTutorial() {
    this.active = false;
    this.currentLesson = 0;
    this.currentTask = null;
    console.log('[CheckersTutorial] Tutorial completed!');
  }
  
  /**
   * Stop tutorial
   */
  stopTutorial() {
    this.active = false;
    this.currentLesson = 0;
    this.currentTask = null;
  }
  
  /**
   * Check if tutorial is active
   */
  isActive() {
    return this.active;
  }
  
  /**
   * Get current lesson info
   */
  getCurrentLesson() {
    if (!this.active || this.currentLesson >= this.lessons.length) {
      return null;
    }
    
    return {
      ...this.lessons[this.currentLesson],
      stepIndex: this.currentTask ? this.lessons[this.currentLesson].steps.indexOf(this.currentTask) : 0,
      totalSteps: this.lessons[this.currentLesson].steps.length
    };
  }
  
  /**
   * Get all lessons
   */
  getAllLessons() {
    return this.lessons;
  }
  
  /**
   * Get tutorial progress
   */
  getProgress() {
    if (!this.active) {
      return { completed: 0, total: this.lessons.length };
    }
    
    return {
      completed: this.currentLesson,
      total: this.lessons.length,
      currentStep: this.currentTask ? this.lessons[this.currentLesson].steps.indexOf(this.currentTask) + 1 : 0,
      totalSteps: this.currentTask ? this.lessons[this.currentLesson].steps.length : 0
    };
  }
}
