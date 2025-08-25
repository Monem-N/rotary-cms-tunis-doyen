# Git Branch Commands Quick Reference

## Common Branch Operations

### Creating and Switching Branches

```bash
# Create and switch to new feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature-name

# Create and switch to new bugfix branch from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-description

# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix
```

### Working with Branches

```bash
# List all branches
git branch -a

# Switch to existing branch
git checkout branch-name

# Push new branch to remote
git push -u origin branch-name

# Update current branch with latest changes
git pull origin branch-name

# Delete local branch (after merge)
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```

### Merging and Syncing

```bash
# Update develop with latest changes
git checkout develop
git pull origin develop

# Merge develop into your feature branch (to stay current)
git checkout feature/your-feature
git merge develop

# Alternative: Rebase your feature branch on develop
git checkout feature/your-feature
git rebase develop
```

### Branch Status and Information

```bash
# Check current branch and status
git status

# See branch history
git log --oneline --graph --all

# Compare branches
git diff develop..feature/your-feature

# See which branches are merged
git branch --merged
git branch --no-merged
```

### Example Workflow

```bash
# 1. Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/user-profile-page

# 2. Work on feature (make commits)
git add .
git commit -m "feat(profile): add user profile page layout"

# 3. Push to remote
git push -u origin feature/user-profile-page

# 4. Keep feature branch updated (periodically)
git checkout develop
git pull origin develop
git checkout feature/user-profile-page
git merge develop

# 5. When ready, create Pull Request on GitHub
# 6. After merge, cleanup
git checkout develop
git pull origin develop
git branch -d feature/user-profile-page
```

### Emergency Hotfix Workflow

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/security-patch

# 2. Make the fix
git add .
git commit -m "fix(security): patch authentication vulnerability"

# 3. Push hotfix
git push -u origin hotfix/security-patch

# 4. Create PR to main AND develop
# 5. After merge, tag the release
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Hotfix release v1.0.1"
git push origin v1.0.1
```

### Troubleshooting

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash changes temporarily
git stash
git stash pop

# Abort merge if conflicts
git merge --abort

# Force update branch (use carefully!)
git reset --hard origin/branch-name
```
