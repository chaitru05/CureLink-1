# CureLink — Complete AWS Deployment Guide (Free Tier)

> [!IMPORTANT]
> Follow these steps **in order**. Each step builds on the previous one. Keep a notepad open to save URLs/IPs as you go.

---

## Prerequisites

- AWS Account (free tier eligible): https://aws.amazon.com/free
- Your code changes are already done (previous step)
- Git installed on your PC

---

## STEP 1: IAM — Create a Secure Admin User

> Never use root account for daily work. Create an IAM user.

1. Go to **AWS Console** → Search **"IAM"** → Click **IAM**
2. Left sidebar → **Users** → **Create user**
3. Fill in:
   - User name: `curelink-admin`
   - ✅ Check **"Provide user access to the AWS Management Console"**
   - Select **"I want to create an IAM user"**
   - Custom password → set your password
   - ❌ Uncheck "Users must create a new password at next sign-in"
4. Click **Next** → **Attach policies directly**
5. Search and ✅ check these policies:
   - `AmazonEC2FullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `CloudWatchFullAccess`
6. Click **Next** → **Create user**
7. 📝 **Save the Console sign-in URL** (looks like `https://123456789012.signin.aws.amazon.com/console`)
8. **Sign out** of root → **Sign in** as `curelink-admin` using that URL

---

## STEP 2: MongoDB Atlas — Whitelist (Prepare for EC2)

> You're already using MongoDB Atlas. You just need to allow EC2 to connect.

1. Go to https://cloud.mongodb.com → Sign in
2. Click your **Cluster** → **Network Access** (left sidebar)
3. Click **Add IP Address**
4. For now, click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - You'll restrict this to your EC2 IP later
5. Click **Confirm**

> [!TIP]
> After getting your EC2 public IP (Step 3), come back and replace `0.0.0.0/0` with your EC2's specific IP for better security.

---

## STEP 3: EC2 — Launch Backend Server

### 3.1 — Create a Key Pair

1. AWS Console → Search **"EC2"** → Click **EC2**
2. Left sidebar → **Key Pairs** → **Create key pair**
3. Fill in:
   - Name: `curelink-key`
   - Type: **RSA**
   - Format: **.pem** (for Windows use `.ppk` if using PuTTY)
4. Click **Create key pair** → The `.pem` file downloads automatically
5. 📝 **Save this file safely** — you need it to SSH into EC2

### 3.2 — Create a Security Group

1. Left sidebar → **Security Groups** → **Create security group**
2. Fill in:
   - Name: `curelink-backend-sg`
   - Description: `CureLink backend security group`
   - VPC: leave default
3. **Inbound rules** → Add these rules:

| Type | Port Range | Source | Description |
|------|-----------|--------|-------------|
| SSH | 22 | My IP | SSH access |
| Custom TCP | 5000 | 0.0.0.0/0 | Backend API |
| HTTP | 80 | 0.0.0.0/0 | Health checks |

4. Click **Create security group**

### 3.3 — Launch EC2 Instance

1. Left sidebar → **Instances** → **Launch instances**
2. Fill in:
   - Name: `curelink-backend`
   - **AMI**: Amazon Linux 2023 (Free tier eligible) — it's the default
   - **Instance type**: `t2.micro` (Free tier eligible)
   - **Key pair**: Select `curelink-key`
   - **Security group**: Select existing → `curelink-backend-sg`
3. Click **Launch instance**
4. Wait 1-2 minutes → Click on the instance
5. 📝 **Copy the Public IPv4 address** (e.g., `3.110.45.123`)

### 3.4 — Connect to EC2 & Deploy Backend

1. Open **PowerShell** (on your PC)
2. Navigate to where your `.pem` file was downloaded:

```powershell
cd ~\Downloads
```

3. SSH into EC2:

```bash
ssh -i "curelink-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP
```

> If you get a permissions error on Windows, run:
> ```powershell
> icacls "curelink-key.pem" /inheritance:r /grant:r "$env:USERNAME:(R)"
> ```

4. **Install Node.js + PM2 on EC2** (run these one by one):

```bash
# Update system
sudo yum update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify
node -v
npm -v

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo yum install -y git
```

5. **Clone your repo and set up backend**:

```bash
# Clone
cd ~
git clone https://github.com/chaitru05/CureLink-1.git
cd CureLink-1/backend

# Install dependencies
npm install
```

