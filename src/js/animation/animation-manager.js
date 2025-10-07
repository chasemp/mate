/**
 * Animation Manager - Chess game animations
 * Phase 8.2: Polish & Production
 * 
 * Handles smooth piece movements, fade effects, and board transitions
 */

export class AnimationManager {
  constructor(canvas, ctx, squareSize) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.squareSize = squareSize;
    
    // Animation state
    this.animations = new Map();
    this.animationId = null;
    this.isAnimating = false;
    
    // Animation settings
    this.moveDuration = 300; // ms
    this.fadeDuration = 200; // ms
    this.flipDuration = 500; // ms
    this.easing = this.easeInOutCubic;
  }
  
  /**
   * Animate piece movement
   */
  animateMove(fromRow, fromCol, toRow, toCol, piece, onComplete = null) {
    const animationId = `move_${Date.now()}_${Math.random()}`;
    
    const startTime = performance.now();
    const startX = fromCol * this.squareSize;
    const startY = fromRow * this.squareSize;
    const endX = toCol * this.squareSize;
    const endY = toRow * this.squareSize;
    
    const animation = {
      id: animationId,
      type: 'move',
      startTime,
      duration: this.moveDuration,
      startX,
      startY,
      endX,
      endY,
      piece,
      onComplete
    };
    
    this.animations.set(animationId, animation);
    this.startAnimationLoop();
    
    return animationId;
  }
  
  /**
   * Animate piece capture (fade out)
   */
  animateCapture(row, col, piece, onComplete = null) {
    const animationId = `capture_${Date.now()}_${Math.random()}`;
    
    const startTime = performance.now();
    const x = col * this.squareSize;
    const y = row * this.squareSize;
    
    const animation = {
      id: animationId,
      type: 'capture',
      startTime,
      duration: this.fadeDuration,
      x,
      y,
      piece,
      opacity: 1,
      onComplete
    };
    
    this.animations.set(animationId, animation);
    this.startAnimationLoop();
    
    return animationId;
  }
  
  /**
   * Animate board flip
   */
  animateBoardFlip(onComplete = null) {
    const animationId = `flip_${Date.now()}_${Math.random()}`;
    
    const startTime = performance.now();
    
    const animation = {
      id: animationId,
      type: 'flip',
      startTime,
      duration: this.flipDuration,
      scale: 1,
      onComplete
    };
    
    this.animations.set(animationId, animation);
    this.startAnimationLoop();
    
    return animationId;
  }
  
  /**
   * Start animation loop
   */
  startAnimationLoop() {
    if (this.animationId) return; // Already running
    
    this.isAnimating = true;
    
    const animate = (currentTime) => {
      let hasActiveAnimations = false;
      
      for (const [id, animation] of this.animations) {
        const elapsed = currentTime - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);
        
        if (progress < 1) {
          hasActiveAnimations = true;
          this.updateAnimation(animation, progress);
        } else {
          // Animation complete
          this.completeAnimation(animation);
          this.animations.delete(id);
        }
      }
      
      if (hasActiveAnimations) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animationId = null;
        this.isAnimating = false;
      }
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  /**
   * Update animation state
   */
  updateAnimation(animation, progress) {
    const easedProgress = this.easing(progress);
    
    switch (animation.type) {
      case 'move':
        animation.currentX = animation.startX + (animation.endX - animation.startX) * easedProgress;
        animation.currentY = animation.startY + (animation.endY - animation.startY) * easedProgress;
        break;
        
      case 'capture':
        animation.opacity = 1 - easedProgress;
        break;
        
      case 'flip':
        // Scale down to 0.8, then back to 1
        if (progress < 0.5) {
          animation.scale = 1 - (easedProgress * 0.4);
        } else {
          animation.scale = 0.6 + ((easedProgress - 0.5) * 0.8);
        }
        break;
    }
  }
  
  /**
   * Complete animation
   */
  completeAnimation(animation) {
    if (animation.onComplete) {
      animation.onComplete(animation);
    }
  }
  
  /**
   * Render all active animations
   */
  renderAnimations(renderPiece) {
    if (!this.isAnimating) return;
    
    for (const animation of this.animations.values()) {
      this.renderAnimation(animation, renderPiece);
    }
  }
  
  /**
   * Render single animation
   */
  renderAnimation(animation, renderPiece) {
    this.ctx.save();
    
    switch (animation.type) {
      case 'move':
        this.ctx.globalAlpha = 0.8; // Slightly transparent during move
        renderPiece(
          animation.piece,
          animation.currentX + this.squareSize / 2,
          animation.currentY + this.squareSize / 2,
          this.squareSize * 0.8
        );
        break;
        
      case 'capture':
        this.ctx.globalAlpha = animation.opacity;
        renderPiece(
          animation.piece,
          animation.x + this.squareSize / 2,
          animation.y + this.squareSize / 2,
          this.squareSize * 0.8
        );
        break;
        
      case 'flip':
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(animation.scale, animation.scale);
        this.ctx.translate(-centerX, -centerY);
        break;
    }
    
    this.ctx.restore();
  }
  
  /**
   * Easing function - cubic in-out
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * Check if any animations are running
   */
  hasActiveAnimations() {
    return this.animations.size > 0;
  }
  
  /**
   * Cancel all animations
   */
  cancelAllAnimations() {
    this.animations.clear();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.isAnimating = false;
    }
  }
  
  /**
   * Cancel specific animation
   */
  cancelAnimation(animationId) {
    this.animations.delete(animationId);
    if (this.animations.size === 0 && this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.isAnimating = false;
    }
  }
  
  /**
   * Set animation duration
   */
  setMoveDuration(duration) {
    this.moveDuration = duration;
  }
  
  /**
   * Set fade duration
   */
  setFadeDuration(duration) {
    this.fadeDuration = duration;
  }
  
  /**
   * Set flip duration
   */
  setFlipDuration(duration) {
    this.flipDuration = duration;
  }
}
