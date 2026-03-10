# 🚀 Doctor360 Deployment - Quick Setup

## Current Status: Ready for Deployment! ✅

Your environment is configured with secure secrets. Now you need to set up the FREE services.

## 📋 Required Services (All FREE)

### 1. Supabase (PostgreSQL Database) - 2 minutes
**Why**: Production database (replaces SQLite)

**Setup**:
1. Go to: https://supabase.com
2. Click "Start your project" → Sign up/Login
3. Create new project:
   - Name: `doctor360`
   - Database password: (save this!)
   - Region: Choose closest to you
4. Wait ~2 minutes for project to be ready
5. Go to: Settings → Database
6. Copy these values:
   - **Connection string (pooling)** → `DATABASE_URL`
   - **Connection string (direct)** → `DIRECT_DATABASE_URL`

**Format**:
```
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### 2. Upstash (Redis) - 1 minute
**Why**: Session management (persists logins)

**Setup**:
1. Go to: https://upstash.com
2. Sign up/Login
3. Create Redis database:
   - Name: `doctor360-sessions`
   - Region: Same as Supabase
4. Copy:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

### 3. Cloudinary (Image Storage) - 1 minute
**Why**: Store doctor/patient photos

**Setup**:
1. Go to: https://cloudinary.com
2. Sign up/Login
3. Go to Dashboard
4. Copy:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

### 4. Vercel (Hosting) - 1 minute
**Why**: Deploy your app

**Setup**:
1. Go to: https://vercel.com
2. Sign up with GitHub
3. That's it! We'll deploy from there.

## 🎯 Two Options

### Option A: Deploy NOW with Placeholder Values (Testing)
**Good for**: Quick test, will fail in production
**Time**: 5 minutes

```bash
# Use development mode (no external services)
# Edit .env.local and comment out the service URLs
# Deploy to Vercel
```

### Option B: Set Up Services First (Recommended)
**Good for**: Real production deployment
**Time**: 10 minutes

1. Create the 3 free accounts above
2. Copy credentials to `.env.local`
3. Deploy to Vercel

## 📝 Update Your .env.local

After creating the services, update these lines in `.env.local`:

```env
# Supabase (from step 1)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Upstash (from step 2)
UPSTASH_REDIS_REST_URL="https://[ENDPOINT].upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Cloudinary (from step 3)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## 🚀 Deploy Commands

Once you have the credentials:

```bash
# 1. Validate configuration
./validate.sh

# 2. Initialize git (if not done)
git init
git add .
git commit -m "Production ready"

# 3. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/doctor360.git
git push -u origin main

# 4. Deploy on Vercel
# - Go to vercel.com
# - Import your GitHub repo
# - Add environment variables
# - Deploy!
```

## ⚡ Quick Deploy (Option A - Testing)

If you want to deploy NOW without setting up services:

```bash
# Use local SQLite for testing
# Edit .env.local:
DATABASE_URL="file:./dev.db"
# Comment out Redis and Cloudinary

# Then deploy
```

**Note**: This will work for testing but won't persist data in production.

---

**What would you like to do?**
1. Set up the free services (recommended)
2. Deploy with placeholders for testing
3. Deploy locally first

Let me know and I'll guide you through!
