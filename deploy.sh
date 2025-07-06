#!/bin/bash

# Deployment script for FU Learning API
set -e

echo "🚀 Starting deployment..."

# Set Node.js memory limits
export NODE_OPTIONS="--max-old-space-size=4096"

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf dist
rm -rf node_modules

# Install dependencies
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

# Build the application
echo "🔨 Building application..."
yarn build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"

# For Docker deployment
if [ "$1" = "docker" ]; then
    echo "🐳 Building Docker image..."
    docker build -t fu-learning-api .
    
    echo "🐳 Running Docker container..."
    docker run -d \
        --name fu-learning-api \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e NODE_OPTIONS="--max-old-space-size=2048" \
        fu-learning-api
fi

echo "🎉 Deployment completed!" 