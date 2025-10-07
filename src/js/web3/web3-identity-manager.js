/**
 * Web3 Identity Manager - Web3 Phase 13.2
 * 
 * Manages cryptographic identity with secure key storage
 * - Username/avatar with cryptographic binding
 * - Public key fingerprinting
 * - Identity verification system
 * - Key recovery with seed phrases
 */

import { SecureKeyStorage } from './secure-key-storage.js';

export class Web3IdentityManager {
  constructor() {
    this.secureStorage = new SecureKeyStorage();
    this.currentIdentity = null;
    this.isUnlocked = false;
  }

  /**
   * Initialize Web3 identity system
   */
  async initialize() {
    const storageStatus = await this.secureStorage.initialize();
    
    return {
      hasIdentity: storageStatus.hasKeys,
      availableAuthMethods: storageStatus.availableMethods,
      currentMethod: storageStatus.currentMethod
    };
  }

  /**
   * Create new Web3 identity
   */
  async createIdentity(username, avatar, authMethod, credentials) {
    try {
      // Validate username
      if (!this.validateUsername(username)) {
        throw new Error('Invalid username');
      }

      // Generate and store keys
      const keyResult = await this.secureStorage.generateAndStoreKeys(authMethod, credentials);
      
      if (!keyResult.success) {
        throw new Error(keyResult.error);
      }

      // Create identity
      this.currentIdentity = {
        id: this.generateIdentityId(),
        username: username,
        avatar: avatar,
        publicKey: keyResult.publicKey,
        keyId: keyResult.keyId,
        authMethod: authMethod,
        createdAt: Date.now(),
        verified: true
      };

      // Store identity metadata
      this.saveIdentityMetadata();

      return {
        success: true,
        identity: this.currentIdentity
      };
    } catch (error) {
      console.error('Identity creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unlock existing identity
   */
  async unlockIdentity(authMethod, credentials) {
    try {
      const unlockResult = await this.secureStorage.unlockKeys(authMethod, credentials);
      
      if (!unlockResult.success) {
        throw new Error(unlockResult.error);
      }

      // Load identity metadata
      this.currentIdentity = this.loadIdentityMetadata();
      this.isUnlocked = true;

      return {
        success: true,
        identity: this.currentIdentity,
        privateKey: unlockResult.privateKey
      };
    } catch (error) {
      console.error('Identity unlock failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign data with current identity
   */
  async signData(data) {
    if (!this.isUnlocked || !this.currentIdentity) {
      throw new Error('Identity not unlocked');
    }

    try {
      // Unlock private key
      const unlockResult = await this.secureStorage.unlockKeys(
        this.currentIdentity.authMethod,
        {} // Credentials should be cached or re-requested
      );

      if (!unlockResult.success) {
        throw new Error('Failed to unlock private key');
      }

      // Prepare data for signing
      const dataString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataString);

      // Sign data
      const signature = await crypto.subtle.sign(
        {
          name: "ECDSA",
          hash: "SHA-256"
        },
        unlockResult.privateKey,
        dataBuffer
      );

      return {
        data: data,
        signature: Array.from(new Uint8Array(signature)),
        publicKey: this.currentIdentity.publicKey,
        keyId: this.currentIdentity.keyId,
        timestamp: Date.now(),
        identity: {
          id: this.currentIdentity.id,
          username: this.currentIdentity.username,
          avatar: this.currentIdentity.avatar
        }
      };
    } catch (error) {
      console.error('Data signing failed:', error);
      throw error;
    }
  }

  /**
   * Verify signed data
   */
  async verifySignature(signedData) {
    try {
      // Import public key
      const publicKey = await this.importPublicKey(signedData.publicKey);
      
      // Prepare data for verification
      const dataString = JSON.stringify(signedData.data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataString);
      const signature = new Uint8Array(signedData.signature);

      // Verify signature
      const isValid = await crypto.subtle.verify(
        {
          name: "ECDSA",
          hash: "SHA-256"
        },
        publicKey,
        signature,
        dataBuffer
      );

      return {
        valid: isValid,
        signer: signedData.identity,
        timestamp: signedData.timestamp
      };
    } catch (error) {
      console.error('Signature verification failed:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Sign game move
   */
  async signMove(from, to, piece, gameId, gameState) {
    const moveData = {
      from,
      to,
      piece,
      gameId,
      gameState: this.hashGameState(gameState),
      moveType: 'move',
      timestamp: Date.now()
    };

    return await this.signData(moveData);
  }

  /**
   * Sign game result
   */
  async signGameResult(gameId, result, score, gameData) {
    const resultData = {
      gameId,
      result,
      score,
      gameData,
      resultType: 'game_end',
      timestamp: Date.now()
    };

    return await this.signData(resultData);
  }

  /**
   * Sign high score
   */
  async signHighScore(gameType, score, gameData) {
    const scoreData = {
      gameType,
      score,
      gameData,
      scoreType: 'high_score',
      timestamp: Date.now()
    };

    return await this.signData(scoreData);
  }

  /**
   * Generate identity fingerprint
   */
  generateFingerprint(publicKey) {
    const hash = crypto.subtle.digest('SHA-256', new TextEncoder().encode(publicKey));
    return this.arrayBufferToBase64(hash).substring(0, 16);
  }

  /**
   * Validate username
   */
  validateUsername(username) {
    if (!username || typeof username !== 'string') {
      return false;
    }

    // Username rules: 3-20 characters, alphanumeric + underscore
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * Generate identity ID
   */
  generateIdentityId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `mate_${timestamp}_${random}`;
  }

  /**
   * Import public key from PEM
   */
  async importPublicKey(pemKey) {
    const keyData = this.pemToArrayBuffer(pemKey);
    return await crypto.subtle.importKey(
      "spki",
      keyData,
      {
        name: "ECDSA",
        namedCurve: "P-256"
      },
      true,
      ["verify"]
    );
  }

  /**
   * Hash game state for signing
   */
  hashGameState(gameState) {
    const stateString = JSON.stringify(gameState);
    const hash = crypto.subtle.digest('SHA-256', new TextEncoder().encode(stateString));
    return this.arrayBufferToBase64(hash);
  }

  /**
   * Save identity metadata
   */
  saveIdentityMetadata() {
    if (!this.currentIdentity) return;

    const metadata = {
      id: this.currentIdentity.id,
      username: this.currentIdentity.username,
      avatar: this.currentIdentity.avatar,
      publicKey: this.currentIdentity.publicKey,
      keyId: this.currentIdentity.keyId,
      authMethod: this.currentIdentity.authMethod,
      createdAt: this.currentIdentity.createdAt,
      verified: this.currentIdentity.verified
    };

    localStorage.setItem('mate-web3-identity', JSON.stringify(metadata));
  }

  /**
   * Load identity metadata
   */
  loadIdentityMetadata() {
    try {
      const stored = localStorage.getItem('mate-web3-identity');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load identity metadata:', error);
      return null;
    }
  }

  /**
   * Get current identity
   */
  getCurrentIdentity() {
    return this.currentIdentity;
  }

  /**
   * Check if identity is unlocked
   */
  isIdentityUnlocked() {
    return this.isUnlocked;
  }

  /**
   * Lock identity
   */
  lockIdentity() {
    this.isUnlocked = false;
    // Clear any cached private keys
  }

  /**
   * Export identity for backup
   */
  exportIdentity() {
    if (!this.currentIdentity) {
      throw new Error('No identity to export');
    }

    return {
      identity: this.currentIdentity,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import identity from backup
   */
  async importIdentity(identityData, authMethod, credentials) {
    try {
      // Validate identity data
      if (!identityData.identity || !identityData.identity.publicKey) {
        throw new Error('Invalid identity data');
      }

      // Store the identity
      this.currentIdentity = identityData.identity;
      this.saveIdentityMetadata();

      // Note: Private key would need to be re-imported separately for security
      return {
        success: true,
        identity: this.currentIdentity
      };
    } catch (error) {
      console.error('Identity import failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Utility functions
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  pemToArrayBuffer(pem) {
    const base64 = pem.replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\s/g, '');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
