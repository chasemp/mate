# Port Registry - Multi-PWA Development

This document tracks port allocations across all PWA projects to avoid conflicts during development.

## Why Port Management Matters

When developing multiple PWAs simultaneously:
- Each needs a dedicated port
- Conflicts cause deployment confusion
- Standardization improves developer experience
- Clear registry prevents "which port is which?" questions

## Port Allocations

| Port | Project | URL | Status |
|------|---------|-----|--------|
| 3000 | *Reserved* | - | Available for quick tests |
| 3456 | [peadoubleueh](https://github.com/chasemp/peadoubleueh) | https://pea.523.life | ✅ Active |
| 3456 | [Blockdoku](https://github.com/chasemp/blockdoku_pwa) | https://blockdoku.523.life | ✅ Active |
| **3458** | **Chess** | https://chess.523.life | 🚧 **In Development** |
| 3002 | CannonPop | https://cannonpop.523.life | ✅ Active |
| 3004 | MealPlanner | https://mealplanner.523.life | ✅ Active |
| 3005 | Giffer | https://giffer.523.life | ✅ Active |

## Usage

### Check if Your Port is in Use

```bash
# Chess PWA (port 3458)
npm run port:check

# Or manually
lsof -i :3458
```

### Kill Process on Your Port

```bash
# Chess PWA
npm run port:kill

# Or manually
lsof -ti :3458 | xargs kill -9
```

### Force Start (Kill + Start)

```bash
npm run port:force
```

## Configuration

### vite.config.js

```javascript
export default defineConfig({
  server: {
    port: 3458,           // Chess PWA port
    host: '0.0.0.0',      // Allow external connections
    strictPort: true      // Fail if port in use (don't auto-increment)
  }
})
```

### Why strictPort: true?

Setting `strictPort: true` ensures that if port 3458 is already in use, Vite fails immediately rather than silently using port 3459. This prevents confusion about which port your app is actually running on.

## Adding a New PWA

1. Choose an unused port (check this registry)
2. Update this file with your allocation
3. Configure your `vite.config.js` with the port
4. Add port scripts to your `package.json`
5. Test with `npm run port:check`

## Port Selection Strategy

- **3000-3099:** General purpose / testing
- **3100-3199:** Reserved for future games
- **3456:** PWA templates and major projects
- **34XX:** Games and entertainment PWAs
- **30XX:** Utility PWAs (meal planner, etc.)

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3458

# Kill it
npm run port:kill

# Or kill by PID
kill -9 <PID>
```

### Wrong Port After Restart

- Check `vite.config.js` - should have `strictPort: true`
- Check no other Vite instances running
- Verify no other service bound to that port

### Development Server Won't Start

```bash
# 1. Check port status
npm run port:check

# 2. Kill any processes on the port
npm run port:kill

# 3. Try starting again
npm run dev
```

## Best Practices

1. **Always use npm scripts** - Don't hardcode ports in commands
2. **Document your port** - Update this registry immediately
3. **Use strictPort** - Fail fast if port conflicts
4. **Check before starting** - Run `npm run port:check` first
5. **Clean shutdown** - Use Ctrl+C, not killing terminal

## Multi-PWA Development Tips

### Running Multiple PWAs Simultaneously

```bash
# Terminal 1
cd ~/git/chasemp/chess
npm run dev          # Port 3458

# Terminal 2  
cd ~/git/chasemp/blockdoku_pwa
npm run dev          # Port 3456

# Terminal 3
cd ~/git/chasemp/peadoubleueh
npm run dev          # Port 3456 (if Blockdoku not running)
```

### Port Conflict Resolution

If two PWAs are configured for the same port:
1. Run only one at a time, OR
2. Temporarily change one's port in vite.config.js
3. Long-term: Assign unique ports and update this registry

---

**For Chess PWA:** Port 3458 is yours! 🎮♟️