6. **Create .env file on EC2** (DON'T push secrets to git):

```bash
nano .env
```

Paste this (replace with your real values):

```
PORT=5000
MONGO_URI=mongodb+srv://TEST:pass1@cluster0.1wzsqew.mongodb.net/
JWT_SECRET=5b87ea8f3eb22d4325d562a65b90d6a46e72321b472724c5bd4af00073cb8a4238704f0f4fe06b6de28db4bfb115b419f536aac5dbda51b4695c665f5b55d445
CLOUDFRONT_URL=https://FILL_LATER.cloudfront.net
S3_WEBSITE_URL=http://FILL_LATER.s3-website.ap-south-1.amazonaws.com
NODE_ENV=production
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

7. **Start the backend with PM2**:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

> Copy-paste the command PM2 prints after `pm2 startup` and run it. This makes PM2 auto-start on reboot.

8. **Test it**:

```bash
curl http://localhost:5000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

9. 📝 **Your backend is live at**: `http://YOUR_EC2_PUBLIC_IP:5000`

---

## STEP 4: S3 — Host Frontend

### 4.1 — Create S3 Bucket

1. AWS Console → Search **"S3"** → Click **S3**
2. Click **Create bucket**
3. Fill in:
   - Bucket name: `curelink-frontend` (must be globally unique — try `curelink-frontend-yourname`)
   - Region: **ap-south-1 (Mumbai)** — or your preferred region
   - ❌ **Uncheck** "Block all public access"
   - ✅ **Check** the acknowledgment checkbox
4. Click **Create bucket**

### 4.2 — Enable Static Website Hosting

1. Click your bucket → **Properties** tab
2. Scroll to **Static website hosting** → **Edit**
3. Select **Enable**
4. Index document: [index.html](file:///d:/Chaitrali/CureLink3/frontend/index.html)
5. Error document: [index.html](file:///d:/Chaitrali/CureLink3/frontend/index.html) (important for React SPA routing!)
6. Click **Save changes**
7. 📝 **Copy the Bucket website endpoint** (looks like `http://curelink-frontend.s3-website.ap-south-1.amazonaws.com`)

### 4.3 — Add Bucket Policy (Make Public)

1. Go to **Permissions** tab → **Bucket policy** → **Edit**
2. Paste this (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

3. Click **Save changes**

### 4.4 — Upload Frontend Files

On your PC, run this in PowerShell:

```powershell
# Install AWS CLI if not installed
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (ap-south-1), Output (json)
```

> [!NOTE]
> To get Access Keys: IAM → Users → `curelink-admin` → Security credentials → Create access key → Select "Command Line Interface (CLI)" → Create

Then upload:

```powershell
cd d:\Chaitrali\CureLink3\frontend

# Build first (you already did this, but rebuild if .env changed)
npm run build

# Upload to S3
aws s3 sync dist/ s3://YOUR_BUCKET_NAME/ --delete
```

4. Test: Open the S3 website endpoint URL in browser — should show your React app (login will fail until API Gateway is set up)

---

## STEP 5: API Gateway — HTTPS Proxy to EC2

> [!IMPORTANT]
> This gives your backend a proper HTTPS URL. Without this, cookie auth won't work because browsers block `secure` cookies over HTTP.

### 5.1 — Create HTTP API

1. AWS Console → Search **"API Gateway"** → Click **API Gateway**
2. Click **Create API**
3. Choose **HTTP API** → Click **Build**
4. API name: `curelink-api`
5. Click **Next** (skip integrations for now)
6. Click **Next** (skip routes for now)
7. Stage name: `prod` (or keep `$default`)
8. Click **Next** → **Create**

### 5.2 — Create Integration (Connect to EC2)

1. Click your API → Left sidebar → **Integrations** → **Create**
2. Choose **HTTP** integration
3. Fill in:
   - Integration target URL: `http://YOUR_EC2_PUBLIC_IP:5000/{proxy}`
   - Method: **ANY**
4. Click **Create**

> [!WARNING]
> Use your EC2 **Public IP**, not private IP, since API Gateway is outside your VPC.

### 5.3 — Create Route

1. Left sidebar → **Routes** → **Create**
2. Method: **ANY**
3. Path: `/{proxy+}` (this catches all paths)
4. Click **Create**
5. Click on the route → **Attach integration** → Select the HTTP integration you just created

### 5.4 — Also Create a Root Route

1. **Create** another route:
   - Method: **ANY**
   - Path: `/`
2. Attach the same integration

### 5.5 — Enable CORS in API Gateway

1. Left sidebar → **CORS** → **Configure**
2. Fill in:
   - Access-Control-Allow-Origin: `*` (or your specific CloudFront URL)
   - Access-Control-Allow-Methods: `GET, POST, PUT, DELETE, OPTIONS`
   - Access-Control-Allow-Headers: `Content-Type, Authorization`
   - Access-Control-Allow-Credentials: `true`
3. Click **Save**

### 5.6 — Deploy

1. Left sidebar → **Deploy** → Select stage → **Deploy**
2. 📝 **Copy the Invoke URL** (looks like `https://abc123def.execute-api.ap-south-1.amazonaws.com`)

### 5.7 — Test

```powershell
curl https://YOUR_API_GATEWAY_URL/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

## STEP 6: CloudFront — CDN for Frontend

### 6.1 — Create Distribution

1. AWS Console → Search **"CloudFront"** → Click **CloudFront**
2. Click **Create distribution**
3. **Origin domain**: Select your S3 bucket from the dropdown
   - ⚠️ Choose the **S3 website endpoint** format, NOT the bucket itself
   - If dropdown shows `curelink-frontend.s3.amazonaws.com`, manually change it to:
     `curelink-frontend.s3-website.ap-south-1.amazonaws.com`
4. **Origin protocol**: HTTP only
5. **Viewer protocol policy**: **Redirect HTTP to HTTPS**
6. **Allowed HTTP methods**: GET, HEAD
7. **Cache policy**: CachingOptimized (default)
8. Scroll down → **Default root object**: [index.html](file:///d:/Chaitrali/CureLink3/frontend/index.html)
9. Click **Create distribution**
10. Wait 5-10 minutes for deployment

### 6.2 — Handle SPA Routing (Custom Error Pages)

> React Router needs all paths to serve [index.html](file:///d:/Chaitrali/CureLink3/frontend/index.html).

1. Click your distribution → **Error pages** tab
2. Click **Create custom error response**
3. Fill in:
   - HTTP error code: `403`
   - Customize error response: **Yes**
   - Response page path: [/index.html](file:///d:/Chaitrali/CureLink3/frontend/index.html)
   - HTTP response code: `200`
4. Click **Create**
5. Create another one for error code `404` with the same settings

### 6.3 — Get Your CloudFront URL

📝 **Copy the Distribution domain name** (looks like `d1234abcdef.cloudfront.net`)

---

## STEP 7: CloudWatch — Monitoring

> Basic CloudWatch monitoring is already enabled by default on EC2!

### 7.1 — View EC2 Metrics

1. AWS Console → Search **"CloudWatch"** → Click **CloudWatch**
2. Left sidebar → **Metrics** → **All metrics**
3. Click **EC2** → **Per-Instance Metrics**
4. You'll see: CPU utilization, network in/out, disk reads/writes

### 7.2 — Create a CPU Alarm (Optional but Recommended)

1. Left sidebar → **Alarms** → **Create alarm**
2. **Select metric** → EC2 → Per-Instance Metrics
3. Choose `CPUUtilization` for your instance
4. Conditions:
   - Threshold type: Static
   - Greater than: `80` (percent)
   - Period: 5 minutes
5. **Notification**: Skip for now (or add email via SNS)
6. Alarm name: `curelink-high-cpu`
7. Click **Create alarm**

### 7.3 — View PM2 Logs on EC2

SSH into EC2 and run:

```bash
# View live backend logs
pm2 logs curelink-backend

# View last 100 lines
pm2 logs curelink-backend --lines 100
```

---

## STEP 8: Update All Environment Variables (FINAL STEP)

Now you have all the URLs. Time to connect everything.

### 8.1 — Update Backend [.env](file:///d:/Chaitrali/CureLink3/backend/.env) on EC2

```bash
# SSH into EC2
ssh -i "curelink-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP

cd ~/CureLink-1/backend
nano .env
```

Update these values:

```
CLOUDFRONT_URL=https://d1234abcdef.cloudfront.net
S3_WEBSITE_URL=http://curelink-frontend.s3-website.ap-south-1.amazonaws.com
```

Save → Restart backend:

```bash
pm2 restart curelink-backend
```

### 8.2 — Update Frontend [.env](file:///d:/Chaitrali/CureLink3/backend/.env) on Your PC

Edit [d:\Chaitrali\CureLink3\frontend\.env](file:///d:/Chaitrali/CureLink3/frontend/.env):

```
VITE_API_URL=https://abc123def.execute-api.ap-south-1.amazonaws.com
```

### 8.3 — Rebuild & Re-upload Frontend

```powershell
cd d:\Chaitrali\CureLink3\frontend
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET_NAME/ --delete
```

### 8.4 — Invalidate CloudFront Cache

```powershell
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

> Get Distribution ID from CloudFront → Your distribution → ID column

### 8.5 — Add CloudFront Domain to Firebase

1. Go to https://console.firebase.google.com
2. Your project → **Authentication** → **Settings** → **Authorized domains**
3. Click **Add domain** → Enter `d1234abcdef.cloudfront.net`

---

## ✅ Final Verification Checklist

| Test | How | Expected |
|------|-----|----------|
| Health check | `curl https://API_GATEWAY_URL/health` | `{"status":"ok"}` |
| Frontend loads | Open `https://d1234.cloudfront.net` | Login page appears |
| Patient login | Enter credentials on frontend | Redirects to dashboard |
| Book appointment | Login as patient → book | Success message |
| Admin dashboard | Login as admin | Stats + doctor list loads |
| CloudWatch | AWS Console → CloudWatch → Metrics | CPU + network data visible |

---

## 📝 Summary of Your URLs

Save these somewhere safe:

```
EC2 Public IP:       ___________________________
S3 Website URL:      http://__________.s3-website.ap-south-1.amazonaws.com
CloudFront URL:      https://__________.cloudfront.net
API Gateway URL:     https://__________.execute-api.ap-south-1.amazonaws.com
MongoDB Atlas:       mongodb+srv://... (already have this)
```

> [!CAUTION]
> **Free Tier Limits**: EC2 t2.micro = 750 hrs/month, S3 = 5GB, CloudFront = 1TB/month, API Gateway = 1M requests/month. Monitor usage in AWS Billing dashboard to avoid charges.
