/**
 * Statistics App - Statistics page controller
 * Phase 11: Advanced Features
 * 
 * Manages the statistics page and displays game analytics
 */

import { GameStatistics } from './analytics/game-statistics.js';

class StatisticsApp {
  constructor() {
    this.gameStats = new GameStatistics();
    this.currentGameTab = 'chess';
    
    this.init();
  }
  
  init() {
    this.hideModal(); // Ensure modal is hidden on page load
    this.setupEventListeners();
    this.loadStatistics();
    this.renderDailyChart();
    this.renderAchievements();
    this.renderRecentGames();
  }
  
  setupEventListeners() {
    // Game type tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      this.addTouchEvents(btn, (e) => {
        const gameType = e.target.dataset.game;
        this.switchGameTab(gameType);
      });
    });
    
    // Export statistics
    this.addTouchEvents('export-stats-btn', () => {
      this.exportStatistics();
    });
    
    // Clear statistics
    this.addTouchEvents('clear-stats-btn', (e) => {
      // Clear stats button clicked
      this.showClearConfirmation();
    });
    
    // Confirmation modal
    this.addTouchEvents('confirm-cancel', () => {
      this.hideModal();
    });
    
    this.addTouchEvents('confirm-ok', () => {
      this.handleConfirmAction();
    });
  }
  
  /**
   * Add both click and touch events for mobile compatibility
   */
  addTouchEvents(element, handler) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (!element) return;
    
    // Add click event
    element.addEventListener('click', handler);
    
    // Add touch events for mobile
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handler(e);
    }, { passive: false });
    
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      // Prevent double-firing by only handling touchend
    }, { passive: false });
  }
  
  loadStatistics() {
    // Load overall statistics
    const overallStats = this.gameStats.getOverallStats();
    this.updateOverallStats(overallStats);
    
    // Load game-specific statistics
    this.updateGameStats('chess');
    this.updateGameStats('checkers');
  }
  
  updateOverallStats(stats) {
    document.getElementById('total-games').textContent = stats.totalGames || 0;
    document.getElementById('total-time').textContent = this.formatTime(stats.totalTime || 0);
    document.getElementById('total-moves').textContent = stats.totalMoves || 0;
    
    // Calculate overall win rate
    const chessStats = this.gameStats.getGameTypeStats('chess');
    const checkersStats = this.gameStats.getGameTypeStats('checkers');
    
    let totalWins = 0;
    let totalGames = 0;
    
    if (chessStats) {
      totalWins += chessStats.wins;
      totalGames += chessStats.total;
    }
    
    if (checkersStats) {
      totalWins += checkersStats.wins;
      totalGames += checkersStats.total;
    }
    
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
    document.getElementById('win-rate').textContent = `${winRate}%`;
  }
  
  updateGameStats(gameType) {
    const stats = this.gameStats.getGameTypeStats(gameType);
    
    if (!stats) {
      this.clearGameStats(gameType);
      return;
    }
    
    // Update basic stats
    document.getElementById(`${gameType}-games`).textContent = stats.total || 0;
    document.getElementById(`${gameType}-wins`).textContent = stats.wins || 0;
    document.getElementById(`${gameType}-losses`).textContent = stats.losses || 0;
    document.getElementById(`${gameType}-draws`).textContent = stats.draws || 0;
    
    // Update detailed stats
    document.getElementById(`${gameType}-win-rate`).textContent = `${Math.round(stats.winRate || 0)}%`;
    document.getElementById(`${gameType}-avg-time`).textContent = this.formatTime(stats.averageTime || 0);
    document.getElementById(`${gameType}-avg-moves`).textContent = Math.round(stats.averageMoves || 0);
    document.getElementById(`${gameType}-streak`).textContent = stats.streaks?.current || 0;
    document.getElementById(`${gameType}-best-time`).textContent = stats.bestTime ? this.formatTime(stats.bestTime) : '--';
  }
  
  clearGameStats(gameType) {
    document.getElementById(`${gameType}-games`).textContent = '0';
    document.getElementById(`${gameType}-wins`).textContent = '0';
    document.getElementById(`${gameType}-losses`).textContent = '0';
    document.getElementById(`${gameType}-draws`).textContent = '0';
    document.getElementById(`${gameType}-win-rate`).textContent = '0%';
    document.getElementById(`${gameType}-avg-time`).textContent = '0m 0s';
    document.getElementById(`${gameType}-avg-moves`).textContent = '0';
    document.getElementById(`${gameType}-streak`).textContent = '0';
    document.getElementById(`${gameType}-best-time`).textContent = '--';
  }
  
  switchGameTab(gameType) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-game="${gameType}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.game-stats').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${gameType}-stats`).classList.add('active');
    
    this.currentGameTab = gameType;
  }
  
  renderDailyChart() {
    const dailyStats = this.gameStats.getDailyStats(7);
    const chartContainer = document.getElementById('daily-chart');
    
    // Simple text-based chart
    let chartHTML = '<div class="daily-chart-bars">';
    
    dailyStats.forEach(day => {
      const maxGames = Math.max(...dailyStats.map(d => d.games));
      const height = maxGames > 0 ? (day.games / maxGames) * 100 : 0;
      
      chartHTML += `
        <div class="daily-bar">
          <div class="bar-fill" style="height: ${height}%"></div>
          <div class="bar-label">${day.games}</div>
          <div class="bar-date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
        </div>
      `;
    });
    
    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
  }
  
  renderAchievements() {
    const achievements = this.gameStats.getAchievements();
    const container = document.getElementById('achievements-grid');
    
    if (achievements.length === 0) {
      container.innerHTML = '<p class="no-achievements">No achievements yet. Keep playing to unlock them!</p>';
      return;
    }
    
    let html = '';
    achievements.forEach(achievement => {
      html += `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${achievement.unlocked ? '🏆' : '🔒'}</div>
          <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  renderRecentGames() {
    const recentGames = this.gameStats.getGameHistory(10);
    const container = document.getElementById('recent-games');
    
    if (recentGames.length === 0) {
      container.innerHTML = '<p class="no-games">No recent games. Start playing to see your history!</p>';
      return;
    }
    
    let html = '';
    recentGames.forEach(game => {
      const result = this.getGameResultIcon(game.result);
      const duration = this.formatTime(game.duration || 0);
      const date = new Date(game.startTime).toLocaleDateString();
      
      html += `
        <div class="recent-game-card">
          <div class="game-icon">${game.gameType === 'chess' ? '♟️' : '🔴'}</div>
          <div class="game-info">
            <div class="game-type">${game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)}</div>
            <div class="game-mode">${game.gameMode}</div>
            <div class="game-details">
              <span class="game-moves">${game.moves?.length || 0} moves</span>
              <span class="game-duration">${duration}</span>
              <span class="game-date">${date}</span>
            </div>
          </div>
          <div class="game-result">${result}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  getGameResultIcon(result) {
    switch (result) {
      case 'win': return '✅';
      case 'loss': return '❌';
      case 'draw': return '🤝';
      default: return '❓';
    }
  }
  
  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  exportStatistics() {
    const data = this.gameStats.exportStats();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mate-statistics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Statistics exported successfully!');
  }
  
  showClearConfirmation() {
    this.showModal(
      'Clear Statistics',
      'Are you sure you want to clear all statistics? This action cannot be undone.',
      () => this.clearStatistics()
    );
  }
  
  clearStatistics() {
    this.gameStats.clearStats();
    this.loadStatistics();
    this.renderDailyChart();
    this.renderAchievements();
    this.renderRecentGames();
    this.showNotification('Statistics cleared successfully!');
  }
  
  showModal(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-modal').style.display = 'flex';
    
    this.pendingAction = onConfirm;
  }
  
  hideModal() {
    document.getElementById('confirm-modal').style.display = 'none';
    this.pendingAction = null;
  }
  
  handleConfirmAction() {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.hideModal();
  }
  
  showNotification(message) {
    // Simple notification - could be enhanced with a proper notification system
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2c3e50;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 1000;
      font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new StatisticsApp();
});
