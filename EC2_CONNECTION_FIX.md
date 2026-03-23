# Fix: "Failed to connect to your instance" Error

## Error Message
```
Failed to connect to your instance
Error establishing SSH connection to your instance. Try again later.
```

## Root Cause
This error occurs when AWS cannot establish an SSH connection to your EC2 instance, typically due to:
1. **Security Group misconfiguration** (90% of cases)
2. **Instance not fully initialized**
3. **Network configuration issues**
4. **SSH service not running on instance**

## 🚨 IMMEDIATE FIX - Security Group Configuration

### Step 1: Fix Security Group (Most Common Solution)

1. **Go to AWS Console** → **EC2 Dashboard**
2. **Click on "Instances"** in left sidebar
3. **Select your instance** (checkbox)
4. **Click "Security" tab** (bottom panel)
5. **Click on the Security Group name** (looks like "sg-xxxxx")
6. **Click "Edit inbound rules"** button
7. **Verify or Add SSH Rule:**

   Click **"Add rule"** and configure:
   ```
   Type: SSH
   Protocol: TCP
   Port Range: 22
   Source: My IP (recommended) OR 0.0.0.0/0 (for testing)
   Description: SSH access
   ```

8. **Click "Save rules"**
9. **Wait 10 seconds** and try connecting again

### Step 2: Verify Instance is Running

1. EC2 Dashboard → Instances
2. Check **Instance State**: Must be "Running" (green dot)
3. Check **Status Checks**: Should show "2/2 checks passed"
   - If showing "Initializing", wait 2-3 minutes
   - If showing "0/2" or "1/2", there's a problem with the instance

### Step 3: Check Instance Has Public IP

1. Select your instance
2. Look at **Details** tab (bottom panel)
3. Find **Public IPv4 address**
   - If it says "—" or is empty, you need to assign an Elastic IP

**To Assign Elastic IP:**
```
1. EC2 Dashboard → Elastic IPs (left sidebar)
2. Click "Allocate Elastic IP address"
3. Click "Allocate"
4. Select the new IP → Actions → Associate Elastic IP address
5. Select your instance → Click "Associate"
```

## 🔧 Alternative Connection Methods

### Method 1: EC2 Instance Connect (Browser-Based)

This bypasses SSH and works even if security groups are misconfigured:

1. **EC2 Dashboard** → **Instances**
2. **Select your instance** (checkbox)
3. **Click "Connect" button** (top right, orange button)
4. **Select "EC2 Instance Connect" tab**
5. **Username**: `ubuntu` (for Ubuntu) or `ec2-user` (for Amazon Linux)
6. **Click "Connect"**

This opens a browser-based terminal. If this works, your instance is fine but SSH is blocked.

### Method 2: Session Manager (No SSH Required)

If EC2 Instance Connect doesn't work:

1. **EC2 Dashboard** → **Instances**
2. **Select instance** → **Click "Connect"**
3. **Select "Session Manager" tab**
4. **Click "Connect"**

**Note**: Requires SSM agent and IAM role. If not configured, you'll see an error.

## 🔍 Diagnostic Steps

### Check Your Current IP Address

Your IP may have changed:

```bash
# On your Mac, run:
curl ifconfig.me
```

Or visit: https://checkip.amazonaws.com/

Then update the security group with your new IP.

### Verify SSH Key Permissions

```bash
# Check your key file permissions
ls -l ~/Downloads/*.pem

# Fix permissions if needed
chmod 400 ~/Downloads/your-key-pair.pem
```

### Test Connection with Verbose Output

```bash
# Replace with your actual key and IP
ssh -vvv -i ~/Downloads/your-key.pem ubuntu@YOUR-EC2-PUBLIC-IP
```

Look for these messages:
- `"Connection timed out"` → Security group issue
- `"Permission denied"` → Wrong key or username
- `"Connection refused"` → SSH service not running
- `"No route to host"` → Network/VPC issue

## 📋 Complete Checklist

Work through this checklist in order:

- [ ] **Instance is Running** (green "Running" state)
- [ ] **Status checks passed** (2/2 checks)
- [ ] **Instance has Public IP** (visible in Details tab)
- [ ] **Security Group allows SSH** (port 22 from your IP)
- [ ] **Your IP hasn't changed** (check with `curl ifconfig.me`)
- [ ] **Key file has correct permissions** (`chmod 400`)
- [ ] **Using correct username** (`ubuntu` for Ubuntu, `ec2-user` for Amazon Linux)
- [ ] **Using correct key file** (the one you selected when creating instance)

