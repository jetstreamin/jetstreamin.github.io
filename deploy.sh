#!/bin/bash
# Jetstreamin Homepage Deployment Script
# Deploys homepage to jetstreamin.github.io

set -e

echo "🚀 Deploying Jetstreamin Homepage to GitHub Pages..."

# Navigate to homepage directory
cd "$(dirname "$0")"

# Check if jetstreamin.github.io exists
if [ ! -d "../jetstreamin.github.io" ]; then
    echo "📁 Cloning jetstreamin.github.io repository..."
    cd ..
    git clone https://github.com/jetstreamin/jetstreamin.github.io.git
    cd jetstreamin-homepage
fi

# Copy files to GitHub Pages repo
echo "📋 Copying homepage files..."
cp -r * ../jetstreamin.github.io/

# Navigate to GitHub Pages repo
cd ../jetstreamin.github.io

# Configure git if needed
if ! git config user.email > /dev/null 2>&1; then
    echo "⚙️ Configuring git..."
    git config user.email "jetstreamin@github.com"
    git config user.name "Jetstreamin Agent"
fi

# Stage changes
echo "📦 Staging changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✨ No changes to deploy"
    exit 0
fi

# Commit changes
echo "💾 Committing changes..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Deploy homepage update - $TIMESTAMP

- Updated Jetstreamin homepage
- Maintains 80-column compliance
- Real-time dashboard features
- AR experience integration
- Agent architecture showcase"

# Push to GitHub
echo "🌐 Pushing to GitHub Pages..."
git push origin master

echo "✅ Deployment successful!"
echo "🔗 Homepage will be available at: https://jetstreamin.github.io"
echo "⏱️ GitHub Pages may take a few minutes to update"
