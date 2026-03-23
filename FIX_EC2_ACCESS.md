# Fix EC2 Access Issue - Security Group Configuration

## Problem
The servers are running on EC2 but you cannot access them from your browser because the EC2 security group is blocking inbound traffic on ports 3000 and 3001.

## Solution: Update EC2 Security Group

### Step 1: Go to AWS Console
1. Open https://console.aws.amazon.com/ec2/
2. Sign in to your AWS account

### Step 2: Find Your EC2 Instance
1. Click on **"Instances"** in the left sidebar
2. Find your instance with IP **3.26.91.105**
3. Click on the instance ID

### Step 3: Update Security Group
1. Scroll down to the **"Security"** tab
2. Click on the **Security Group** link (e.g., "sg-xxxxxxxxx")
3. Click on **"Edit inbound rules"** button

### Step 4: Add Rules for Ports 3000 and 3001

Click **"Add rule"** and add these two rules:

#### Rule 1: Frontend (Port 3000)
- **Type**: Custom TCP
- **Protocol**: TCP
- **Port range**: 3000
- **Source**: Anywhere-IPv4 (0.0.0.0/0)
- **Description**: React Frontend

#### Rule 2: Backend (Port 3001)
- **Type**: Custom TCP
- **Protocol**: TCP
- **Port range**: 3001
- **Source**: Anywhere-IPv4 (0.0.0.0/0)
- **Description**: Node.js Backend API

### Step 5: Save Rules
1. Click **"Save rules"** button
2. Wait a few seconds for the changes to apply

### Step 6: Test Access
Open your browser and go to:
- Frontend: http://3.26.91.105:3000
- Backend API: http://3.26.91.105:3001/api/products

## Alternative: Use AWS CLI

If you have AWS CLI configured, run these commands:

```bash
# Get your security group ID
SECURITY_GROUP_ID=$(aws ec2 describe-instances \
  --filters "Name=ip-address,Values=3.26.91.105" \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text)

# Add port 3000 rule
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0

# Add port 3001 rule
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 3001 \
  --cidr 0.0.0.0/0
```

## Verify Servers Are Running

Before updating security group, verify servers are actually running:

```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "ps aux | grep node | grep -v grep && ss -tlnp | grep -E ':(3000|3001)'"
```

You should see:
- Node processes running
- Ports 3000 and 3001 in LISTEN state

## Current Security Group Rules Should Include

After adding the rules, your security group should have at least:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | 0.0.0.0/0 | SSH access |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | React Frontend |
| Custom TCP | TCP | 3001 | 0.0.0.0/0 | Node.js Backend |

## Troubleshooting

### If still cannot access after adding rules:

1. **Check if servers are running:**
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "ps aux | grep node | grep -v grep"
```

2. **Check if ports are listening:**
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "ss -tlnp | grep -E ':(3000|3001)'"
```

3. **Test from EC2 instance itself:**
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "curl -I http://localhost:3000"
```

4. **Check firewall on EC2:**
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "sudo ufw status"
```

If UFW is active, allow the ports:
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "sudo ufw allow 3000 && sudo ufw allow 3001"
```

5. **Restart servers:**
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "killall node; cd ~/coorg-spices/backend && nohup npm start > backend.log 2>&1 & cd ~/coorg-spices/frontend && nohup npm start > frontend.log 2>&1 &"
```

## Production Recommendation

For production, consider:
1. Using a reverse proxy (nginx) on port 80/443
2. Setting up SSL/TLS certificates
3. Restricting backend API access to only frontend server
4. Using environment-specific security groups
