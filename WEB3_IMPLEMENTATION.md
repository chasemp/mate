# Web3 Identity & Cryptographic Signing Implementation

## Overview

This document outlines the implementation of Web3 cryptographic features for the Mate platform, focusing on secure key storage, player identity, and move provenance.

## Phase 13: Web3 Identity & Cryptographic Signing

### 13.1: Secure Key Storage System

#### Authentication Methods

**1. Passphrase-based Encryption (PBKDF2)**
```javascript
// User enters a secure passphrase
const credentials = { passphrase: "MySecurePassphrase123!" };
const keyResult = await secureStorage.generateAndStoreKeys('passphrase', credentials);
```

**2. Pattern-based Authentication**
```javascript
// User draws pattern on 3x3 grid
const credentials = { pattern: [0, 1, 4, 7, 8] }; // L-shape pattern
const keyResult = await secureStorage.generateAndStoreKeys('pattern', credentials);
```

**3. PIN Code Authentication**
```javascript
// User enters 4-8 digit PIN
const credentials = { pin: "1234" };
const keyResult = await secureStorage.generateAndStoreKeys('pin', credentials);
```

**4. Biometric Authentication (WebAuthn)**
```javascript
// Use device biometrics (fingerprint, face, etc.)
const biometricSetup = await secureStorage.setupBiometricAuth();
const credentials = { credentialId: biometricSetup.credentialId };
const keyResult = await secureStorage.generateAndStoreKeys('biometric', credentials);
```

#### Security Features

- **PBKDF2 Key Derivation**: 100,000+ iterations with random salt
- **AES-256-GCM Encryption**: Authenticated encryption for private keys
- **Secure Random Generation**: Cryptographically secure random values
- **Key Stretching**: Additional entropy for weak passwords
- **Hardware Security**: Support for hardware security modules

### 13.2: Cryptographic Identity

#### Identity Creation
```javascript
const identityManager = new Web3IdentityManager();

// Create new identity
const result = await identityManager.createIdentity(
  'ChessMaster2024',  // username
  '♟️',              // avatar
  'passphrase',      // auth method
  { passphrase: 'MySecurePassphrase123!' }
);
```

#### Identity Features
- **Unique Identity ID**: `mate_<timestamp>_<random>`
- **Public Key Fingerprinting**: SHA-256 hash of public key
- **Username Validation**: 3-20 characters, alphanumeric + underscore
- **Avatar Support**: Emoji or custom icons
- **Verification Status**: Cryptographic proof of identity

### 13.3: Move Signing & Verification

#### Signing Game Moves
```javascript
// Sign a chess move
const signedMove = await identityManager.signMove(
  'e2', 'e4', 'pawn', 'game-123', currentGameState
);

// Result:
{
  data: {
    from: 'e2',
    to: 'e4',
    piece: 'pawn',
    gameId: 'game-123',
    gameState: 'abc123...',
    moveType: 'move',
    timestamp: 1703123456789
  },
  signature: [123, 45, 67, ...], // Array of bytes
  publicKey: '-----BEGIN PUBLIC KEY-----...',
  keyId: 'abc123def456',
  timestamp: 1703123456789,
  identity: {
    id: 'mate_abc123_xyz789',
    username: 'ChessMaster2024',
    avatar: '♟️'
  }
}
```

#### Verifying Moves
```javascript
// Verify a signed move
const verification = await identityManager.verifySignature(signedMove);

// Result:
{
  valid: true,
  signer: {
    id: 'mate_abc123_xyz789',
    username: 'ChessMaster2024',
    avatar: '♟️'
  },
  timestamp: 1703123456789
}
```

### 13.4: Score Provenance & Leaderboards

#### Signing High Scores
```javascript
// Sign a high score
const signedScore = await identityManager.signHighScore(
  'chess',
  1500,
  { moves: 45, time: 1200000, difficulty: 'expert' }
);
```

#### Tamper-Proof Leaderboards
```javascript
// Verify all scores in leaderboard
const verifiedScores = await scoreManager.getVerifiedLeaderboard('chess');

// Only cryptographically verified scores are included
```

## Security Architecture

### Key Storage Security

1. **Private Key Protection**
   - Never stored in plaintext
   - Encrypted with user-derived key
   - Requires authentication to access

2. **Key Derivation**
   - PBKDF2 with 100,000+ iterations
   - Random salt per user
   - SHA-256 hashing

3. **Encryption Standards**
   - AES-256-GCM for private key encryption
   - 96-bit random IV for each encryption
   - Authenticated encryption for integrity

### Authentication Security

1. **Multiple Auth Methods**
   - Passphrase (strongest)
   - Biometric (convenient)
   - PIN/Pattern (quick access)

2. **Rate Limiting**
   - Failed attempts tracked
   - Exponential backoff
   - Account lockout after failures

3. **Session Management**
   - Keys unlocked temporarily
   - Auto-lock after inactivity
   - Clear memory on lock

## Implementation Files

### Core Files
- `src/js/web3/secure-key-storage.js` - Secure key storage with multiple auth methods
- `src/js/web3/web3-identity-manager.js` - Identity management and signing
- `src/js/web3/web3-share-manager.js` - Enhanced URL sharing with signatures
- `src/js/web3/web3-score-manager.js` - Cryptographic score management

### UI Components
- `src/web3-setup.html` - Web3 identity setup page
- `src/js/web3-setup-app.js` - Setup page controller
- `src/css/web3.css` - Web3-specific styles

## User Experience

### Initial Setup
1. User opens Mate for first time
2. Prompted to create Web3 identity
3. Choose authentication method
4. Set username and avatar
5. Keys generated and stored securely

### Daily Usage
1. User opens Mate
2. Authenticate to unlock identity
3. All moves automatically signed
4. Scores cryptographically verified
5. Auto-lock after inactivity

### Sharing Games
1. User creates game
2. Invites opponent with signed URL
3. Opponent verifies signature
4. Game proceeds with verified moves
5. Results signed and stored

## Benefits

### For Players
- **True Identity**: Cryptographically verified player identity
- **Move Provenance**: Every move is signed and verifiable
- **Score Integrity**: Tamper-proof leaderboards
- **Privacy**: Only public keys shared, private data stays local

### For Platform
- **Anti-Cheat**: Cryptographically impossible to fake moves/scores
- **Trust**: Players can verify each other's moves
- **Provenance**: Complete history of all game actions
- **Future-Proof**: Ready for blockchain integration

## Security Considerations

### Threats Mitigated
- **Key Theft**: Private keys encrypted with user authentication
- **Replay Attacks**: Timestamps and nonces in signatures
- **Man-in-the-Middle**: Public key verification
- **Score Manipulation**: Cryptographic signatures required

### Best Practices
- **Strong Passwords**: Encourage complex passphrases
- **Regular Backups**: Export identity for recovery
- **Secure Storage**: Use device keychain when available
- **Session Management**: Auto-lock inactive sessions

## Future Enhancements

### Blockchain Integration
- Store public keys on blockchain
- Verify identities against blockchain
- Cross-platform identity portability

### Advanced Features
- Multi-signature support
- Hardware wallet integration
- Decentralized identity standards
- Cross-game identity sharing

## Testing

### Security Tests
- Key generation randomness
- Encryption strength
- Authentication bypass attempts
- Signature verification accuracy

### User Experience Tests
- Setup flow completion
- Authentication methods
- Error handling
- Performance impact

## Conclusion

The Web3 implementation provides Mate with cryptographic security while maintaining the offline-first philosophy. Players get true ownership of their identity and game data, with cryptographic proof of all actions. This positions Mate as a leader in secure, verifiable gaming.
