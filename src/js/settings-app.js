/**
 * Settings App
 * UI for selecting themes and piece sets
 */

import { ThemeManager } from './ui/theme-manager.js';

class SettingsApp {
  constructor() {
    this.themeManager = new ThemeManager();
    this.init();
  }
  
  init() {
    this.renderBoardThemes();
    this.renderPieceSets();
    this.loadBoardOrientation();
    this.loadShowHints();
    this.setupEventListeners();
    this.setupAppManagement();
  }
  
  /**
   * Load board orientation from settings
   */
  loadBoardOrientation() {
    const select = document.getElementById('board-orientation-select');
    if (select) {
      const saved = localStorage.getItem('mate-board-orientation') || 'bottom';
      select.value = saved;
    }
  }
  
  /**
   * Load show hints preference
   */
  loadShowHints() {
    const checkbox = document.getElementById('show-hints-toggle');
    if (checkbox) {
      const saved = localStorage.getItem('mate-show-hints');
      checkbox.checked = saved === 'true' || saved === null; // Default to true
    }
  }
  
  /**
   * Render board theme options
   */
  renderBoardThemes() {
    const container = document.getElementById('board-themes');
    const themes = this.themeManager.getBoardThemes();
    const currentTheme = this.themeManager.currentBoardTheme;
    
    container.innerHTML = '';
    
    Object.entries(themes).forEach(([id, theme]) => {
      const option = document.createElement('div');
      option.className = 'theme-option';
      option.dataset.themeId = id;
      
      if (id === currentTheme) {
        option.classList.add('selected');
      }
      
      // Create preview
      const preview = document.createElement('div');
      preview.className = 'theme-preview';
      
      // Create checkerboard pattern
      for (let i = 0; i < 8; i++) {
        const square = document.createElement('div');
        square.className = 'preview-square';
        square.style.backgroundColor = i % 2 === 0 ? theme.light : theme.dark;
        preview.appendChild(square);
      }
      
      option.appendChild(preview);
      
      const title = document.createElement('h3');
      title.textContent = theme.name;
      option.appendChild(title);
      
      const desc = document.createElement('p');
      desc.textContent = theme.description;
      option.appendChild(desc);
      
      container.appendChild(option);
    });
  }
  
