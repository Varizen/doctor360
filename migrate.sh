#!/bin/bash

# Doctor360 Database Migration Script
# Handles PostgreSQL migrations for production deployment

set -e

echo "🗄️ Doctor360 Database Migration"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local not found!"
    echo "Please create .env.local from .env.example first"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL not set in environment!"
    exit 1
fi

echo "Environment: ${NODE_ENV:-development}"
echo "Database URL: ${DATABASE_URL:0:50}..."
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
bunx prisma generate
print_success "Prisma client generated"

# Step 2: Check database connection
echo ""
echo "🔌 Step 2: Testing database connection..."
if bunx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
    print_success "Database connection successful"
else
    print_warning "Cannot connect to database. Please check your DATABASE_URL"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 3: Push schema changes
echo ""
echo "📤 Step 3: Pushing schema to database..."
read -p "This will modify your database. Continue? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bunx prisma db push --skip-generate
    print_success "Schema pushed to database"
else
    print_warning "Schema push cancelled"
fi

# Step 4: Run seed (optional)
echo ""
read -p "Do you want to seed the database with initial data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "prisma/seed.ts" ]; then
        echo "🌱 Seeding database..."
        bun run prisma/seed.ts
        print_success "Database seeded"
    else
        print_warning "No seed file found at prisma/seed.ts"
    fi
fi

echo ""
echo "=================================="
print_success "Migration complete!"
echo ""
echo "Next steps:"
echo "1. Verify database tables in Supabase dashboard"
echo "2. Test your application: bun run dev"
echo "3. Deploy to Vercel"
