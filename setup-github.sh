#!/bin/bash
# ═══════════════════════════════════════════════════════
# Financial Command Center — GitHub Setup Script
# Run this from inside the financial-command-center folder
# ═══════════════════════════════════════════════════════

echo "══════════════════════════════════════════════"
echo "  Financial Command Center — GitHub Setup"
echo "══════════════════════════════════════════════"
echo ""

# Step 1: Initialize git
echo "Step 1: Initializing git..."
git init
git branch -M main

# Step 2: Install dependencies and generate lock file
echo ""
echo "Step 2: Installing dependencies..."
npm install

# Step 3: Test build
echo ""
echo "Step 3: Running test build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Fix errors before pushing."
  exit 1
fi
echo "✅ Build successful!"

# Step 4: Add all files
echo ""
echo "Step 4: Staging files..."
git add -A

# Step 5: Initial commit
echo ""
echo "Step 5: Creating initial commit..."
git commit -m "🚀 Financial Command Center v1.0 — AI-powered financial dashboard

- 6 dashboard modules: Net Worth, Tax, Debt, Investments, Goals, Budget
- Claude AI agent with full financial context
- 45+ files, 5,700+ lines of production-grade React
- Dark command center aesthetic (Bloomberg meets Indian fintech)
- Privacy-first: all data in localStorage
- Connected ecosystem linking to TaxGyan, StockGyan, DebtFree, WealthLens
- GitHub Pages deployment via Actions"

# Step 6: Create GitHub repo and push
echo ""
echo "Step 6: Creating GitHub repo..."
echo ""
echo "Option A — Using GitHub CLI (recommended):"
echo "  gh repo create financial-command-center --public --source=. --push"
echo ""
echo "Option B — Manual:"
echo "  1. Go to https://github.com/new"
echo "  2. Create repo named: financial-command-center"
echo "  3. Keep it PUBLIC, do NOT add README/gitignore"
echo "  4. Then run:"
echo "     git remote add origin https://github.com/babubl/financial-command-center.git"
echo "     git push -u origin main"
echo ""

read -p "Which method? (a/b): " method

if [ "$method" = "a" ] || [ "$method" = "A" ]; then
  gh repo create financial-command-center --public --source=. --push
  echo ""
  echo "✅ Repo created and code pushed!"
else
  echo ""
  echo "Create the repo on GitHub, then run:"
  echo "  git remote add origin https://github.com/babubl/financial-command-center.git"
  echo "  git push -u origin main"
  echo ""
  read -p "Press Enter after you've pushed..."
fi

# Step 7: Enable GitHub Pages
echo ""
echo "Step 7: Enabling GitHub Pages..."
echo ""
echo "Option A — Using GitHub CLI:"
echo "  gh api repos/babubl/financial-command-center/pages -X POST -f build_type=workflow"
echo ""
echo "Option B — Manual:"
echo "  1. Go to: https://github.com/babubl/financial-command-center/settings/pages"
echo "  2. Under 'Source', select 'GitHub Actions'"
echo "  3. Save"
echo ""

read -p "Which method? (a/b): " pages_method

if [ "$pages_method" = "a" ] || [ "$pages_method" = "A" ]; then
  gh api repos/babubl/financial-command-center/pages -X POST -f build_type=workflow 2>/dev/null
  echo "✅ Pages enabled!"
else
  echo "Enable Pages manually in Settings > Pages > Source: GitHub Actions"
fi

echo ""
echo "══════════════════════════════════════════════"
echo "  🎉 DONE!"
echo ""
echo "  Your app will be live at:"
echo "  https://babubl.github.io/financial-command-center/"
echo ""
echo "  The GitHub Action will run automatically on push."
echo "  First deploy takes ~2 minutes."
echo ""
echo "  Check deploy status:"
echo "  https://github.com/babubl/financial-command-center/actions"
echo "══════════════════════════════════════════════"
