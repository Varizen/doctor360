#!/bin/bash

# Doctor360 Deployment Helper Script
# This script helps you prepare and deploy to production

set -e

echo "🚀 Doctor360 Deployment Helper"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if .env.local exists
if [ -f ".env.local" ]; then
    print_warning ".env.local already exists"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env.local"
    else
        cp .env.example .env.local
        print_success "Created .env.local from template"
    fi
else
    cp .env.example .env.local
    print_success "Created .env.local from template"
fi

echo ""
echo "📝 Next Steps:"
echo "==============="
echo ""
echo "1. Edit .env.local with your credentials:"
echo "   - Supabase database URL"
echo "   - Upstash Redis URL and token"
echo "   - Cloudinary credentials"
echo "   - Generate secrets (run: openssl rand -base64 32)"
echo ""
echo "2. Install dependencies:"
echo "   bun install"
echo ""
echo "3. Run database migrations:"
echo "   bunx prisma generate"
echo "   bunx prisma db push"
echo ""
echo "4. Test locally:"
echo "   bun run dev"
echo ""
echo "5. Deploy to Vercel:"
echo "   - Push to GitHub"
echo "   - Connect to Vercel"
echo "   - Add environment variables"
echo "   - Deploy!"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""

# Generate secrets
read -p "Do you want to generate SESSION_SECRET and NEXTAUTH_SECRET? (Y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    SESSION_SECRET=$(openssl rand -base64 32)
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    echo ""
    echo "Generated secrets:"
    echo "SESSION_SECRET=\"$SESSION_SECRET\""
    echo "NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\""
    echo ""
    echo "Add these to your .env.local and Vercel environment variables!"
fi

echo ""
print_success "Setup complete! Follow the steps above to deploy."
