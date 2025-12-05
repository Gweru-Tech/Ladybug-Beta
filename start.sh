#!/bin/bash

# LADYBUG BETA Bot Startup Script
# This script helps you easily start the bot on different platforms

echo "🐞 LADYBUG BETA Bot Startup Script"
echo "===================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "📖 Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ Node.js $(node -v) and npm $(npm -v) are installed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p session data temp

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
    echo "🔑 Don't forget to add your AI API key!"
fi

# Check if we're on Render.com
if [ -n "$RENDER" ]; then
    echo "🌐 Detected Render.com environment"
    echo "🚀 Starting bot for production..."
    npm start
    exit $?
fi

# Check if we're in development mode
if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    echo "🔧 Starting in development mode..."
    npm run dev
    exit $?
fi

# Check if we should use Docker
if [ "$1" = "docker" ]; then
    echo "🐳 Starting with Docker..."
    if command -v docker &> /dev/null; then
        docker-compose up -d
        echo "✅ Bot started with Docker"
        echo "🌐 Dashboard: http://localhost:3000"
        echo "📊 Logs: docker-compose logs -f ladybug-bot"
        exit 0
    else
        echo "❌ Docker is not installed"
        exit 1
    fi
fi

# Normal startup
echo "🚀 Starting LADYBUG BETA Bot..."
echo "🌐 Dashboard will be available at: http://localhost:3000"
echo "📱 Bot pairing: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the bot"
echo ""

npm start