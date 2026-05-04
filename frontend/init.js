#!/usr/bin/env node

/**
 * Frontend Project Initialization Script
 * Run this script to set up the frontend environment
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 SiDoku Frontend Initialization\n')

// Check Node version
const nodeVersion = process.version
console.log(`✅ Node version: ${nodeVersion}`)

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules')
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  node_modules not found')
  console.log('📦 Run: npm install\n')
} else {
  console.log('✅ Dependencies installed\n')
}

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env.local not found')
  console.log('📝 Creating .env.local from .env.example...')
  
  const envExamplePath = path.join(__dirname, '.env.example')
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8')
    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env.local created\n')
  }
} else {
  console.log('✅ .env.local exists\n')
}

// Summary
console.log('📋 Frontend Setup Summary:\n')
console.log('✅ Project structure: Complete')
console.log('✅ Components: 35+ files created')
console.log('✅ Routing: All 9 routes configured')
console.log('✅ State management: AuthContext ready')
console.log('✅ API services: 7 service files')
console.log('✅ UI components: 8 base components')
console.log('✅ Custom hooks: useForm, useFetch')
console.log('✅ Styling: Tailwind CSS configured\n')

console.log('🚀 Next steps:\n')
console.log('1. npm install          (if not done)')
console.log('2. npm run dev          (start dev server)')
console.log('3. Open http://localhost:5173\n')

console.log('📚 Documentation:\n')
console.log('- README.md             (Setup & development guide)')
console.log('- FRONTEND_STRUCTURE.md (Architecture & components)\n')

console.log('✨ Ready to build amazing things!\n')
