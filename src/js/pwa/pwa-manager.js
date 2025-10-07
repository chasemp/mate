/**
 * PWA Manager - Install prompts and offline detection
 * Phase 7: Production PWA features
 */

export class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    
    this.init();
  }
  
  init() {
    this.setupInstallPrompt();
    this.setupOfflineDetection();
    this.setupServiceWorkerUpdates();
    this.showInstallBanner();
  }
  
  /**
   * Handle PWA install prompt
   */
  setupInstallPrompt() {
    // Capture the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Install prompt available');
      e.preventDefault(); // Prevent automatic prompt
      this.deferredPrompt = e;
      
      // Show install button in settings
      this.showInstallButton();
    });
    
    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully!');
      this.deferredPrompt = null;
      this.hideInstallButton();
      this.showNotification('✅ Mate installed! Launch from home screen.');
      
      // Track install (analytics placeholder)
      this.trackEvent('pwa_installed');
    });
  }
  
  /**
   * Show install button in UI
   */
  showInstallButton() {
    // Show install button in settings page
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.style.display = 'block';
      installBtn.addEventListener('click', () => this.promptInstall(), { once: true });
    }
    
    // Show install banner on main page (non-intrusive)
    this.showInstallBanner();
  }
  
  /**
   * Hide install button
   */
  hideInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
    
    this.hideInstallBanner();
  }
  
  /**
   * Show subtle install banner
   */
  showInstallBanner() {
    // Don't show if already installed
    if (this.isStandalone()) {
      return;
    }
    
    // Don't show if user dismissed recently
    const dismissed = localStorage.getItem('install-banner-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return; // Dismissed within last 7 days
    }
    
    // Only show on index.html
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
      return;
    }
    
    // Create banner
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div class="install-banner-content">
        <span>📱 Install Mate for offline play!</span>
        <div class="install-banner-actions">
          <button id="install-banner-btn" class="btn-link">Install</button>
          <button id="install-banner-dismiss" class="btn-link">×</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Handle install click
    document.getElementById('install-banner-btn')?.addEventListener('click', () => {
      this.promptInstall();
      banner.remove();
    });
    
    // Handle dismiss
    document.getElementById('install-banner-dismiss')?.addEventListener('click', () => {
      localStorage.setItem('install-banner-dismissed', Date.now().toString());
      banner.remove();
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        banner.remove();
      }
    }, 10000);
  }
  
  /**
   * Hide install banner
   */
  hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.remove();
    }
  }
  
  /**
   * Prompt user to install
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return false;
    }
    
    // Show the install prompt
    this.deferredPrompt.prompt();
    
    // Wait for user's choice
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`[PWA] User choice: ${outcome}`);
    
    if (outcome === 'accepted') {
      this.showNotification('📲 Installing Mate...');
      this.trackEvent('pwa_install_accepted');
    } else {
      this.trackEvent('pwa_install_dismissed');
    }
    
    // Clear the deferred prompt
    this.deferredPrompt = null;
    
    return outcome === 'accepted';
  }
  
  /**
   * Check if app is running in standalone mode (installed)
   */
  isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }
  
  /**
   * Setup offline/online detection
   */
  setupOfflineDetection() {
    // Initial state
    this.updateOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateOnlineStatus();
      this.showNotification('✅ Back online!', 'success', 3000);
      console.log('[PWA] Connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateOnlineStatus();
      this.showNotification('📵 Offline mode - changes saved locally', 'info', 5000);
      console.log('[PWA] Connection lost');
    });
  }
  
  /**
   * Update UI based on online status
   */
  updateOnlineStatus() {
    // Update body class
    document.body.classList.toggle('offline', !this.isOnline);
    document.body.classList.toggle('online', this.isOnline);
    
    // Update status indicator
    let indicator = document.getElementById('online-status');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'online-status';
      indicator.className = 'online-status';
      document.body.appendChild(indicator);
    }
    
    indicator.className = `online-status ${this.isOnline ? 'online' : 'offline'}`;
    indicator.textContent = this.isOnline ? '🟢' : '🔴';
    indicator.title = this.isOnline ? 'Online' : 'Offline';
    
    // Auto-hide online indicator after 3 seconds
    if (this.isOnline) {
      setTimeout(() => {
        indicator.classList.add('fade-out');
      }, 3000);
    } else {
      indicator.classList.remove('fade-out');
    }
  }
  
  /**
   * Setup service worker update detection
   */
  setupServiceWorkerUpdates() {
    if (!('serviceWorker' in navigator)) {
      return;
    }
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Service worker updated');
      this.updateAvailable = true;
      this.showUpdateBanner();
    });
    
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('[PWA] New version available:', event.data.version);
        this.updateAvailable = true;
        this.showUpdateBanner();
      }
    });
    
    // Check for updates every 30 minutes
    setInterval(() => {
      this.checkForUpdates();
    }, 30 * 60 * 1000);
  }
  
  /**
   * Check for service worker updates
   */
  async checkForUpdates() {
    if (!('serviceWorker' in navigator)) {
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('[PWA] Checked for updates');
      }
    } catch (error) {
      console.error('[PWA] Update check failed:', error);
    }
  }
  
  /**
   * Show update available banner
   */
  showUpdateBanner() {
    // Don't show if already showing
    if (document.getElementById('update-banner')) {
      return;
    }
    
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.className = 'update-banner';
    banner.innerHTML = `
      <div class="update-banner-content">
        <span>🎉 New version available!</span>
        <div class="update-banner-actions">
          <button id="update-reload-btn" class="btn-link">Update Now</button>
          <button id="update-later-btn" class="btn-link">Later</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Handle update click
    document.getElementById('update-reload-btn')?.addEventListener('click', () => {
      window.location.reload();
    });
    
    // Handle later click
    document.getElementById('update-later-btn')?.addEventListener('click', () => {
      banner.remove();
    });
  }
  
  /**
   * Show notification message
   */
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.getElementById('game-status');
    if (notification) {
      notification.textContent = message;
      notification.className = `game-status notification-${type}`;
      
      if (duration > 0) {
        setTimeout(() => {
          if (notification.textContent === message) {
            notification.textContent = '';
            notification.className = 'game-status';
          }
        }, duration);
      }
    }
  }
  
  /**
   * Track events (placeholder for analytics)
   */
  trackEvent(eventName, data = {}) {
    console.log('[PWA] Event:', eventName, data);
    // TODO: Add analytics tracking if needed
    // e.g., gtag('event', eventName, data);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
  });
} else {
  window.pwaManager = new PWAManager();
}

