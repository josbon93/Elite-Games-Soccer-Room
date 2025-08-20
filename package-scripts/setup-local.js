#!/usr/bin/env node

/**
 * Elite Games - Local Setup Script
 * Configures the application for local network deployment
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🏟️  Elite Games - Local Setup Configuration');
console.log('=========================================\n');

// Get local IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({
          interface: name,
          address: iface.address
        });
      }
    }
  }
  
  return ips;
}

// Display network information
function displayNetworkInfo() {
  const ips = getLocalIPs();
  
  console.log('📡 Network Configuration:');
  console.log('========================');
  
  if (ips.length === 0) {
    console.log('❌ No network interfaces found. Please check your network connection.');
    return;
  }
  
  ips.forEach((ip, index) => {
    console.log(`${index + 1}. ${ip.interface}: ${ip.address}`);
  });
  
  console.log('\n🔗 Tablet Access URLs:');
  ips.forEach((ip, index) => {
    console.log(`${index + 1}. http://${ip.address}:5000`);
  });
  
  console.log('\n📋 Setup Checklist:');
  console.log('===================');
  console.log('✅ 1. Install Node.js (v18 or higher)');
  console.log('✅ 2. Run "npm install" in project directory');
  console.log('⏳ 3. Configure firewall to allow port 5000');
  console.log('⏳ 4. Connect tablets to same WiFi network');
  console.log('⏳ 5. Start application with "npm run dev"');
  console.log('⏳ 6. Test access from tablets using URLs above');
}

// Create local configuration file
function createLocalConfig() {
  const config = {
    server: {
      host: '0.0.0.0',
      port: 5000,
      environment: 'local'
    },
    network: getLocalIPs(),
    setup_date: new Date().toISOString(),
    instructions: {
      tablet_access: 'Connect tablets to same WiFi and use URLs listed above',
      firewall: 'Ensure port 5000 is allowed through firewall',
      static_ip: 'Consider setting static IP for server for consistent access'
    }
  };
  
  const configPath = path.join(__dirname, '..', 'local-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(`\n💾 Configuration saved to: ${configPath}`);
}

// Check system requirements
function checkRequirements() {
  console.log('\n🔍 System Requirements Check:');
  console.log('============================');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    console.log(`✅ Node.js: ${nodeVersion} (Compatible)`);
  } else {
    console.log(`❌ Node.js: ${nodeVersion} (Please upgrade to v18 or higher)`);
  }
  
  // Check available memory
  const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024));
  const freeMem = Math.round(os.freemem() / (1024 * 1024 * 1024));
  
  console.log(`💾 Memory: ${freeMem}GB free / ${totalMem}GB total`);
  
  if (totalMem >= 2) {
    console.log('✅ Memory: Sufficient for Elite Games');
  } else {
    console.log('⚠️  Memory: Low - consider upgrading for better performance');
  }
  
  // Check platform
  console.log(`💻 Platform: ${os.platform()} ${os.arch()}`);
}

// Generate QR codes for easy tablet access (text-based)
function generateAccessInfo() {
  const ips = getLocalIPs();
  
  if (ips.length > 0) {
    console.log('\n📱 Tablet Setup Instructions:');
    console.log('=============================');
    console.log('1. Connect tablets to WiFi network');
    console.log('2. Open web browser on each tablet');
    console.log('3. Navigate to one of these URLs:');
    
    ips.forEach((ip, index) => {
      console.log(`   Option ${index + 1}: http://${ip.address}:5000`);
    });
    
    console.log('4. Bookmark the URL for quick access');
    console.log('5. Test all three games: Soccer Skeeball, Elite Shooter, Team Relay Shootout');
  }
}

// Main setup function
function runSetup() {
  try {
    checkRequirements();
    displayNetworkInfo();
    createLocalConfig();
    generateAccessInfo();
    
    console.log('\n🚀 Setup Complete!');
    console.log('==================');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Test tablet access using URLs above');
    console.log('3. Configure firewall if needed');
    console.log('\nFor detailed instructions, see DEPLOYMENT_GUIDE.md');
    console.log('\nTo run this setup script again: node package-scripts/setup-local.js');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
runSetup();