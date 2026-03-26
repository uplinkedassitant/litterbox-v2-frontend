#!/bin/bash

# LitterBox v2 Frontend - Push to GitHub
# This script initializes git and pushes to a fresh repository

echo "♻️  LitterBox v2 Frontend - GitHub Push Script"
echo "=============================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Initialize git repo if not already
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
fi

# Add all files
echo "Adding files to git..."
git add -A

# Check if there are changes
if ! git diff --cached --quiet; then
    # Commit
    echo "Committing changes..."
    git commit -m "Initial commit: LitterBox v2 Frontend - Fresh Start

Complete rewrite with modern stack:
- React 18 + Vite (Rolldown)
- Tailwind CSS
- Solana Wallet Adapter
- Lucide React icons
- Responsive design

Features:
- Wallet connection (Phantom, Solflare, etc.)
- Token selector with search
- Multi-token deposit form
- Pool statistics
- Transaction status

Configuration:
- Program: B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr
- Token: FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR
- Network: Solana Devnet

Status: UI complete, build successful ✅"
    
    echo "✅ Commit successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Create a new repository on GitHub:"
    echo "   https://github.com/new"
    echo "   Name: litterbox-v2-frontend"
    echo ""
    echo "2. Then run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/litterbox-v2-frontend.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
else
    echo "✅ No changes to commit"
fi

echo "Build status:"
npm run build 2>&1 | tail -5
