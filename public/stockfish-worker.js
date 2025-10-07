/**
 * Stockfish Web Worker
 * Loads Stockfish WASM from CDN and provides UCI interface
 */

// Load Stockfish from CDN
importScripts('https://cdn.jsdelivr.net/npm/stockfish@16.0.0/stockfish.js');

let stockfish = null;

// Initialize Stockfish
if (typeof Stockfish === 'function') {
  stockfish = Stockfish();
  
  // Forward messages from Stockfish to main thread
  stockfish.onmessage = function(event) {
    postMessage(event);
  };
}

// Handle messages from main thread
self.addEventListener('message', function(e) {
  if (!stockfish) {
    postMessage({ error: 'Stockfish not initialized' });
    return;
  }
  
  // Forward command to Stockfish
  stockfish.postMessage(e.data);
});

// Send ready message
postMessage({ type: 'ready' });

