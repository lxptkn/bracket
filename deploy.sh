#!/bin/bash

# Tournament Site Deployment Script
# This script pulls the latest changes from git and rebuilds the Docker container

set -e

echo "🚀 Starting deployment..."

# Pull latest changes from git
echo "📥 Pulling latest changes from git..."
git pull origin main

# Stop the existing container
echo "🛑 Stopping existing container..."
docker-compose down

# Remove old images to free up space
echo "🧹 Cleaning up old images..."
docker image prune -f

# Build and start the new container
echo "🔨 Building and starting new container..."
docker-compose up -d --build

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 10

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful! Container is running."
    echo "🌐 Your site should be available at: http://your-server-ip:3000"
else
    echo "❌ Deployment failed! Container is not running."
    docker-compose logs
    exit 1
fi