## 🎯 Quick Solutions by Scenario

### Scenario 1: Brand New Instance (Just Launched)
**Solution**: Wait 2-3 minutes for initialization to complete
```bash
# Check status every 30 seconds
watch -n 30 'aws ec2 describe-instance-status --instance-ids i-xxxxx'
```

### Scenario 2: Instance Was Working Before
**Solution**: Your IP address probably changed
1. Check current IP: `curl ifconfig.me`
2. Update security group with new IP

### Scenario 3: Using Corporate/Public WiFi
**Solution**: Network may block SSH (port 22)
- Try from different network (mobile hotspot)
- Use EC2 Instance Connect (browser-based)
- Use Session Manager

### Scenario 4: Instance Stopped and Restarted
**Solution**: Public IP changed (unless using Elastic IP)
1. Check new Public IP in EC2 console
2. Use new IP to connect
3. Consider allocating Elastic IP to prevent this

## 🛠️ Fix Security Group via AWS CLI

If you prefer command line:

```bash
# Get your current IP
MY_IP=$(curl -s ifconfig.me)

# Get your security group ID
SG_ID="sg-xxxxx"  # Replace with your security group ID

# Add SSH rule
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr $MY_IP/32
```

## 🔐 Security Best Practices

### Recommended Security Group Configuration

```
Inbound Rules:
┌──────────┬──────────┬──────────┬─────────────────┬──────────────────┐
│ Type     │ Protocol │ Port     │ Source          │ Description      │
├──────────┼──────────┼──────────┼─────────────────┼──────────────────┤
│ SSH      │ TCP      │ 22       │ Your IP/32      │ SSH access       │
│ HTTP     │ TCP      │ 80       │ 0.0.0.0/0       │ Web traffic      │
│ HTTPS    │ TCP      │ 443      │ 0.0.0.0/0       │ Secure web       │
│ Custom   │ TCP      │ 3000     │ 0.0.0.0/0       │ Frontend (dev)   │
│ Custom   │ TCP      │ 3001     │ 0.0.0.0/0       │ Backend API      │
└──────────┴──────────┴──────────┴─────────────────┴──────────────────┘
```

**Important**: 
- SSH (22): Restrict to your IP only
- HTTP/HTTPS (80/443): Open to all for public access
- App ports (3000/3001): Open for testing, close in production (use Nginx)

## 🚀 Once Connected Successfully

After you successfully connect, run these commands:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Check system status
df -h          # Disk space
free -h        # Memory
uptime         # System uptime

# Deploy application
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/deploy-ec2.sh
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

## 📞 Still Having Issues?

### Option 1: Use AWS CloudShell
1. AWS Console → Click CloudShell icon (>_) in top bar
2. Test connectivity:
```bash
# Test if port 22 is reachable
nc -zv YOUR-EC2-PUBLIC-IP 22

# If this times out, it's definitely a security group issue
```

### Option 2: Check Instance System Log
1. EC2 Dashboard → Select instance
2. Actions → Monitor and troubleshoot → Get system log
3. Look for SSH service startup messages

### Option 3: Reboot Instance
1. EC2 Dashboard → Select instance
2. Instance state → Reboot instance
3. Wait 2-3 minutes
4. Try connecting again

### Option 4: Create New Instance
If nothing works, the instance may be corrupted:
1. Create AMI from current instance (backup)
2. Launch new instance from AMI
3. Ensure security group is configured correctly from start

## 📚 Related Documentation

- [EC2 Quick Start Guide](EC2_QUICK_START.md)
- [Full AWS Deployment Guide](AWS_EC2_DEPLOYMENT.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

## 🎓 Understanding the Error

The error "Error establishing SSH connection" means:
- AWS can see your instance
- AWS is trying to connect via SSH
- The connection is being blocked or timing out

**It does NOT mean:**
- Your instance is broken
- You need to recreate everything
- The deployment failed

**It usually means:**
- Security group needs SSH rule (port 22)
- Your IP address changed
- Instance is still initializing

## ✅ Success Indicators

You've fixed the issue when:
1. You can connect via EC2 Instance Connect (browser)
2. SSH command connects without timeout
3. You see the Ubuntu/Amazon Linux welcome message
4. You get a command prompt on the instance

---

**Start Here**: Go to AWS Console → EC2 → Security Groups → Edit inbound rules → Add SSH rule → Save

This fixes 90% of connection issues immediately.
