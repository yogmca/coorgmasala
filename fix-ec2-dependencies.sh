#!/bin/bash

# Fix EC2 Dependencies - Install missing Node modules
# This script should be run on your EC2 instance

echo "=========================================="
echo "Installing Backend Dependencies on EC2"
echo "=========================================="

# Navigate to backend directory
cd /home/ubuntu/coorgmasala/backend

# Install all dependencies from package.json
echo "Installing npm packages..."
npm install

# Verify mongoose is installed
if [ -d "node_modules/mongoose" ]; then
    echo "✓ Mongoose installed successfully"
else
    echo "✗ Mongoose installation failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "You can now run your seed script:"
echo "  node seed.js"
echo ""
echo "Or start the server:"
echo "  npm start"
echo "=========================================="
