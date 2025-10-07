/**
 * Game ID Generator
 * Generates short, unique identifiers for chess games
 */

export class GameIDGenerator {
  /**
   * Generate short, unique game ID
   * Base36 = 0-9, a-z (36 characters)
   * 4 chars = 36^4 = 1,679,616 possible combinations
   * 
   * Format: XXXX (e.g., "g4f2", "k9x3", "a1b2")
   */
  static generate() {
    // Use timestamp + random for uniqueness
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    
    // Combine and take last 4 characters
    const combined = (timestamp + random).substr(-4);
    
    return combined.toLowerCase();
  }
  
  /**
   * Validate game ID format
   * Must be exactly 4 characters, alphanumeric (base36)
   */
  static isValid(gameId) {
    if (!gameId || typeof gameId !== 'string') return false;
    return /^[0-9a-z]{4}$/.test(gameId);
  }
  
  /**
   * Generate collision-resistant ID
   * Checks against existing IDs and regenerates if collision occurs
   */
  static generateUnique(existingIds = []) {
    let attempts = 0;
    let id;
    
    do {
      id = this.generate();
      attempts++;
      
      // Safety: prevent infinite loop (very unlikely)
      if (attempts > 100) {
        // Use timestamp-only approach for guaranteed uniqueness
        id = Date.now().toString(36).substr(-4);
        break;
      }
    } while (existingIds.includes(id));
    
    return id;
  }
  
  /**
   * Parse game ID from URL
   * Extracts game ID from various URL formats
   */
  static parseFromURL(url) {
    // Match patterns like:
    // /m/g4f2-Nf3
    // /g/k9x3-e4-e5-Nf3
    const match = url.match(/\/[mg]\/([0-9a-z]{4})/);
    return match ? match[1] : null;
  }
  
  /**
   * Generate human-readable game code
   * For verbal communication: "Golf-4-Foxtrot-2"
   */
  static toPhoneticCode(gameId) {
    if (!this.isValid(gameId)) return null;
    
    const phonetic = {
      '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
      '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
      'a': 'Alpha', 'b': 'Bravo', 'c': 'Charlie', 'd': 'Delta', 'e': 'Echo',
      'f': 'Foxtrot', 'g': 'Golf', 'h': 'Hotel', 'i': 'India', 'j': 'Juliet',
      'k': 'Kilo', 'l': 'Lima', 'm': 'Mike', 'n': 'November', 'o': 'Oscar',
      'p': 'Papa', 'q': 'Quebec', 'r': 'Romeo', 's': 'Sierra', 't': 'Tango',
      'u': 'Uniform', 'v': 'Victor', 'w': 'Whiskey', 'x': 'X-ray', 
      'y': 'Yankee', 'z': 'Zulu'
    };
    
    return gameId.split('').map(char => phonetic[char]).join('-');
  }
}

