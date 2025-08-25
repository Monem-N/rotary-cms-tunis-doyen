# 🤝 Team Onboarding Guide - Rotary CMS

Welcome to the Rotary Club Tunis Doyen CMS project! This guide will help new team members get started with contributing to the project.

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/Monem-N/rotary-cms-tunis-doyen.git
cd rotary-cms-tunis-doyen

# Install dependencies
cd rotary-club-tunis
npm install

# Copy environment template (when available)
cp .env.example .env.local
```

### 2. Development Workflow

```bash
# Always start from develop branch
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat(component): add user authentication form"

# Push and create PR
git push -u origin feature/your-feature-name
gh pr create --base develop --title "Add user authentication form"
```

## 📋 Project Structure

```
rotary-cms-tunis-doyen/
├── Doc/                          # Project documentation
│   ├── 01-Implementation/        # Implementation guides
│   ├── 02-User-Manuals/         # User documentation
│   ├── 03-Support/              # Support guides
│   ├── 04-Technical/            # Technical specifications
│   └── 05-Project-Management/   # Project management docs
├── rotary-club-tunis/           # Main Next.js application
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # React components
│   │   ├── collections/         # Payload CMS collections
│   │   ├── lib/                 # Utility functions
│   │   └── middleware/          # Authentication middleware
│   ├── public/                  # Static assets
│   └── package.json            # Dependencies
├── .github/                     # GitHub templates and workflows
├── CONTRIBUTING.md              # Contribution guidelines
└── README.md                   # Project overview
```

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build

# Type checking
npm run type-check
```

## 🎨 Code Standards

### Commit Messages
Follow conventional commit format:
```
feat(auth): add JWT token refresh mechanism
fix(ui): resolve button alignment issue
docs(api): update authentication endpoints
style(components): format code according to prettier
```

### Branch Naming
- `feature/description-of-feature`
- `bugfix/description-of-fix`
- `hotfix/critical-fix-description`

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use Tailwind CSS for styling
- Follow Rotary brand guidelines for UI components

## 🔐 Security Guidelines

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Follow authentication best practices
- Test security implementations thoroughly

## 🎨 Rotary Brand Compliance

### Colors (from brandcenter.rotary.org)
- **Azure (Primary)**: `#1f4e79`
- **Sky Blue (Secondary)**: `#5ba4d0`
- **Royal Blue (Tertiary)**: `#1560bd`
- **Gold (Accent)**: `#f7a81b`

### Accessibility
- Maintain WCAG 2.1 AA compliance
- Test with screen readers
- Ensure proper color contrast ratios
- Use semantic HTML elements

## 📝 Pull Request Process

1. **Create Feature Branch** from `develop`
2. **Make Changes** following code standards
3. **Write/Update Tests** for new functionality
4. **Update Documentation** if needed
5. **Create Pull Request** with detailed description
6. **Address Review Comments** promptly
7. **Merge** after approval (squash merge preferred)

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Follow existing test patterns

## 🌍 Localization

The project supports multiple languages:
- **French**: Primary language for Tunisia
- **Arabic**: Secondary language support
- **English**: Development and documentation language

### Adding Translations
1. Add keys to translation files
2. Use translation hooks in components
3. Test with different locales
4. Ensure RTL support for Arabic

## 🚨 Getting Help

### Resources
- **Documentation**: Check the `Doc/` directory first
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for help in PR comments

### Contact
- **Project Lead**: @monemnaifer
- **Technical Questions**: Create GitHub issue
- **Urgent Issues**: Use GitHub Discussions

## 🎯 Current Priorities

### Phase 1: Core Features
- [ ] User authentication system
- [ ] Content management interface
- [ ] Member directory
- [ ] Event management
- [ ] News and announcements

### Phase 2: Advanced Features
- [ ] Multi-language support
- [ ] Advanced permissions
- [ ] Email notifications
- [ ] Mobile responsiveness
- [ ] Performance optimization

## 📚 Learning Resources

### Technologies Used
- **Next.js**: https://nextjs.org/docs
- **Payload CMS**: https://payloadcms.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### Rotary Resources
- **Brand Center**: https://brandcenter.rotary.org
- **Rotary International**: https://www.rotary.org

---

## ✅ Onboarding Checklist

- [ ] Repository cloned and dependencies installed
- [ ] Development environment set up
- [ ] Read CONTRIBUTING.md and code standards
- [ ] Understand branch protection and PR process
- [ ] Familiar with project structure
- [ ] Know how to run tests and development server
- [ ] Understand Rotary brand guidelines
- [ ] Added to project communication channels

**Welcome to the team! 🎉**
