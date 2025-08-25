# Contributing to Rotary CMS Tunis Doyen

## Branching Strategy

This project follows a **Git Flow** branching model to ensure code quality and collaborative development.

### Branch Structure

#### Main Branches

- **`main`** - Production-ready code
  - Contains stable, tested, and deployable code
  - Protected branch - no direct commits allowed
  - Only accepts merges from `develop` via pull requests
  - Tagged for releases

- **`develop`** - Integration branch for ongoing development
  - Contains the latest development changes
  - Base branch for all feature and bugfix branches
  - Continuously integrated and tested

#### Supporting Branches

- **`feature/`** - New features and enhancements
  - Naming: `feature/description-of-feature`
  - Examples: `feature/user-authentication`, `feature/event-management`
  - Created from: `develop`
  - Merged back to: `develop`

- **`bugfix/`** - Bug fixes for development
  - Naming: `bugfix/description-of-fix`
  - Examples: `bugfix/login-validation`, `bugfix/date-formatting`
  - Created from: `develop`
  - Merged back to: `develop`

- **`hotfix/`** - Critical fixes for production
  - Naming: `hotfix/description-of-critical-fix`
  - Examples: `hotfix/security-vulnerability`, `hotfix/data-corruption`
  - Created from: `main`
  - Merged to: both `main` and `develop`

### Workflow Process

#### For New Features

```bash
# 1. Start from develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Work on your feature
# Make commits with descriptive messages

# 4. Push feature branch
git push -u origin feature/your-feature-name

# 5. Create Pull Request to develop branch
# 6. After review and approval, merge via GitHub
# 7. Delete feature branch after merge
```

#### For Bug Fixes

```bash
# 1. Start from develop branch
git checkout develop
git pull origin develop

# 2. Create bugfix branch
git checkout -b bugfix/issue-description

# 3. Fix the bug and test
# 4. Push and create Pull Request to develop
git push -u origin bugfix/issue-description
```

#### For Releases

```bash
# 1. Merge develop to main via Pull Request
# 2. Tag the release
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Commit Message Guidelines

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT token refresh mechanism
fix(events): resolve date formatting issue in event list
docs(api): update authentication endpoint documentation
```

### Code Review Process

1. **All changes** must go through Pull Request review
2. **Minimum 1 reviewer** required for feature branches
3. **Minimum 2 reviewers** required for main branch merges
4. **All tests must pass** before merge
5. **Branch must be up-to-date** with target branch

### Branch Protection Rules

- **Main branch** is protected:
  - Requires pull request reviews
  - Requires status checks to pass
  - Requires branches to be up to date
  - No direct pushes allowed
  - No force pushes allowed

### Development Environment Setup

Before contributing, ensure you have:

1. **Node.js** (version specified in package.json)
2. **Git** configured with your GitHub credentials
3. **Development environment** set up (see README.md)
4. **Tests passing** locally before pushing

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/<username>/rotary-cms-tunis-doyen.git
   cd rotary-cms-tunis-doyen
   ```

2. **Install dependencies**
   ```bash
   cd rotary-club-tunis
   npm install
   ```

3. **Create your feature branch**
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```

4. **Start developing!**

### Questions or Issues?

- Create an issue on GitHub for bugs or feature requests
- Contact the maintainers for questions about contributing
- Check existing documentation in the `Doc/` directory

---

**Remember:** Quality code, clear commits, and thorough testing make for successful collaboration!
