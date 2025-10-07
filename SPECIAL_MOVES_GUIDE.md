# ♟️ Special Chess Moves Guide

## Overview

The Chess PWA now fully supports **all three special chess moves**:

1. **Castling** - King and rook move together
2. **En Passant** - Special pawn capture
3. **Pawn Promotion** - Pawn reaches the opposite end

---

## 🏰 Castling

### What is Castling?

A special move involving the king and a rook that haven't moved yet. It's the only move where two pieces move simultaneously.

### How to Castle

1. **Select your king** (must be in starting position)
2. **Legal castling squares highlight in green**:
   - **Kingside**: King moves 2 squares right (to g1/g8)
   - **Queenside**: King moves 2 squares left (to c1/c8)
3. **Click the destination** - both king and rook move automatically!

### Requirements

✅ **King** and **rook** must not have moved  
✅ **No pieces** between king and rook  
✅ **King not in check** currently  
✅ **King doesn't move through check**  
✅ **King doesn't end in check**

### Notation

- **Kingside castling**: `O-O`
- **Queenside castling**: `O-O-O`

### Visual Cues

- When you select the king, castling squares (if legal) will **highlight in green**
- Click the destination square (g1/g8 or c1/c8)
- Both king and rook move automatically in one action!

---

## 👻 En Passant

### What is En Passant?

A special pawn capture that can occur when an opponent's pawn moves two squares forward from its starting position and lands beside your pawn.

### How it Works

1. **Opponent moves pawn two squares** forward (e.g., e7 → e5)
2. **Your pawn is beside it** on the same rank (e.g., on d5 or f5)
3. **On your very next turn**, you can capture it diagonally as if it had moved only one square

### Example

```
Turn 1: White pawn e2 → e4
Turn 2: Black pawn d7 → d5
Turn 3: White pawn e4 → e5 (moves two squares, landing beside black pawn)
Turn 4: Black pawn d5 → e6 (captures white pawn en passant!)
```

### Visual Cues

- When you select your pawn, **en passant squares highlight in green** (if legal)
- The captured pawn disappears from its original square
- Your pawn moves diagonally to an "empty" square

### Important Rules

⏰ **Can only capture en passant on the very next turn**  
⚠️ **If you don't capture immediately, you lose the opportunity**

---

## 👑 Pawn Promotion

### What is Pawn Promotion?

When a pawn reaches the opposite end of the board (rank 8 for white, rank 1 for black), it **must** be promoted to another piece.

### How to Promote

1. **Move your pawn** to the last rank
2. **Promotion dialog appears automatically**
3. **Choose your piece**:
   - ♕ **Queen** (most powerful, most common choice)
   - ♖ **Rook** (good for endgames)
   - ♗ **Bishop** (useful in specific positions)
   - ♘ **Knight** (can create forks and tactics)
4. **Your pawn transforms immediately!**

### Visual Cues

- Move your pawn to rank 8 (white) or rank 1 (black)
- **Modal dialog appears** with 4 large buttons
- Click your choice - the piece changes instantly!
- Game continues with your new piece

### Strategy Tips

- **Default to Queen** in most cases (most powerful piece)
- **Knight** can be useful for specific tactics (especially forks or checkmates)
- **Rook** is good in endgames with limited pieces
- **Bishop** rarely chosen but can be useful in certain positions
- **You can promote to ANY piece**, even if you still have the original (yes, you can have 2 queens!)

### Notation

Promotion shown with `=` or `/`:
- **Pawn to e8 promotes to queen**: `e8=Q` or `e8Q`
- **Pawn captures and promotes**: `exd8=Q`

---

## 🎮 How to Execute Special Moves

### In the PWA

All special moves work **automatically**:

1. **Select the piece** you want to move
2. **Legal moves highlight in green** (including special moves!)
3. **Click the destination**
4. **Special move executes automatically**

### Castling Example

```
1. Click white king (e1)
2. See green highlights on g1 (kingside) and c1 (queenside)
3. Click g1
4. King moves to g1, rook automatically moves from h1 to f1!
```

### En Passant Example

```
1. Opponent moves pawn two squares (e.g., e7 → e5)
2. On your turn, click your pawn beside it (e.g., d5)
3. See diagonal capture square highlighted (e6)
4. Click e6
5. Your pawn moves to e6, opponent's pawn on e5 disappears!
```

### Pawn Promotion Example

```
1. Click your pawn on rank 7
2. Click rank 8 square
3. Pawn moves, promotion dialog appears
4. Click "Queen" button
5. Pawn transforms to queen!
```

---

## 🐛 Troubleshooting

### "Why can't I castle?"

Check these requirements:
- ❓ Has your king moved at all this game? (Even if you moved it back, castling is forbidden)
- ❓ Has that rook moved?
- ❓ Are there pieces between the king and rook?
- ❓ Is your king currently in check?
- ❓ Would your king move through an attacked square?
- ❓ Would your king end up in check?

### "Why can't I capture en passant?"

- ❓ Did the opponent's pawn move two squares on their LAST turn?
- ❓ Is your pawn on the 5th rank (for white) or 4th rank (for black)?
- ❓ Is the opponent's pawn directly beside yours?

**Remember**: En passant can ONLY be done on the immediate next turn!

### "The promotion dialog isn't appearing"

- ❓ Did your pawn reach rank 8 (white) or rank 1 (black)?
- ❓ Try refreshing the page if it's stuck

---

## 📊 Move Tracking

All special moves are properly recorded in move history:

- **Castling**: Shows as `O-O` or `O-O-O`
- **En Passant**: Shows as normal capture (e.g., `dxe6`)
- **Promotion**: Shows as `e8=Q`, `exd8=N`, etc.

---

## 🎯 Practice Scenarios

### Test Castling

1. Start new game
2. Move: **e4 e5 Nf3 Nc6 Bc4 Bc5**
3. Now **kingside castling** is legal for both sides!
4. Click king → click g1 (white) or g8 (black)

### Test En Passant

1. Start new game
2. Move: **e4 d6 e5 f5**
3. Now white can capture **en passant**: click e5 pawn → click f6

### Test Promotion

1. Start new game (or use existing game)
2. Advance a pawn to rank 7
3. Move it to rank 8
4. Choose promotion piece from dialog

---

## 🔥 Advanced Tips

1. **Castling Early**: Generally good to castle early (moves 3-10) for king safety
2. **Kingside vs Queenside**: Kingside castling is more common and faster to set up
3. **En Passant Tactics**: Can be crucial in pawn endgames - don't forget about it!
4. **Underpromotion**: Promoting to knight (instead of queen) can sometimes deliver checkmate or create a winning fork
5. **Promoted Queens**: Having 2 queens is rare but devastating!

---

## 🛠️ Technical Implementation

For developers interested in the internals:

- **Castling tracking**: `pieceMoveTracker` Set stores which pieces have moved
- **En passant detection**: Checks last move was a pawn moving 2 squares
- **Promotion UI**: Modal dialog with 4 buttons, integrates seamlessly with move system
- **Notation**: Special moves properly recorded in `moveHistory`
- **Undo**: All special moves can be undone (coming soon!)

---

Enjoy the complete chess experience! ♟️

