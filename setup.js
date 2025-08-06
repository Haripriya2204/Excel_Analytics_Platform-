#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Excel Analytics Platform Setup\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync('env.example', '.env');
  console.log('✅ .env file created successfully');
} else {
  console.log('✅ .env file already exists');
}

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ uploads directory created');
} else {
  console.log('✅ uploads directory already exists');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing root dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Root dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install root dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Root dependencies already installed');
}

// Check if client node_modules exists
const clientNodeModules = path.join(__dirname, 'client', 'node_modules');
if (!fs.existsSync(clientNodeModules)) {
  console.log('📦 Installing client dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
    console.log('✅ Client dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install client dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Client dependencies already installed');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running');
console.log('2. Update .env file with your configuration');
console.log('3. Run "npm run dev" to start the application');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📚 For more information, see README.md'); 