  /**
   * Render piece set options
   */
  renderPieceSets() {
    const container = document.getElementById('piece-sets');
    const sets = this.themeManager.getPieceSets();
    const currentSet = this.themeManager.currentPieceSet;
    
    container.innerHTML = '';
    
    Object.entries(sets).forEach(([id, set]) => {
      const option = document.createElement('div');
      option.className = 'theme-option';
      option.dataset.setId = id;
      
      if (id === currentSet) {
        option.classList.add('selected');
      }
      
      // Create preview with sample pieces
      const preview = document.createElement('div');
      preview.className = 'piece-preview';
      preview.style.color = set.style.whiteColor;
      preview.style.textShadow = `0 0 2px ${set.style.whiteShadow}`;
      
      if (set.style.glow) {
        preview.style.filter = `drop-shadow(0 0 4px ${set.style.whiteColor})`;
      }
      
      // Show sample pieces: King, Queen, Knight
      preview.textContent = `${set.pieces.wK} ${set.pieces.wQ} ${set.pieces.wN}`;
      
      option.appendChild(preview);
      
      const title = document.createElement('h3');
      title.textContent = set.name;
      option.appendChild(title);
      
      const desc = document.createElement('p');
      desc.textContent = set.description;
      option.appendChild(desc);
      
      container.appendChild(option);
    });
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Board theme selection
    document.getElementById('board-themes').addEventListener('click', (e) => {
      const option = e.target.closest('.theme-option');
      if (option) {
        const themeId = option.dataset.themeId;
        this.themeManager.setBoardTheme(themeId);
        this.renderBoardThemes(); // Re-render to show selection
        this.showNotification(`Board theme changed to ${this.themeManager.getCurrentBoardTheme().name}`);
      }
    });
    
    // Piece set selection
    document.getElementById('piece-sets').addEventListener('click', (e) => {
      const option = e.target.closest('.theme-option');
      if (option) {
        const setId = option.dataset.setId;
        this.themeManager.setPieceSet(setId);
        this.renderPieceSets(); // Re-render to show selection
        this.showNotification(`Piece set changed to ${this.themeManager.getCurrentPieceSet().name}`);
      }
    });
    
    // Board orientation selection
    document.getElementById('board-orientation-select')?.addEventListener('change', (e) => {
      const orientation = e.target.value;
      localStorage.setItem('mate-board-orientation', orientation);
      this.showNotification(`Board orientation: ${orientation === 'bottom' ? 'White on bottom' : 'Black on bottom'}`);
    });
    
    // Show hints toggle
    document.getElementById('show-hints-toggle')?.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      localStorage.setItem('mate-show-hints', enabled.toString());
      this.showNotification(`Move hints: ${enabled ? 'Enabled ✨' : 'Disabled'}`);
    });
  }
  
  /**
   * Setup app management buttons
   */
  setupAppManagement() {
    // PWA Install button
    this.setupPWAInstall();
    
    // Clear saved game button
    document.getElementById('clear-saved-game-button')?.addEventListener('click', () => {
      if (confirm('Clear your currently saved game? This cannot be undone.')) {
        localStorage.removeItem('mate-current-game');
        this.showNotification('✅ Saved game cleared!');
      }
    });
    
    // Clear cache button
    document.getElementById('clear-cache-button')?.addEventListener('click', async () => {
      if (confirm('Clear all caches and reset service worker? The page will reload.')) {
        await this.clearCacheAndSW();
      }
    });
    
    // Load version info
    this.loadVersionInfo();
  }
  
  /**
   * Setup PWA install functionality
   */
  setupPWAInstall() {
    const installButton = document.getElementById('pwa-install-button');
    const installStatus = document.getElementById('install-status');
    
    if (!installButton) return;
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone === true;
    
    if (isStandalone) {
      installButton.classList.add('installed');
      if (installStatus) {
        installStatus.textContent = 'Installed!';
      }
      installButton.disabled = true;
      return;
    }
    
    // Wait for beforeinstallprompt event
    let deferredPrompt = null;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[Settings] Install prompt available');
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button as ready
      if (installStatus) {
        installStatus.textContent = 'Ready to install';
      }
    });
    
    // Handle install button click
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) {
        this.showNotification('⚠️ Install not available. Try adding to home screen manually.');
        return;
      }
      
      // Show install prompt
      deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.showNotification('✅ Installing Mate...');
        installButton.classList.add('installed');
        if (installStatus) {
          installStatus.textContent = 'Installed!';
        }
        installButton.disabled = true;
      } else {
        this.showNotification('Installation cancelled');
      }
      
      deferredPrompt = null;
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[Settings] App installed successfully');
      installButton.classList.add('installed');
      if (installStatus) {
        installStatus.textContent = 'Installed!';
      }
      installButton.disabled = true;
      this.showNotification('✅ Mate installed successfully!');
    });
  }
  
  /**
   * Clear cache and service worker
   */
  async clearCacheAndSW() {
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[Settings] All caches cleared');
      }
      
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        console.log('[Settings] All service workers unregistered');
      }
      
      // Show success and reload
      this.showNotification('✅ Cache cleared! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('[Settings] Error clearing cache:', error);
      this.showNotification('❌ Error clearing cache');
    }
  }
  
  /**
   * Load and display version info
   */
  async loadVersionInfo() {
    const versionDisplay = document.getElementById('version-display');
    const buildInfo = document.getElementById('build-info');
    
    if (!versionDisplay) return;
    
    try {
      // Try to load build info
      const response = await fetch('/build-info.json');
      if (response.ok) {
        const info = await response.json();
        versionDisplay.textContent = `Version ${info.version}`;
        if (buildInfo) {
          buildInfo.textContent = `Build: ${new Date(info.buildTime).toLocaleString()}`;
        }
      } else {
        versionDisplay.textContent = 'Version 1.0.0';
        if (buildInfo) {
          buildInfo.textContent = 'Build: Development';
        }
      }
    } catch (error) {
      versionDisplay.textContent = 'Version 1.0.0';
      if (buildInfo) {
        buildInfo.textContent = 'Build: Development';
      }
    }
  }
  
  /**
   * Show notification (simple toast)
   */
  showNotification(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SettingsApp();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

