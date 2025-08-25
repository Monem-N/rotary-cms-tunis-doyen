#!/bin/bash

# Rotary CMS GitHub Remote Setup Script
# Run these commands after creating the GitHub repository

echo "Setting up GitHub remote for Rotary CMS..."

# Replace <YOUR-GITHUB-USERNAME> with your actual GitHub username
# Example: git remote add origin https://github.com/monemnaifer/rotary-cms-tunis-doyen.git
echo "Step 1: Add remote origin (replace with your actual repository URL)"
echo "git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/rotary-cms-tunis-doyen.git"

echo ""
echo "Step 2: Verify remote was added correctly"
echo "git remote -v"

echo ""
echo "Step 3: Push initial commit to GitHub"
echo "git push -u origin main"

echo ""
echo "Step 4: Verify the push was successful"
echo "git status"

echo ""
echo "=== After running these commands ==="
echo "Your repository will be available at:"
echo "https://github.com/<YOUR-GITHUB-USERNAME>/rotary-cms-tunis-doyen"
