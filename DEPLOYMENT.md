# 🚀 Doctor360 Production Deployment Guide

Complete guide to deploy Doctor360 Healthcare Platform using **FREE tier services**.

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Supabase account (free)
- Upstash account (free)
- Cloudinary account (free)

## 🎯 Architecture Overview

```
┌─────────────────┐
│   Vercel        │  Frontend + API (Free)
│   Next.js 16    │
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬──────────┐
    │          │          │          │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐  ┌───▼────┐
│Supabase│  │Upstash│  │Cloudinary│ │Vercel  │
│PostgreSQL│ │Redis  │  │Storage  │ │Analytics│
│(Free)   │ │(Free) │  │(Free)   │ │(Free)  │
└─────────┘ └────────┘  └─────────┘ └─────────┘
```

## 🔧 Step-by-Step Deployment

### Step 1: Set Up Supabase (PostgreSQL Database)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free account
   - Create a new project

2. **Get Database Credentials**
   - Go to Project Settings → Database
   - Copy the following:
     - Connection string (pooling) for `DATABASE_URL`
     - Connection string (direct) for `DIRECT_DATABASE_URL`
     - Project URL for `NEXT_PUBLIC_SUPABASE_URL`
     - Anon key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Service role key for `SUPABASE_SERVICE_ROLE_KEY`

3. **Database URLs Format**
   ```env
   # Connection pooling (for serverless/Vercel)
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   
   # Direct connection (for migrations)
   DIRECT_DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```

### Step 2: Set Up Upstash (Redis)

1. **Create Upstash Account**
   - Go to [upstash.com](https://upstash.com)
   - Sign up for free
   - Create a new Redis database

2. **Get Redis Credentials**
   - Go to your Redis database
   - Copy:
     - UPSTASH_REDIS_REST_URL
     - UPSTASH_REDIS_REST_TOKEN

3. **Free Tier Limits**
   - 10,000 requests/day
   - 256MB storage
   - Perfect for session management

### Step 3: Set Up Cloudinary (Image Storage)

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free
   - Note your cloud name from dashboard

2. **Get Credentials**
   - Go to Dashboard
   - Copy:
     - Cloud name: `CLOUDINARY_CLOUD_NAME`
     - API Key: `CLOUDINARY_API_KEY`
     - API Secret: `CLOUDINARY_API_SECRET`

3. **Create Upload Preset (Optional)**
   - Go to Settings → Upload
   - Add upload preset: `doctor360_uploads`
   - Set signing mode: "Signed"

4. **Free Tier Limits**
   - 25GB storage
   - 25GB monthly bandwidth
   - 300,000 transformations

### Step 4: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   cd /home/shotah/Downloads/Doctor360Web/1.0
   git init
   git add .
   git commit -m "Prepare for production deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/doctor360.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Select the `1.0` folder as root directory

3. **Configure Environment Variables**
   - In Vercel project settings, add all environment variables from `.env.example`:
   
   ```env
   # Database
   DATABASE_URL=your_supabase_pooled_url
   DIRECT_DATABASE_URL=your_supabase_direct_url
   
   # Redis
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Auth
   SESSION_SECRET=generate_random_32_char_string
   NEXTAUTH_SECRET=generate_random_32_char_string
   NEXTAUTH_URL=https://your-app.vercel.app
   
   # App
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_APP_NAME=Doctor360
   ```

4. **Generate Secrets**
   ```bash
   # Generate SESSION_SECRET
   openssl rand -base64 32
   
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Step 5: Run Database Migrations

After first deployment, run Prisma migrations:

1. **Option A: Using Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Link project
   vercel link
   
   # Pull environment variables
   vercel env pull .env.local
   
   # Run migrations
   bunx prisma migrate deploy
   bunx prisma generate
   ```

2. **Option B: Using Supabase SQL Editor**
   - Go to Supabase SQL Editor
   - Run the generated SQL from `prisma/migrations`

3. **Option C: Local Migration then Push**
   ```bash
   # Set production database URL
   export DATABASE_URL="your_production_database_url"
   
   # Push schema
   bunx prisma db push
   
   # Generate client
   bunx prisma generate
   ```

### Step 6: Seed Initial Data (Optional)

```bash
# Run seed script
bun run db:seed
```

## 🔐 Security Checklist

- [x] Environment variables set in Vercel
- [x] HTTPS enabled (automatic with Vercel)
- [x] Security headers configured (in `vercel.json`)
- [x] Rate limiting enabled (in `middleware.ts`)
- [x] CSP headers configured
- [x] Session management with Redis
- [x] Password hashing with bcrypt
- [x] SQL injection protection (Prisma)
- [x] XSS protection headers

## 📊 Monitoring & Analytics

### Vercel Analytics (Free)
- Go to your Vercel project
- Enable Analytics tab
- View performance metrics

### Health Check Endpoint
- Access: `https://your-app.vercel.app/api/health`
- Returns: status, timestamp, environment

### Error Tracking (Optional - Sentry)
1. Create Sentry account
2. Add `NEXT_PUBLIC_SENTRY_DSN` to environment
3. Install Sentry SDK

## 🔄 CI/CD Pipeline

Automatic deployments are enabled:
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from pull requests

## 💰 Free Tier Limits Summary

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | ✅ Free | 100GB bandwidth, 100 builds/day |
| **Supabase** | ✅ Free | 500MB database, 1GB storage |
| **Upstash** | ✅ Free | 10,000 requests/day, 256MB |
| **Cloudinary** | ✅ Free | 25GB storage, 25GB bandwidth |
| **Total Cost** | **$0/month** | Perfect for MVP/Testing |

## 🚨 Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
bun install

# Rebuild
bun run build
```

### Database Connection Issues
- Verify DATABASE_URL format
- Check if IP is whitelisted (Supabase allows all by default)
- Ensure connection pooling is enabled

### Redis Connection Issues
- Verify UPSTASH_REDIS_REST_URL format
- Check token is correct
- Ensure Redis instance is active

### Image Upload Issues
- Verify Cloudinary credentials
- Check file size (max 5MB)
- Ensure proper CORS settings

## 📈 Scaling Beyond Free Tier

When you need to scale:

1. **Vercel Pro** ($20/month)
   - Unlimited bandwidth
   - Team features
   - Advanced analytics

2. **Supabase Pro** ($25/month)
   - 8GB database
   - 100GB storage
   - Daily backups

3. **Upstash Pay-as-you-go**
   - $0.20 per 100K requests
   - Unlimited databases

## 🎉 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Run database migrations
3. ✅ Test all features
4. ✅ Set up custom domain (optional)
5. ✅ Configure backups
6. ✅ Monitor performance
7. ✅ Gather user feedback

## 📞 Support

- **Documentation**: Check README.md
- **Issues**: Create GitHub issue
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/docs](https://supabase.com/docs)

---

**Happy Deploying! 🚀**

Your Doctor360 platform is now live and ready to serve patients and doctors!
