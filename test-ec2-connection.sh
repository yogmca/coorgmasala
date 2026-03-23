#!/bin/bash

# EC2 Connection Diagnostic Script
# This script tests connectivity to your EC2 instance and provides solutions

echo "=========================================="
echo "EC2 Connection Diagnostic Tool"
echo "=========================================="
echo ""

# EC2 Instance Details
EC2_IP="3.26.91.105"
INSTANCE_ID="i-0bd02c0c2253f93d3"
INSTANCE_NAME="CoorgMasala"

echo "Instance Details:"
echo "  Name: $INSTANCE_NAME"
echo "  Instance ID: $INSTANCE_ID"
echo "  Public IP: $EC2_IP"
echo ""

# Step 1: Check your current IP
echo "Step 1: Checking your current IP address..."
YOUR_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s checkip.amazonaws.com 2>/dev/null || echo "Unable to detect")
echo "  Your IP: $YOUR_IP"
echo ""

# Step 2: Test basic connectivity
echo "Step 2: Testing basic connectivity to EC2 instance..."
if ping -c 3 -W 2 $EC2_IP >/dev/null 2>&1; then
    echo "  ✅ Instance is reachable (ping successful)"
else
    echo "  ⚠️  Instance not responding to ping (this is normal if ICMP is blocked)"
fi
echo ""

# Step 3: Test SSH port
echo "Step 3: Testing SSH port (22)..."
if nc -z -w 5 $EC2_IP 22 2>/dev/null; then
    echo "  ✅ SSH port 22 is OPEN and accessible"
    echo "  → Security group is configured correctly for SSH"
    echo ""
    echo "Next step: Try connecting with your SSH key"
else
    echo "  ❌ SSH port 22 is CLOSED or BLOCKED"
    echo "  → This is why you cannot connect!"
    echo ""
    echo "🔧 SOLUTION: Fix Security Group"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Go to AWS Console: https://console.aws.amazon.com/ec2/"
    echo "2. Click 'Instances' → Select 'CoorgMasala'"
    echo "3. Click 'Security' tab → Click on Security Group name"
    echo "4. Click 'Edit inbound rules'"
    echo "5. Click 'Add rule' and configure:"
    echo "   - Type: SSH"
    echo "   - Protocol: TCP"
    echo "   - Port: 22"
    echo "   - Source: My IP (or use: $YOUR_IP/32)"
    echo "6. Click 'Save rules'"
    echo "7. Wait 10 seconds and run this script again"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
echo ""

# Step 4: Test HTTP port
echo "Step 4: Testing HTTP port (80)..."
if nc -z -w 5 $EC2_IP 80 2>/dev/null; then
    echo "  ✅ HTTP port 80 is open"
else
    echo "  ⚠️  HTTP port 80 is closed (add rule if you need web access)"
fi
echo ""

# Step 5: Check for SSH key
echo "Step 5: Checking for SSH key files..."
KEY_FOUND=0
if [ -d "$HOME/Downloads" ]; then
    KEYS=$(find "$HOME/Downloads" -name "*.pem" 2>/dev/null)
    if [ ! -z "$KEYS" ]; then
        echo "  Found SSH key(s) in Downloads:"
        for key in $KEYS; do
            echo "    - $(basename $key)"
            # Check permissions
            PERMS=$(stat -f "%Lp" "$key" 2>/dev/null || stat -c "%a" "$key" 2>/dev/null)
            if [ "$PERMS" = "400" ] || [ "$PERMS" = "600" ]; then
                echo "      ✅ Permissions: $PERMS (correct)"
            else
                echo "      ⚠️  Permissions: $PERMS (should be 400)"
                echo "      Fix with: chmod 400 $key"
            fi
        done
        KEY_FOUND=1
    fi
fi

if [ $KEY_FOUND -eq 0 ]; then
    echo "  ⚠️  No .pem files found in ~/Downloads"
    echo "  → Make sure you have downloaded your EC2 key pair"
fi
echo ""

# Step 6: Provide connection command
echo "Step 6: Connection Instructions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Once SSH port is open, connect using:"
echo ""
echo "  ssh -i ~/Downloads/YOUR-KEY.pem ubuntu@$EC2_IP"
echo ""
echo "Replace 'YOUR-KEY.pem' with your actual key file name."
echo ""
echo "If you don't know the key name, check AWS Console:"
echo "  EC2 → Instances → Select instance → Details tab → Key pair name"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 7: Alternative connection methods
echo "Step 7: Alternative Connection Methods"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If SSH still doesn't work, use EC2 Instance Connect:"
echo ""
echo "1. Go to: https://console.aws.amazon.com/ec2/"
echo "2. Select instance: CoorgMasala"
echo "3. Click 'Connect' button (top right)"
echo "4. Choose 'EC2 Instance Connect' tab"
echo "5. Username: ubuntu"
echo "6. Click 'Connect'"
echo ""
echo "This opens a browser-based terminal (no SSH key needed)."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo ""
echo "Instance: $INSTANCE_NAME ($EC2_IP)"
echo "Your IP: $YOUR_IP"
echo ""

# Check if nc command exists
if ! command -v nc &> /dev/null; then
    echo "⚠️  Note: 'nc' (netcat) command not found."
    echo "   Port tests were skipped. Install with: brew install netcat"
    echo ""
fi

echo "Next Steps:"
echo "1. Fix security group to allow SSH from your IP"
echo "2. Run this script again to verify"
echo "3. Connect using SSH or EC2 Instance Connect"
echo ""
echo "For detailed help, see: EC2_CONNECTION_FIX.md"
echo ""
