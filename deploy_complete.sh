#!/bin/bash

# Doctor360 Complete Deployment Script
# This script handles the entire deployment process

set -e

echo "🚀 Doctor360 Complete Deployment"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_step() { echo -e "${PURPLE}📍 $1${NC}"; }

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the Doctor360/1.0 directory"
    exit 1
fi

echo -e "${CYAN}This script will:${NC}"
echo "1. Check your configuration"
echo "2. Create a GitHub repository"
echo "3. Push your code to GitHub"
echo "4. Provide Vercel deployment instructions"
echo ""

read -p "Ready to deploy? (Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Step 1: Validate configuration
echo ""
print_step "Step 1: Validating configuration..."
echo ""

if [ ! -f ".env.local" ]; then
    print_error ".env.local not found!"
    exit 1
fi

print_success "Environment file exists"

# Check git
if [ ! -d ".git" ]; then
    print_info "Initializing git repository..."
    git init
    git add .
    git commit -m "Production ready - Doctor360 Healthcare Platform"
    print_success "Git repository initialized"
else
    print_success "Git repository already initialized"
fi

# Step 2: GitHub Repository
echo ""
print_step "Step 2: GitHub Repository Setup"
echo ""

# Check if remote exists
if git remote | grep -q "origin"; then
    print_success "GitHub remote already configured"
    git remote -v
else
    echo -e "${CYAN}You need to create a GitHub repository first:${NC}"
    echo ""
    echo "Option A: Create manually"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: doctor360"
    echo "3. Don't initialize with README"
    echo "4. Click 'Create repository'"
    echo ""
    echo "Option B: Use GitHub CLI (if installed)"
    echo "Run: gh repo create doctor360 --public --source=. --remote=origin"
    echo ""
    
    read -p "Have you created the GitHub repository? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Please create the repository first, then run this script again"
        echo ""
        echo "After creating, run:"
        echo "  git remote add origin https://github.com/YOUR_USERNAME/doctor360.git"
        echo "  git push -u origin main"
        exit 0
    fi
    
    echo ""
    read -p "Enter your GitHub username: " github_username
    
    if [ -n "$github_username" ]; then
        git remote add origin "https://github.com/${github_username}/doctor360.git"
        print_success "GitHub remote added"
    else
        print_error "GitHub username required"
        exit 1
    fi
fi

# Step 3: Push to GitHub
echo ""
print_step "Step 3: Pushing to GitHub..."
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_info "Committing changes..."
    git add .
    git commit -m "Update before deployment"
fi

# Push to GitHub
print_info "Pushing to GitHub..."
if git push -u origin main 2>&1; then
    print_success "Code pushed to GitHub successfully!"
else
    print_error "Failed to push to GitHub"
    print_info "You may need to:"
    echo "1. Check your GitHub credentials"
    echo "2. Verify the repository exists"
    echo "3. Try: git push -u origin main --force"
    exit 1
fi

# Step 4: Vercel Deployment
echo ""
print_step "Step 4: Vercel Deployment"
echo ""

echo -e "${CYAN}Your code is now on GitHub! Next steps:${NC}"
echo ""
echo "1. Go to: ${GREEN}https://vercel.com${NC}"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New Project'"
echo "4. Import your 'doctor360' repository"
echo "5. Configure project (Next.js will be auto-detected)"
echo ""

echo -e "${YELLOW}IMPORTANT: Add these environment variables in Vercel:${NC}"
echo ""

# Read and display env vars
if [ -f ".env.local" ]; then
    echo -e "${CYAN}Copy these values from your .env.local:${NC}"
    echo ""
    grep -E "^(DATABASE_URL|SESSION_SECRET|NEXTAUTH_SECRET|NEXTAUTH_URL|NODE_ENV|NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_APP_NAME|CLOUDINARY)" .env.local | while read line; do
        echo "  $line"
    done
    echo ""
fi

echo -e "${CYAN}After adding environment variables:${NC}"
echo "6. Click 'Deploy'"
echo "7. Wait 2-3 minutes for build"
echo "8. 🎉 Your app will be live!"
echo ""

# Success message
echo ""
echo "=================================="
print_success "Deployment preparation complete! 🚀"
echo "=================================="
echo ""
echo -e "${GREEN}Your repository:${NC} $(git remote get-url origin)"
echo ""
echo -e "${CYAN}Next: Deploy on Vercel using the steps above${NC}"
echo ""
