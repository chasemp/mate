/**
 * Haptic Manager - Mobile haptic feedback
 * Phase 8.3: Mobile Optimization
 * 
 * Provides haptic feedback for chess moves and interactions
 */

export class HapticManager {
  constructor() {
    this.enabled = this.loadHapticSetting();
    this.vibrationSupported = 'vibrate' in navigator;
    this.hapticSupported = 'vibrate' in navigator;
    
    console.log('[Haptic] Initialized:', {
      enabled: this.enabled,
      vibrationSupported: this.vibrationSupported,
      hapticSupported: this.hapticSupported
    });
  }
  
  /**
   * Trigger haptic feedback for move
   */
  move() {
    if (!this.enabled || !this.hapticSupported) return;
    
    try {
      // Short vibration for move
      navigator.vibrate(50);
    } catch (error) {
      console.warn('[Haptic] Move feedback failed:', error);
    }
  }
  
  /**
   * Trigger haptic feedback for capture
   */
  capture() {
    if (!this.enabled || !this.hapticSupported) return;
    
    try {
      // Longer vibration for capture
      navigator.vibrate([50, 30, 50]);
    } catch (error) {
      console.warn('[Haptic] Capture feedback failed:', error);
    }
  }
  
  /**
   * Trigger haptic feedback for check
   */
  check() {
    if (!this.enabled || !this.hapticSupported) return;
    
    try {
      // Double vibration for check
      navigator.vibrate([100, 50, 100]);
    } catch (error) {
      console.warn('[Haptic] Check feedback failed:', error);
    }
  }
  
  /**
   * Trigger haptic feedback for checkmate
   */
  checkmate() {
    if (!this.enabled || !this.hapticSupported) return;
    
    try {
      // Victory pattern
      navigator.vibrate([100, 50, 100, 50, 200]);
    } catch (error) {
      console.warn('[Haptic] Checkmate feedback failed:', error);
    }
  }
  
  /**
   * Trigger haptic feedback for illegal move
   */
  illegal() {
    if (!this.enabled || !this.hapticSupported) return;
    
    try {
      // Error pattern
      navigator.vibrate([200, 100, 200]);
    } catch (error) {
      console.warn('[Haptic] Illegal feedback failed:', error);
    }
  }
  
  /**
   * Trigger haptic feedback for piece selection
   */
  select() {
    if (!this.enabled || !this.hapticSupported) return;
    
    try {
      // Very short vibration for selection
      navigator.vibrate(25);
    } catch (error) {
      console.warn('[Haptic] Select feedback failed:', error);
    }
  }
  
  /**
   * Enable/disable haptic feedback
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveHapticSetting();
  }
  
  /**
   * Toggle haptic feedback
   */
  toggle() {
    this.enabled = !this.enabled;
    this.saveHapticSetting();
    return this.enabled;
  }
  
  /**
   * Check if haptic feedback is enabled
   */
  isEnabled() {
    return this.enabled;
  }
  
  /**
   * Check if haptic feedback is supported
   */
  isSupported() {
    return this.hapticSupported;
  }
  
  /**
   * Load haptic setting from localStorage
   */
  loadHapticSetting() {
    const saved = localStorage.getItem('mate-haptic-enabled');
    return saved === null ? true : saved === 'true'; // Default to enabled
  }
  
  /**
   * Save haptic setting to localStorage
   */
  saveHapticSetting() {
    localStorage.setItem('mate-haptic-enabled', this.enabled.toString());
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.hapticManager = new HapticManager();
}
