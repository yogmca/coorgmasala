#!/bin/bash

# Fix npm install ENOTEMPTY error
# This script provides a faster way to clean and reinstall dependencies

echo "Fixing npm install ENOTEMPTY error..."
echo "========================================="

cd ~/coorg-spices/frontend

# Option 1: Remove only the problematic package
echo "Step 1: Removing problematic ajv-formats package..."
rm -rf node_modules/ajv-formats
rm -rf node_modules/.ajv-formats-*

# Try npm install again
echo "Step 2: Attempting npm install..."
npm install

# If that fails, use npm cache clean
if [ $? -ne 0 ]; then
    echo "Step 3: Cleaning npm cache..."
    npm cache clean --force
    
    echo "Step 4: Retrying npm install..."
    npm install
fi

# If still failing, move node_modules instead of deleting (faster)
if [ $? -ne 0 ]; then
    echo "Step 5: Moving node_modules to backup (faster than delete)..."
    mv node_modules node_modules.backup.$(date +%s)
    rm -f package-lock.json
    
    echo "Step 6: Fresh npm install..."
    npm install
    
    if [ $? -eq 0 ]; then
        echo "Step 7: Cleaning up backup in background..."
        nohup rm -rf node_modules.backup.* > /dev/null 2>&1 &
    fi
fi

echo "========================================="
echo "Done! Check if npm install succeeded above."
