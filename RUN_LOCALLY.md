# RUN_LOCALLY.md
# Elite Games Soccer Room - Local Deployment Requirements

This document outlines everything needed to run the Elite Games Soccer Room application locally on your server.

## System Requirements

### Server Hardware
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 2GB (4GB recommended for multiple concurrent users)
- **Storage**: 1GB free disk space
- **CPU**: Any modern processor (application is not CPU intensive)

### Network Requirements
- Local WiFi network for tablet connectivity
- Port 5000 available (configurable if needed)
- Static IP address for server (recommended for consistent tablet access)

## Software Dependencies

### Required Software
1. **Node.js**: Version 18 or higher (critical requirement)
   - Download from [nodejs.org](https://nodejs.org)
   - Includes npm package manager

### Application Dependencies (Auto-installed via npm)
The application uses 77 dependencies total, including:

**Core Runtime:**
- React 18.3.1 + React DOM
- Express.js 4.21.2 (web server)
- TypeScript 5.6.3
- Vite 5.4.19 (build tool)

**Game Features:**
- Framer Motion (animations)
- Zustand (game state management)
- TanStack React Query (data fetching)
- Wouter (routing)

**UI Components:**
- 23 Radix UI components (buttons, modals, forms, etc.)
- Tailwind CSS + plugins
- Lucide React (icons)

## Installation Commands

### Setup Process
```bash
# 1. Extract downloaded project files
# 2. Navigate to project folder
cd elite-games-soccer

# 3. Install all dependencies (one-time setup)
npm install

# 4. Check network configuration
node package-scripts/setup-local.js

# 5. Start application for development
npm run dev

# OR for production build:
npm run build
npm start
```

## Build & Run Commands Available

### Development
- `npm run dev` - Starts development server with hot reload
- `npm run check` - TypeScript type checking

### Production
- `npm run build` - Builds optimized production version
- `npm start` - Runs production build

### Database (if needed)
- `npm run db:push` - Pushes schema changes (currently uses in-memory storage)

## Network Configuration

### Server Settings
- **Host**: `0.0.0.0` (allows external connections)
- **Port**: 5000 (configurable via PORT environment variable)
- **URL Pattern**: `http://[SERVER-IP]:5000`

### Tablet Access
- Tablets connect via local WiFi
- Example: `http://192.168.1.100:5000`
- No internet required after initial setup

## Included Setup Tools

### Automated Setup Scripts
- `start-local-server.bat` (Windows) - One-click server start
- `start-local-server.sh` (Linux/macOS) - Shell script for Unix systems
- `package-scripts/setup-local.js` - Network configuration checker

### Documentation
- `DEPLOYMENT_GUIDE.md` - Complete 200-line deployment guide
- `README-LOCAL-SETUP.md` - Quick start instructions

## Firewall Requirements

### Port Access
- **Inbound**: Port 5000 (for tablet connections)
- **Outbound**: Port 443/80 (for initial npm install only)

## Storage & Data

### Application Data
- **Type**: In-memory storage (no database required)
- **Persistence**: Session-based (resets on server restart)
- **Offline**: Fully functional without internet after setup

## Quick Start Summary

### Internet Required For:
- Initial Node.js installation
- One-time `npm install` command

### Internet NOT Required For:
- Running the application
- Tablet gameplay
- All game functionality

### Games Available:
- **Soccer Skeeball**: 45-second shooting challenge with scoring zones (-10 to +50 points)
- **Elite Shooter**: Hit all 9 perimeter zones in 45 seconds
- **Team Relay Shootout**: Team-based 5-minute competition with color zones

## Troubleshooting

### Common Issues
- **Cannot access from tablets**: Check firewall settings and network connectivity
- **Application not starting**: Verify Node.js installation and run `npm install`
- **Performance issues**: Close unnecessary applications, consider RAM upgrade

### Testing Connection
```bash
# Test tablet connectivity
ping [SERVER-IP]

# Check if port is available
netstat -an | grep 5000
```

## Final Notes

The application is designed for completely offline operation once initially set up, making it perfect for your Elite Games Soccer room environment. All game logic, timers, scoring, and UI components work independently without requiring internet connectivity during gameplay.