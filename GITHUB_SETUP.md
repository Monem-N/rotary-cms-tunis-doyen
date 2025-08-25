# GitHub Repository Setup Guide

## Branch Protection Rules Configuration

After pushing your repository to GitHub, follow these steps to configure branch protection rules.

### Step 1: Access Branch Protection Settings

1. Go to your GitHub repository: `https://github.com/<username>/rotary-cms-tunis-doyen`
2. Click on **Settings** tab
3. In the left sidebar, click **Branches**
4. Click **Add rule** or **Add branch protection rule**

### Step 2: Configure Main Branch Protection

#### Branch Name Pattern
- Enter: `main`

#### Protection Settings to Enable

**✅ Require a pull request before merging**
- ✅ Require approvals: `1` (minimum)
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require review from code owners (if CODEOWNERS file exists)

**✅ Require status checks to pass before merging**
- ✅ Require branches to be up to date before merging
- Add status checks when CI/CD is configured (e.g., "build", "test")

**✅ Require conversation resolution before merging**

**✅ Require signed commits** (recommended for security)

**✅ Require linear history** (prevents merge commits)

**✅ Include administrators** (applies rules to repo admins too)

**✅ Restrict pushes that create files larger than 100MB**

#### Advanced Settings

**✅ Allow force pushes: DISABLED**
**✅ Allow deletions: DISABLED**

### Step 3: Configure Develop Branch Protection (Optional)

Repeat the process for the `develop` branch with slightly relaxed rules:

#### Branch Name Pattern
- Enter: `develop`

#### Protection Settings
- ✅ Require a pull request before merging
- ✅ Require approvals: `1`
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### Step 4: Set Up CODEOWNERS (Optional)

Create a `.github/CODEOWNERS` file to automatically request reviews from specific team members:

```
# Global code owners
* @username1 @username2

# Frontend specific
/rotary-club-tunis/src/app/ @frontend-lead
/rotary-club-tunis/src/components/ @frontend-lead

# Backend/API specific
/rotary-club-tunis/src/collections/ @backend-lead
/rotary-club-tunis/src/lib/ @backend-lead

# Documentation
/Doc/ @documentation-lead
*.md @documentation-lead

# Configuration files
package.json @tech-lead
*.config.* @tech-lead
```

### Step 5: Configure Repository Settings

#### General Settings
- **Default branch**: Set to `main`
- **Template repository**: Disabled
- **Issues**: Enabled
- **Wiki**: Enabled (for additional documentation)
- **Discussions**: Enabled (for team communication)

#### Pull Request Settings
- ✅ Allow merge commits
- ✅ Allow squash merging
- ✅ Allow rebase merging
- ✅ Always suggest updating pull request branches
- ✅ Automatically delete head branches

#### Security Settings
- ✅ Enable vulnerability alerts
- ✅ Enable automated security fixes
- ✅ Enable private vulnerability reporting

### Step 6: Set Up Issue Templates

Create `.github/ISSUE_TEMPLATE/` directory with templates:

#### Bug Report Template
```yaml
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us, what did you expect to happen?
      placeholder: Tell us what you see!
    validations:
      required: true
```

#### Feature Request Template
```yaml
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''

body:
  - type: textarea
    id: feature-description
    attributes:
      label: Feature Description
      description: A clear and concise description of what you want to happen.
    validations:
      required: true
```

### Step 7: Set Up Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Related Issues
Closes #(issue number)
```

### Step 8: Configure Notifications

Set up team notifications:
1. Go to **Settings** > **Notifications**
2. Configure email notifications for:
   - Pull request reviews
   - Issue assignments
   - Security alerts

### Step 9: Add Collaborators

1. Go to **Settings** > **Manage access**
2. Click **Invite a collaborator**
3. Add team members with appropriate permissions:
   - **Admin**: Full access (project leads)
   - **Write**: Can push to non-protected branches (developers)
   - **Read**: Can view and clone (stakeholders)

### Commands to Push Everything to GitHub

After creating the repository and getting the URL:

```bash
# Add remote origin (replace with your actual URL)
git remote add origin https://github.com/<username>/rotary-cms-tunis-doyen.git

# Push main branch
git push -u origin main

# Push develop branch
git push -u origin develop

# Verify remotes
git remote -v

# Check all branches
git branch -a
```

### Verification Checklist

After setup, verify:
- [ ] Repository is accessible at the correct URL
- [ ] Main branch is protected
- [ ] Pull requests are required for main branch
- [ ] Status checks are configured (when CI/CD is added)
- [ ] Team members have appropriate access
- [ ] Issue and PR templates are working
- [ ] Branch protection rules are active

---

**Next Steps:**
1. Set up CI/CD pipeline (GitHub Actions)
2. Configure automated testing
3. Set up deployment workflows
4. Add status badges to README
