#!/bin/bash

# Script to fix AdminPanel.js placeholder image error on EC2
# Run this ON EC2 server

echo "🔧 Fixing AdminPanel.js placeholder image fallback..."

cd ~/coorg-spices/frontend/src/pages

# Backup original file
cp AdminPanel.js AdminPanel.js.backup

# Fix line 384 - remove placeholder.jpg fallback
sed -i "384s|e.target.src = '/images/placeholder.jpg';|e.target.onerror = null; // Prevent infinite loop|" AdminPanel.js

echo "✅ AdminPanel.js updated"

# Rebuild frontend
echo "🏗️  Rebuilding frontend..."
cd ~/coorg-spices/frontend
npm run build

# Restart
echo "🔄 Restarting frontend..."
pm2 restart coorg-frontend

echo "✅ Done! Clear browser cache and reload."
