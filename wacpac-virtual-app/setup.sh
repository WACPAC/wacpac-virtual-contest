#!/bin/bash

echo "🚀 Setting up wacpac-virtual-app..."

# Clean install for reproducible builds
echo "📦 Installing dependencies (clean install)..."
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning existing node_modules..."
    rm -rf node_modules
fi

npm ci

echo "🐳 Starting database container..."
docker-compose up -d db

echo "⏳ Waiting for database to be ready..."
sleep 3

echo "🗄️  Running Prisma database migration..."
npx prisma db push

echo "🎯 Setup complete! Starting development server..."
npm run dev