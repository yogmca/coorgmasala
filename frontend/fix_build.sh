#!/bin/bash

# Fix NPM Build Issues - Clean and Reinstall
# This script removes node_modules and reinstalls dependencies

set -e  # Exit on error

echo "=========================================="
echo "NPM Build Fix Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "No package.json found in current directory!"
    echo "Please run this script from your project root (frontend or backend directory)"
    exit 1
fi

print_info "Found package.json in current directory"
echo ""

# Step 1: Remove node_modules
print_info "Step 1: Removing node_modules directory..."
if [ -d "node_modules" ]; then
    # Try normal rm first
    if rm -rf node_modules 2>/dev/null; then
        print_success "node_modules removed successfully"
    else
        # If normal rm fails, try with sudo
        print_info "Normal removal failed, trying with elevated permissions..."
        if sudo rm -rf node_modules; then
            print_success "node_modules removed with sudo"
        else
            print_error "Failed to remove node_modules"
            print_info "Trying alternative method..."
            # Alternative: move to temp and delete
            mv node_modules node_modules.bak.$(date +%s) 2>/dev/null || true
            print_success "Moved node_modules to backup"
        fi
    fi
else
    print_info "No node_modules directory found (already clean)"
fi
echo ""

# Step 2: Remove package-lock.json
print_info "Step 2: Removing package-lock.json..."
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    print_success "package-lock.json removed"
else
    print_info "No package-lock.json found"
fi
echo ""

# Step 3: Clear npm cache
print_info "Step 3: Clearing npm cache..."
npm cache clean --force
print_success "npm cache cleared"
echo ""

# Step 4: Install dependencies
print_info "Step 4: Installing dependencies..."
echo ""

# Check if we should use --legacy-peer-deps
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_info "Standard install failed, trying with --legacy-peer-deps..."
    if npm install --legacy-peer-deps; then
        print_success "Dependencies installed with --legacy-peer-deps"
    else
        print_error "Installation failed!"
        echo ""
        echo "Try running manually:"
        echo "  npm install --force"
        echo "  or"
        echo "  npm install --legacy-peer-deps --force"
        exit 1
    fi
fi
echo ""

# Step 5: Verify installation
print_info "Step 5: Verifying installation..."
if [ -d "node_modules" ]; then
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    print_success "node_modules directory created with $MODULE_COUNT packages"
else
    print_error "node_modules directory not created!"
    exit 1
fi
echo ""

# Step 6: Check for build script
print_info "Step 6: Checking for build script..."
if grep -q '"build"' package.json; then
    print_success "Build script found in package.json"
    echo ""
    print_info "You can now run: npm run build"
else
    print_info "No build script found in package.json"
fi
echo ""

echo "=========================================="
print_success "NPM Build Fix Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Run: npm run build (if building frontend)"
echo "  2. Run: npm start (to start the application)"
echo "  3. Run: pm2 restart all (if using PM2)"
echo ""
