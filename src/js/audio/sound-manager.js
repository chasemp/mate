/**
 * Sound Manager - Chess game sound effects
 * Phase 8: Polish & Production
 * 
 * Generates simple sound effects using Web Audio API
 * No external dependencies or CDN - all sounds generated client-side
 */

export class SoundManager {
  constructor() {
    this.enabled = this.loadSoundSetting();
    this.audioContext = null;
    this.sounds = {};
    
    // Initialize on first user interaction (required by browsers)
    this.initialized = false;
    this.pendingSound = null;
  }
  
  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    if (this.initialized) return;
    
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.initialized = true;
      console.log('[Sound] Audio context initialized');
      
      // Play pending sound if any
      if (this.pendingSound) {
        this.play(this.pendingSound);
        this.pendingSound = null;
      }
    } catch (error) {
      console.error('[Sound] Failed to initialize audio context:', error);
    }
  }
  
  /**
   * Play a sound effect
   */
  play(soundType) {
    if (!this.enabled) return;
    
    // Initialize on first call
    if (!this.initialized) {
      this.init();
      if (!this.initialized) {
        this.pendingSound = soundType;
        return;
      }
    }
    
    // Generate and play sound
    try {
      switch (soundType) {
        case 'move':
          this.playMoveSound();
          break;
        case 'capture':
          this.playCaptureSound();
          break;
        case 'check':
          this.playCheckSound();
          break;
        case 'checkmate':
          this.playCheckmateSound();
          break;
        case 'illegal':
          this.playIllegalSound();
          break;
        case 'select':
          this.playSelectSound();
          break;
        default:
          console.warn('[Sound] Unknown sound type:', soundType);
      }
    } catch (error) {
      console.error('[Sound] Error playing sound:', error);
    }
  }
  
  /**
   * Play move sound (short click)
   */
  playMoveSound() {
    const context = this.audioContext;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Warm, pleasant move sound
    oscillator.frequency.setValueAtTime(800, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.15, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.05);
  }
  
  /**
   * Play capture sound (sharper, higher pitch)
   */
  playCaptureSound() {
    const context = this.audioContext;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Sharp capture sound
    oscillator.frequency.setValueAtTime(1200, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.08);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.08);
  }
  
  /**
   * Play check sound (warning tone)
   */
  playCheckSound() {
    const context = this.audioContext;
    
    // Play two tones for emphasis
    for (let i = 0; i < 2; i++) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      const startTime = context.currentTime + (i * 0.1);
      oscillator.frequency.setValueAtTime(900, startTime);
      
      gainNode.gain.setValueAtTime(0.18, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.08);
    }
  }
  
  /**
   * Play checkmate sound (victory fanfare)
   */
  playCheckmateSound() {
    const context = this.audioContext;
    const notes = [
      { freq: 523.25, time: 0 },      // C
      { freq: 659.25, time: 0.12 },   // E
      { freq: 783.99, time: 0.24 },   // G
      { freq: 1046.50, time: 0.36 }   // C (higher octave)
    ];
    
    notes.forEach(note => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      const startTime = context.currentTime + note.time;
      oscillator.frequency.setValueAtTime(note.freq, startTime);
      
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }
  
  /**
   * Play illegal move sound (error beep)
   */
  playIllegalSound() {
    const context = this.audioContext;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Low error tone
    oscillator.frequency.setValueAtTime(200, context.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  }
  
  /**
   * Play select sound (subtle click)
   */
  playSelectSound() {
    const context = this.audioContext;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Very subtle select sound
    oscillator.frequency.setValueAtTime(1000, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.03);
    
    gainNode.gain.setValueAtTime(0.08, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.03);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.03);
  }
  
  /**
   * Enable/disable sounds
   */
  toggle() {
    this.enabled = !this.enabled;
    this.saveSoundSetting();
    return this.enabled;
  }
  
  /**
   * Set sound enabled state
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveSoundSetting();
  }
  
  /**
   * Load sound setting from localStorage
   */
  loadSoundSetting() {
    const saved = localStorage.getItem('mate-sound-enabled');
    return saved === null ? true : saved === 'true'; // Default to enabled
  }
  
  /**
   * Save sound setting to localStorage
   */
  saveSoundSetting() {
    localStorage.setItem('mate-sound-enabled', this.enabled.toString());
  }
  
  /**
   * Check if sounds are enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.soundManager = new SoundManager();
  
  // Initialize on first user interaction
  const initOnInteraction = () => {
    window.soundManager.init();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('touchstart', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
  };
  
  document.addEventListener('click', initOnInteraction, { once: true });
  document.addEventListener('touchstart', initOnInteraction, { once: true });
  document.addEventListener('keydown', initOnInteraction, { once: true });
}

