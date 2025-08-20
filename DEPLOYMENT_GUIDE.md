# Elite Games Soccer Room - Local Deployment Guide

## Overview
This guide helps you deploy the Elite Games Soccer Room application on a local server for tablet access in your physical location.

## System Requirements

### Server Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 2GB (4GB recommended for multiple concurrent users)
- **Storage**: 1GB free space
- **Network**: Ethernet or WiFi connection
- **Node.js**: Version 18 or higher

### Network Requirements
- Local WiFi network for tablet connectivity
- Static IP address for the server (recommended)
- Port 5000 available (or configure alternative port)

## Installation Steps

### 1. Download and Extract Project
1. Download the project files from Replit as a zip file
2. Extract to a folder on your server (e.g., `C:\EliteGames\` or `/opt/elite-games/`)

### 2. Install Node.js
**Windows:**
1. Download Node.js from [nodejs.org](https://nodejs.org)
2. Install using the downloaded installer
3. Verify installation: Open Command Prompt and run `node --version`

**Linux/Ubuntu:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node
```

### 3. Install Project Dependencies
Open terminal/command prompt in the project folder:
```bash
npm install
```

### 4. Configure for Local Network
The application is already configured to bind to `0.0.0.0:5000` for network access.

### 5. Start the Application
```bash
npm run dev
```

The server will start and display:
```
[express] serving on port 5000
```

## Network Configuration

### Find Your Server's IP Address
**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Linux/macOS:**
```bash
ip addr show
# or
ifconfig
```

### Set Static IP (Recommended)
Configure your server with a static IP address to ensure tablets can always find it:
- Access your router's admin panel
- Set a static/reserved IP for your server
- Example: Reserve 192.168.1.100 for your server

## Tablet Access Setup

### 1. Connect Tablets to WiFi
Ensure all tablets are connected to the same WiFi network as your server.

### 2. Access the Application
On each tablet's web browser, navigate to:
```
http://[SERVER_IP]:5000
```
Example: `http://192.168.1.100:5000`

### 3. Create Bookmarks
Add the application URL as a bookmark on each tablet for easy access.

## Firewall Configuration

### Windows Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change Settings" then "Allow another app"
4. Browse to your Node.js installation or add port 5000

### Linux (UFW)
```bash
sudo ufw allow 5000
```

## Running as a Service (Production)

### Windows Service
Install as a Windows service using PM2:
```bash
npm install -g pm2
npm install -g pm2-windows-service
pm2-service-install
pm2 start npm --name "elite-games" -- run dev
pm2 save
```

### Linux Service
Create a systemd service file:
```bash
sudo nano /etc/systemd/system/elite-games.service
```

Add the following content:
```ini
[Unit]
Description=Elite Games Soccer Room
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/elite-games
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable elite-games
sudo systemctl start elite-games
```

## Troubleshooting

### Common Issues

**Cannot access from tablets:**
- Check if server and tablets are on same network
- Verify firewall settings allow port 5000
- Confirm server IP address is correct

**Application not starting:**
- Ensure Node.js is installed correctly
- Check if port 5000 is already in use
- Verify all dependencies are installed with `npm install`

**Performance issues:**
- Close unnecessary applications on server
- Consider upgrading server RAM
- Monitor CPU usage during peak times

### Testing Connection
Test tablet connectivity by pinging the server:
```bash
ping [SERVER_IP]
```

### Port Alternative
If port 5000 is unavailable, modify the port in `server/index.ts`:
```typescript
const PORT = process.env.PORT || 3000; // Change to desired port
```

## Maintenance

### Regular Updates
- Periodically restart the application
- Monitor server performance
- Keep Node.js updated

### Backup
- Backup the application files
- Document any configuration changes
- Keep network settings documented

## Support
For technical support or customization needs, contact your development team with specific error messages and system information.