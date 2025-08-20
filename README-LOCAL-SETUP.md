# Quick Local Setup Guide

## For Elite Games Soccer Room Deployment

### 1. Download Project
Export this Replit project as a zip file and extract it on your local server.

### 2. Install Node.js
Download and install Node.js v18+ from [nodejs.org](https://nodejs.org)

### 3. Setup Commands
```bash
# Navigate to project folder
cd elite-games-soccer

# Install dependencies
npm install

# Check local network setup
npm run setup-local

# Start the application
npm run dev
```

### 4. Tablet Access
- Connect tablets to same WiFi as server
- Open browser and go to: `http://[SERVER-IP]:5000`
- Bookmark for easy access

### 5. Games Available
- **Soccer Skeeball**: 45-second shooting challenge with scoring zones
- **Elite Shooter**: Hit all 9 perimeter zones in 45 seconds  
- **Team Relay Shootout**: Team-based 5-minute competition with color zones

### Network Requirements
- Server and tablets on same WiFi network
- Port 5000 open (configure firewall if needed)
- Static IP recommended for server

For detailed setup instructions, see `DEPLOYMENT_GUIDE.md`