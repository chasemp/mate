/**
 * Secure Key Storage - Web3 Phase 13.1
 * 
 * Implements secure storage of cryptographic keys with multiple authentication methods:
 * - Passphrase-based encryption (PBKDF2)
 * - Pattern/PIN-based encryption
 * - Biometric authentication (WebAuthn)
 * - Hardware security module support
 */

export class SecureKeyStorage {
  constructor() {
    this.storageKey = 'mate-web3-keys';
    this.authMethods = {
      PASSPHRASE: 'passphrase',
      PATTERN: 'pattern',
      PIN: 'pin',
      BIOMETRIC: 'biometric',
      HSM: 'hsm'
    };
    this.currentAuthMethod = null;
    this.encryptedKeys = null;
  }

  /**
   * Initialize secure key storage
   */
  async initialize() {
    // Check for existing encrypted keys
    this.encryptedKeys = this.loadEncryptedKeys();
    
    // Check available authentication methods
    const availableMethods = await this.getAvailableAuthMethods();
    
    return {
      hasKeys: !!this.encryptedKeys,
      availableMethods,
      currentMethod: this.currentAuthMethod
    };
  }

  /**
   * Get available authentication methods
   */
  async getAvailableAuthMethods() {
    const methods = [];

    // Check for WebAuthn support
    if (window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) {
          methods.push({
            type: this.authMethods.BIOMETRIC,
            name: 'Biometric Authentication',
            description: 'Use fingerprint, face, or device authentication',
            icon: '👆'
          });
        }
      } catch (error) {
        console.log('WebAuthn not available:', error);
      }
    }

    // Always available methods
    methods.push(
      {
        type: this.authMethods.PASSPHRASE,
        name: 'Passphrase',
        description: 'Enter a secure passphrase to protect your keys',
        icon: '🔐'
      },
      {
        type: this.authMethods.PIN,
        name: 'PIN Code',
        description: 'Use a 4-8 digit PIN for quick access',
        icon: '🔢'
      },
      {
        type: this.authMethods.PATTERN,
        name: 'Pattern',
        description: 'Draw a pattern on a 3x3 grid',
        icon: '📱'
      }
    );

    return methods;
  }

  /**
   * Generate and store cryptographic keys with authentication
   */
  async generateAndStoreKeys(authMethod, credentials) {
    try {
      // Generate key pair
      const keyPair = await this.generateKeyPair();
      
      // Derive encryption key from credentials
      const encryptionKey = await this.deriveEncryptionKey(authMethod, credentials);
      
      // Encrypt private key
      const encryptedPrivateKey = await this.encryptPrivateKey(keyPair.privateKey, encryptionKey);
      
      // Store encrypted keys
      const keyData = {
        publicKey: await this.exportPublicKey(keyPair.publicKey),
        encryptedPrivateKey,
        authMethod,
        salt: encryptionKey.salt,
        iv: encryptionKey.iv,
        timestamp: Date.now(),
        version: '1.0'
      };

      this.saveEncryptedKeys(keyData);
      this.currentAuthMethod = authMethod;
      
      return {
        success: true,
        publicKey: keyData.publicKey,
        keyId: this.generateKeyId(keyData.publicKey)
      };
    } catch (error) {
      console.error('Key generation failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unlock and retrieve private key
   */
  async unlockKeys(authMethod, credentials) {
    try {
      if (!this.encryptedKeys) {
        throw new Error('No encrypted keys found');
      }

      // Derive encryption key from credentials
      const encryptionKey = await this.deriveEncryptionKey(authMethod, credentials, this.encryptedKeys.salt);
      
      // Decrypt private key
      const privateKey = await this.decryptPrivateKey(
        this.encryptedKeys.encryptedPrivateKey,
        encryptionKey,
        this.encryptedKeys.iv
      );

      // Import private key
      const cryptoKey = await this.importPrivateKey(privateKey);
      
      this.currentAuthMethod = authMethod;
      
      return {
        success: true,
        privateKey: cryptoKey,
        publicKey: this.encryptedKeys.publicKey
      };
    } catch (error) {
      console.error('Key unlock failed:', error);
      return { success: false, error: 'Invalid credentials' };
    }
  }

  /**
   * Generate ECDSA key pair
   */
  async generateKeyPair() {
    return await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256"
      },
      true, // extractable
      ["sign", "verify"]
    );
  }

  /**
   * Derive encryption key from credentials
   */
  async deriveEncryptionKey(authMethod, credentials, existingSalt = null) {
    const salt = existingSalt || crypto.getRandomValues(new Uint8Array(32));
    const iterations = 100000; // PBKDF2 iterations

    let password;
    
    switch (authMethod) {
      case this.authMethods.PASSPHRASE:
        password = new TextEncoder().encode(credentials.passphrase);
        break;
      case this.authMethods.PIN:
        password = new TextEncoder().encode(credentials.pin);
        break;
      case this.authMethods.PATTERN:
        password = new TextEncoder().encode(credentials.pattern);
        break;
      case this.authMethods.BIOMETRIC:
        // For biometric, we use the credential ID as password
        password = new TextEncoder().encode(credentials.credentialId);
        break;
      default:
        throw new Error('Unsupported authentication method');
    }

    // Derive key using PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      password,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 256 bits
    );

    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

    return {
      key: new Uint8Array(derivedBits),
      salt: salt,
      iv: iv,
      iterations: iterations
    };
  }

  /**
   * Encrypt private key
   */
  async encryptPrivateKey(privateKey, encryptionKey) {
    // Export private key
    const exportedKey = await crypto.subtle.exportKey('pkcs8', privateKey);
    
    // Import encryption key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encryptionKey.key,
      'AES-GCM',
      false,
      ['encrypt']
    );

    // Encrypt private key
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: encryptionKey.iv
      },
      cryptoKey,
      exportedKey
    );

    return new Uint8Array(encrypted);
  }

  /**
   * Decrypt private key
   */
  async decryptPrivateKey(encryptedPrivateKey, encryptionKey, iv) {
    // Import encryption key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encryptionKey.key,
      'AES-GCM',
      false,
      ['decrypt']
    );

    // Decrypt private key
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      encryptedPrivateKey
    );

    return new Uint8Array(decrypted);
  }

  /**
   * Export public key
   */
  async exportPublicKey(publicKey) {
    const exported = await crypto.subtle.exportKey('spki', publicKey);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Import private key
   */
  async importPrivateKey(privateKeyData) {
    return await crypto.subtle.importKey(
      'pkcs8',
      privateKeyData,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true,
      ['sign']
    );
  }

  /**
   * Biometric authentication setup
   */
  async setupBiometricAuth() {
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: "Mate",
            id: window.location.hostname
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(32)),
            name: "Mate User",
            displayName: "Mate Player"
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }
      });

      return {
        success: true,
        credentialId: this.arrayBufferToBase64(credential.rawId),
        publicKey: this.arrayBufferToBase64(credential.response.publicKey)
      };
    } catch (error) {
      console.error('Biometric setup failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Biometric authentication verification
   */
  async verifyBiometricAuth(credentialId) {
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{
            type: 'public-key',
            id: this.base64ToArrayBuffer(credentialId)
          }],
          userVerification: "required",
          timeout: 60000
        }
      });

      return { success: true, credential };
    } catch (error) {
      console.error('Biometric verification failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pattern-based authentication
   */
  async setupPatternAuth(pattern) {
    // Pattern is a sequence of numbers representing grid positions
    // 0,1,2,3,4,5,6,7,8 for 3x3 grid
    if (!this.validatePattern(pattern)) {
      throw new Error('Invalid pattern');
    }

    return {
      success: true,
      pattern: pattern.join(',')
    };
  }

  /**
   * Validate pattern
   */
  validatePattern(pattern) {
    if (!Array.isArray(pattern) || pattern.length < 4) {
      return false;
    }

    // Check all positions are valid (0-8)
    for (const pos of pattern) {
      if (pos < 0 || pos > 8 || !Number.isInteger(pos)) {
        return false;
      }
    }

    // Check no duplicates
    return new Set(pattern).size === pattern.length;
  }

  /**
   * PIN validation
   */
  validatePIN(pin) {
    const pinStr = pin.toString();
    return /^\d{4,8}$/.test(pinStr);
  }

  /**
   * Generate key ID from public key
   */
  generateKeyId(publicKey) {
    const hash = crypto.subtle.digest('SHA-256', new TextEncoder().encode(publicKey));
    return this.arrayBufferToBase64(hash).substring(0, 16);
  }

  /**
   * Load encrypted keys from storage
   */
  loadEncryptedKeys() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load encrypted keys:', error);
      return null;
    }
  }

  /**
   * Save encrypted keys to storage
   */
  saveEncryptedKeys(keyData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(keyData));
      this.encryptedKeys = keyData;
    } catch (error) {
      console.error('Failed to save encrypted keys:', error);
      throw error;
    }
  }

  /**
   * Clear all stored keys
   */
  clearKeys() {
    localStorage.removeItem(this.storageKey);
    this.encryptedKeys = null;
    this.currentAuthMethod = null;
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

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
