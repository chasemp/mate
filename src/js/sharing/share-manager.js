/**
 * Share Manager
 * Handles game sharing via Web Share API, SMS, clipboard
 */

import { URLEncoder } from './url-encoder.js';

export class ShareManager {
  constructor(app) {
    this.app = app;
    this.encoder = new URLEncoder();
    this.currentGameId = null;
  }

  /**
   * Share current game state
   */
  async shareGame() {
    const moveHistory = this.app.engine.getMoveHistory();
    
    if (moveHistory.length === 0) {
      this.app.showNotification('No moves to share yet!');
      return false;
    }

    // Generate or reuse game ID
    if (!this.currentGameId) {
      this.currentGameId = this.encoder.generateGameId();
      this.saveGameId();
    }

    // Encode game state to URL
    const url = this.encoder.encodeGameState(moveHistory, this.currentGameId);
    const currentTurn = this.app.engine.getCurrentTurn();
    const message = this.encoder.createShareMessage(url, currentTurn);

    // Try Web Share API first
    if (this.canUseWebShare()) {
      try {
        await navigator.share({
          title: 'Mate - Your Turn!',
          text: message,
          url: url
        });
        
        this.app.showNotification('✅ Game shared!');
        return true;
      } catch (err) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          // Fall through to clipboard
        } else {
          return false; // User cancelled
        }
      }
    }

    // Fallback: copy to clipboard
    return await this.copyToClipboard(url, message);
  }

  /**
   * Copy URL to clipboard
   */
  async copyToClipboard(url, message = null) {
    const textToCopy = message || url;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        this.app.showNotification('🔗 Link copied! Share it with your friend.');
        
        // Show share options dialog
        this.showShareOptionsDialog(url);
        return true;
      } else {
        // Fallback for older browsers
        return this.fallbackCopy(textToCopy);
      }
    } catch (err) {
      console.error('Clipboard failed:', err);
      return this.fallbackCopy(textToCopy);
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    
    try {
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success) {
        this.app.showNotification('🔗 Link copied to clipboard!');
        return true;
      } else {
        this.app.showNotification('❌ Failed to copy link');
        return false;
      }
    } catch (err) {
      document.body.removeChild(textarea);
      this.app.showNotification('❌ Failed to copy link');
      return false;
    }
  }

  /**
   * Show share options dialog
   */
  showShareOptionsDialog(url) {
    const dialog = document.createElement('div');
    dialog.className = 'share-dialog';
    dialog.innerHTML = `
      <div class="share-dialog-content">
        <h3>Share via:</h3>
        <div class="share-options">
          <a href="sms:?body=${encodeURIComponent(url)}" class="share-btn sms">
            <span class="share-icon">📱</span>
            <span>SMS</span>
          </a>
          <a href="https://wa.me/?text=${encodeURIComponent(url)}" target="_blank" class="share-btn whatsapp">
            <span class="share-icon">💬</span>
            <span>WhatsApp</span>
          </a>
          <button class="share-btn copy" onclick="navigator.clipboard.writeText('${url}')">
            <span class="share-icon">📋</span>
            <span>Copy Again</span>
          </button>
        </div>
        <input type="text" readonly value="${url}" class="share-url-input" onclick="this.select()">
        <button class="btn-secondary" onclick="this.closest('.share-dialog').remove()">Close</button>
      </div>
    `;
    
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5000;
    `;
    
    document.body.appendChild(dialog);
    
    // Close on background click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (dialog.parentNode) {
        dialog.remove();
      }
    }, 30000);
  }

  /**
   * Check if Web Share API is available
   */
  canUseWebShare() {
    return navigator.share && navigator.canShare;
  }

  /**
   * Generate share text for messaging
   */
  generateShareText(url) {
    const turn = this.app.engine.getCurrentTurn();
    const opponent = turn === 'white' ? 'Black' : 'White';
    const moveCount = this.app.engine.getMoveHistory().length;
    
    return `♟️ Mate - Your Turn!\n\n${opponent} to move (Move ${moveCount + 1})\n\n${url}`;
  }

  /**
   * Save game ID to local storage
   */
  saveGameId() {
    if (this.currentGameId) {
      localStorage.setItem('mate-current-game-id', this.currentGameId);
    }
  }

  /**
   * Load game ID from local storage
   */
  loadGameId() {
    this.currentGameId = localStorage.getItem('mate-current-game-id');
    return this.currentGameId;
  }

  /**
   * Start new game (generate new ID)
   */
  newGame() {
    this.currentGameId = this.encoder.generateGameId();
    this.saveGameId();
    return this.currentGameId;
  }

  /**
   * Get current game ID
   */
  getGameId() {
    if (!this.currentGameId) {
      this.currentGameId = this.loadGameId() || this.encoder.generateGameId();
      this.saveGameId();
    }
    return this.currentGameId;
  }

  /**
   * Set game ID (when loading from URL)
   */
  setGameId(gameId) {
    this.currentGameId = gameId;
    this.saveGameId();
  }

  /**
   * Get shareable URL for current game
   */
  getShareUrl() {
    const moveHistory = this.app.engine.getMoveHistory();
    const gameId = this.getGameId();
    return this.encoder.encodeGameState(moveHistory, gameId);
  }

  /**
   * Estimate URL length
   */
  estimateUrlLength() {
    const moveCount = this.app.engine.getMoveHistory().length;
    return this.encoder.estimateUrlLength(moveCount);
  }
}

