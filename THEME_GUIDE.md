# 🎨 Chess PWA Theme Guide

Inspired by [Lichess's customization system](https://github.com/lichess-org/lichobile), our Chess PWA features **5 piece sets** and **8 board themes** that can be mixed and matched!

## 🎯 Quick Access

- **Settings Page**: Click the ⚙️ button or visit `/settings.html`
- **Persistent**: Your theme choices are saved in localStorage
- **Mix & Match**: Any piece set works with any board theme

---

## ♟️ Piece Sets

### 1. Classic 👑
**Traditional chess pieces**
- Standard Unicode chess symbols
- Clean white and black contrast
- Perfect for traditional play
- Font size: 70% of square
- Moderate stroke width (2px)

### 2. Bold 💪
**High contrast, easy to see**
- Larger pieces (75% of square)
- Extra-thick outlines (3px)
- Enhanced shadows for depth
- Great for mobile/small screens
- Perfect for visual accessibility

### 3. Modern ✨
**Clean and minimal**
- Smaller, refined pieces (65% of square)
- Subtle shadows
- Thin strokes (1.5px)
- Contemporary aesthetic
- Less visual noise

### 4. Neon 🌟
**Futuristic glow effect**
- Cyan white pieces
- Magenta black pieces
- Glow/shadow effects
- Cyberpunk aesthetic
- Great with "Neon Nights" board

### 5. Royal 👑
**Elegant gold and silver**
- Gold white pieces
- Silver black pieces
- Luxurious look
- Thicker strokes (2.5px)
- Regal appearance

---

## 🎨 Board Themes

### 1. Brown 🌰
**Classic wooden board**
- Light: `#f0d9b5` (cream)
- Dark: `#b58863` (brown)
- The traditional tournament look
- Warm, familiar colors

### 2. Blue Ocean 🌊
**Cool ocean colors**
- Light: `#dee3e6` (light blue-gray)
- Dark: `#8ca2ad` (slate blue)
- Calming, professional
- Easy on the eyes

### 3. Green Forest 🌲
**Natural green tones**
- Light: `#ffffdd` (cream yellow)
- Dark: `#86a666` (forest green)
- Natural, organic feel
- Popular tournament alternative

### 4. Purple Haze 💜
**Royal purple theme**
- Light: `#e8d5ff` (lavender)
- Dark: `#9f7ac0` (purple)
- Unique, elegant
- Great for personal style

### 5. Marble 🏛️
**Elegant marble pattern**
- Light: `#f7f7f7` (white)
- Dark: `#b0b0b0` (gray)
- Sophisticated, clean
- Minimalist aesthetic

### 6. Tournament 🏆
**High contrast for serious play**
- Light: `#ffffff` (pure white)
- Dark: `#6c757d` (dark gray)
- Maximum clarity
- Professional competition look

### 7. Dark Mode 🌙
**Easy on the eyes**
- Light: `#3a3a3a` (dark gray)
- Dark: `#1e1e1e` (near black)
- Night-friendly
- Reduces eye strain

### 8. Neon Nights 🌃
**Cyberpunk aesthetic**
- Light: `#1a1a2e` (dark blue)
- Dark: `#0f0f1e` (darker blue)
- Cyan accents
- Pairs perfectly with "Neon" pieces

---

## 🎯 Highlighting System

All themes include smart highlighting:

- **Selected Piece**: Yellow/cyan highlight
- **Legal Moves**: Green highlights
- **Last Move**: Subtle yellow/color highlight on both squares
- **Check**: Red highlight on king in check
- **Border**: Coordinated border color

---

## 💡 Recommended Combinations

### Classic Tournament
- **Pieces**: Classic or Bold
- **Board**: Brown or Tournament
- **Best For**: Traditional play, tournaments

### Modern Minimal
- **Pieces**: Modern
- **Board**: Marble or Tournament
- **Best For**: Clean, distraction-free play

### Cyberpunk
- **Pieces**: Neon
- **Board**: Neon Nights
- **Best For**: Unique aesthetic, night play

### Royal Elegance
- **Pieces**: Royal
- **Board**: Purple Haze or Brown
- **Best For**: Luxurious feel, special games

### Night Mode
- **Pieces**: Bold or Modern
- **Board**: Dark Mode
- **Best For**: Late-night play, eye strain reduction

---

## 🔧 Technical Details

### Storage
- Settings saved to `localStorage` key: `chess-theme-settings`
- Format: `{ pieceSet: 'classic', boardTheme: 'brown' }`
- Persists across sessions
- Syncs between pages

### Implementation
- **ThemeManager**: `/src/js/ui/theme-manager.js`
- **Settings UI**: `/src/settings.html` + `/src/js/settings-app.js`
- **Rendering**: Canvas-based with dynamic styling
- **Performance**: No external assets, all Unicode + CSS

### Adding New Themes

#### New Piece Set:
```javascript
custom: {
  name: 'Custom',
  description: 'Your custom style',
  pieces: {
    'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
    'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
  },
  style: {
    fontSize: 0.7,
    whiteColor: '#ffffff',
    whiteShadow: '#000000',
    blackColor: '#000000',
    blackShadow: '#ffffff',
    strokeWidth: 2,
    glow: false
  }
}
```

#### New Board Theme:
```javascript
custom: {
  name: 'Custom Board',
  description: 'Your custom colors',
  light: '#ffffff',
  dark: '#000000',
  selected: '#ffff00',
  legalMove: '#00ff00',
  lastMove: '#ffaa00',
  check: '#ff0000',
  border: '#333333'
}
```

---

## 📱 Mobile Considerations

- All themes tested on mobile devices
- Touch-friendly settings interface
- Visual previews for easy selection
- Instant theme switching
- No page reload required

---

## 🎮 User Experience

1. **First Load**: Defaults to Classic pieces + Brown board
2. **Easy Discovery**: Settings button (⚙️) always visible
3. **Visual Preview**: See before you select
4. **Instant Feedback**: Changes apply immediately on return to game
5. **Persistent Choice**: Your selection is remembered

---

## 🚀 Future Enhancements

Potential additions (not yet implemented):

- SVG-based piece sets for higher quality
- Animated piece movements
- Sound themes (different sound sets for different themes)
- User-uploadable custom piece images
- Theme import/export
- Community-shared themes

