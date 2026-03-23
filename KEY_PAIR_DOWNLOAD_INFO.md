# ⚠️ IMPORTANT: You Cannot Download EC2 Key Pairs from AWS Console

## The Problem

**AWS does NOT allow you to download key pairs after they are created.** The private key file (`.pem`) is only available **once** - when you first create the key pair during EC2 instance launch.

## Your Options

### Option 1: Use EC2 Instance Connect (RECOMMENDED - No Key Needed!)

This is the **easiest solution** and doesn't require the key file:

1. **Go to AWS Console**: https://ap-southeast-2.console.aws.amazon.com/ec2/
2. **Click "Instances"** in the left sidebar
3. **Select your instance**: CoorgMasala (i-0bd02c0c2253f93d3)
4. **Click "Connect"** button (top right, orange button)
5. **Select "EC2 Instance Connect" tab**
6. **Username**: `ubuntu`
7. **Click "Connect"**

✅ This opens a browser-based terminal - **no SSH key required!**

Once connected, you can deploy your application normally.

### Option 2: Create a New Key Pair and Attach It

If you need SSH access from your local machine:

#### Step 1: Connect via EC2 Instance Connect (Option 1 above)

#### Step 2: Create a new SSH key pair on your local machine

On your Mac:
```bash
# Generate new SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/coorg-new-key

# This creates:
# - ~/.ssh/coorg-new-key (private key)
# - ~/.ssh/coorg-new-key.pub (public key)
```

#### Step 3: Add your public key to EC2 instance

In the EC2 Instance Connect terminal (browser):
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key to authorized_keys
nano ~/.ssh/authorized_keys
```

Then:
1. On your Mac, run: `cat ~/.ssh/coorg-new-key.pub`
2. Copy the output (starts with `ssh-rsa`)
3. Paste it into the nano editor in EC2 Instance Connect
4. Press `Ctrl+X`, then `Y`, then `Enter` to save

#### Step 4: Set correct permissions

In EC2 Instance Connect terminal:
```bash
chmod 600 ~/.ssh/authorized_keys
```

#### Step 5: Connect from your Mac

```bash
ssh -i ~/.ssh/coorg-new-key ubuntu@3.26.91.105
```

### Option 3: Use AWS Systems Manager Session Manager

If available (requires IAM role configuration):

1. **AWS Console** → **EC2** → **Instances**
2. **Select instance** → **Click "Connect"**
3. **Select "Session Manager" tab**
4. **Click "Connect"**

### Option 4: Create New EC2 Instance with New Key Pair

**⚠️ Last Resort Only** - This requires recreating your instance:

1. **Create AMI from existing instance** (backup):
   - EC2 Console → Select instance
   - Actions → Image and templates → Create image
   - Name: `coorg-backup-[date]`
   - Click "Create image"

2. **Create new key pair**:
   - EC2 Console → Key Pairs (left sidebar)
   - Click "Create key pair"
   - Name: `coorgmasala-new`
   - Type: RSA
   - Format: `.pem`
   - Click "Create key pair"
   - **Save the downloaded file immediately!**

3. **Launch new instance from AMI**:
   - EC2 Console → AMIs (left sidebar)
   - Select your backup AMI
   - Click "Launch instance from AMI"
   - Select the new key pair
   - Use same security group settings
   - Launch instance

4. **Update Elastic IP** (if using):
   - Disassociate from old instance
   - Associate with new instance

## 🎯 Recommended Solution

**Use EC2 Instance Connect (Option 1)** - It's:
- ✅ Immediate - works right now
- ✅ No key file needed
- ✅ No configuration required
- ✅ Secure - uses AWS IAM authentication
- ✅ Browser-based - works from anywhere

## 📋 Step-by-Step: EC2 Instance Connect

### Visual Guide

```
AWS Console
    ↓
EC2 Dashboard
    ↓
Instances (left sidebar)
    ↓
Select: CoorgMasala ☑️
    ↓
Click: [Connect] button (top right)
    ↓
Tab: "EC2 Instance Connect"
    ↓
Username: ubuntu
    ↓
Click: [Connect] button
    ↓
✅ Browser terminal opens!
```

### What You'll See

After clicking Connect, a new browser tab opens with a terminal that looks like:
```
ubuntu@ip-172-31-xx-xx:~$
```

You're now connected to your EC2 instance!

### Deploy Your Application

Once connected via EC2 Instance Connect, run:

```bash
# Download deployment script
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/deploy-ec2.sh

# Make it executable
chmod +x deploy-ec2.sh

# Run deployment
./deploy-ec2.sh
```

## 🔍 Check If You Already Have the Key

Before trying other options, verify if you have the key:

```bash
# On your Mac, check Downloads folder
ls -la ~/Downloads/*.pem

# Check if coorgmasala.pem exists
ls -la ~/Downloads/coorgmasala.pem
```

If you see `coorgmasala.pem`, you already have it! Just fix permissions:
```bash
chmod 400 ~/Downloads/coorgmasala.pem
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105
```

## 📚 Understanding AWS Key Pairs

### When Keys Are Available

- ✅ **During instance creation**: Key is downloaded once
- ❌ **After instance creation**: Cannot download again
- ❌ **From AWS Console**: No download option exists
- ❌ **From AWS Support**: They cannot retrieve it

### Why AWS Does This

Security: If AWS stored private keys, they could be compromised. Only you should have the private key.

### What AWS Stores

AWS only stores the **public key** (safe to share). The **private key** (secret) is only on your computer.

## 🆘 If You're Stuck

### Quick Decision Tree

```
Do you have coorgmasala.pem file?
├─ YES → Fix permissions: chmod 400 ~/Downloads/coorgmasala.pem
│         Then connect: ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105
│
└─ NO → Use EC2 Instance Connect (browser-based)
         1. AWS Console → EC2 → Instances
         2. Select CoorgMasala
         3. Click Connect → EC2 Instance Connect
         4. Username: ubuntu
         5. Click Connect
```

## 🎓 Prevention for Future

When creating EC2 instances:

1. **Download key immediately** when prompted
2. **Save to secure location**: `~/.ssh/` folder
3. **Backup the key file** to secure storage
4. **Set correct permissions**: `chmod 400 keyfile.pem`
5. **Document key name** in your notes

## ✅ Summary

**You CANNOT download the key pair from AWS Console.**

**Best Solution**: Use EC2 Instance Connect (browser-based terminal)
- No key file needed
- Works immediately
- Fully functional terminal
- Can deploy your application

**Alternative**: Create new key pair and add it to the instance (requires EC2 Instance Connect first)

---

**Next Step**: Use EC2 Instance Connect to access your instance and deploy the application. See [`CONNECT_TO_EC2.md`](CONNECT_TO_EC2.md) for full deployment instructions.
