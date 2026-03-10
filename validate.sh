#!/bin/bash

# Doctor360 Pre-Deployment Validation Script
# Checks all requirements before deploying to production

set -e

echo "🔍 Doctor360 Pre-Deployment Validation"
echo "======================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; ((ERRORS++)); }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; ((WARNINGS++)); }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check 1: Environment file
echo "1️⃣ Checking environment configuration..."
if [ -f ".env.local" ]; then
    print_success ".env.local exists"
    
    # Check required variables
    source .env.local 2>/dev/null || true
    
    [ -n "$DATABASE_URL" ] && print_success "DATABASE_URL is set" || print_error "DATABASE_URL is missing"
    [ -n "$DIRECT_DATABASE_URL" ] && print_success "DIRECT_DATABASE_URL is set" || print_error "DIRECT_DATABASE_URL is missing"
    [ -n "$UPSTASH_REDIS_REST_URL" ] && print_success "UPSTASH_REDIS_REST_URL is set" || print_error "UPSTASH_REDIS_REST_URL is missing"
    [ -n "$UPSTASH_REDIS_REST_TOKEN" ] && print_success "UPSTASH_REDIS_REST_TOKEN is set" || print_error "UPSTASH_REDIS_REST_TOKEN is missing"
    [ -n "$SESSION_SECRET" ] && print_success "SESSION_SECRET is set" || print_error "SESSION_SECRET is missing"
    [ -n "$NEXTAUTH_SECRET" ] && print_success "NEXTAUTH_SECRET is set" || print_error "NEXTAUTH_SECRET is missing"
    [ -n "$CLOUDINARY_CLOUD_NAME" ] && print_success "CLOUDINARY_CLOUD_NAME is set" || print_error "CLOUDINARY_CLOUD_NAME is missing"
    [ -n "$CLOUDINARY_API_KEY" ] && print_success "CLOUDINARY_API_KEY is set" || print_error "CLOUDINARY_API_KEY is missing"
    [ -n "$CLOUDINARY_API_SECRET" ] && print_success "CLOUDINARY_API_SECRET is set" || print_error "CLOUDINARY_API_SECRET is missing"
    
    # Check secret lengths
    if [ ${#SESSION_SECRET} -lt 32 ]; then
        print_warning "SESSION_SECRET should be at least 32 characters"
    fi
    if [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
        print_warning "NEXTAUTH_SECRET should be at least 32 characters"
    fi
else
    print_error ".env.local not found - copy from .env.example"
fi

echo ""

# Check 2: Dependencies
echo "2️⃣ Checking dependencies..."
if [ -d "node_modules" ]; then
    print_success "node_modules exists"
    
    # Check critical dependencies
    [ -d "node_modules/@prisma/client" ] && print_success "Prisma client installed" || print_error "Prisma client not installed"
    [ -d "node_modules/@upstash/redis" ] && print_success "Upstash Redis installed" || print_error "Upstash Redis not installed"
    [ -d "node_modules/cloudinary" ] && print_success "Cloudinary installed" || print_error "Cloudinary not installed"
    [ -d "node_modules/next" ] && print_success "Next.js installed" || print_error "Next.js not installed"
else
    print_error "node_modules not found - run: bun install"
fi

echo ""

# Check 3: Database
echo "3️⃣ Checking database..."
if command -v bunx &> /dev/null; then
    if [ -n "$DATABASE_URL" ]; then
        if bunx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
            print_success "Database connection successful"
        else
            print_warning "Cannot connect to database - check DATABASE_URL"
        fi
    else
        print_warning "DATABASE_URL not set - skipping database check"
    fi
else
    print_warning "bunx not found - skipping database check"
fi

echo ""

# Check 4: Build
echo "4️⃣ Checking build..."
if [ -d ".next" ]; then
    print_success ".next directory exists (previous build found)"
else
    print_warning "No build found - run: bun run build"
fi

echo ""

# Check 5: Git
echo "5️⃣ Checking Git..."
if [ -d ".git" ]; then
    print_success "Git repository initialized"
    
    if git remote | grep -q "origin"; then
        print_success "Git remote 'origin' configured"
    else
        print_warning "No git remote configured - add with: git remote add origin <url>"
    fi
    
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Uncommitted changes detected"
        git status --short
    else
        print_success "Working directory clean"
    fi
else
    print_warning "Git not initialized - run: git init"
fi

echo ""

# Check 6: Security
echo "6️⃣ Checking security..."
if grep -q "ignoreBuildErrors.*true" next.config.ts 2>/dev/null; then
    print_warning "TypeScript build errors are ignored in next.config.ts"
fi

if grep -q "reactStrictMode.*false" next.config.ts 2>/dev/null; then
    print_warning "React strict mode is disabled"
fi

print_success "Security checks complete"

echo ""

# Summary
echo "======================================="
echo "📊 Validation Summary"
echo "======================================="
echo ""
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    print_success "Ready for deployment! 🚀"
    echo ""
    echo "Next steps:"
    echo "1. Commit your changes: git add . && git commit -m 'Ready for production'"
    echo "2. Push to GitHub: git push origin main"
    echo "3. Deploy to Vercel: Import your repository"
    echo "4. Add environment variables in Vercel dashboard"
    echo "5. Run migrations: ./migrate.sh"
    exit 0
else
    print_error "Fix the errors above before deploying"
    exit 1
fi
