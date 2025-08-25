# 📚 **Centralized Glossary**

## *Key Terms and Definitions for Rotary Club Tunis Doyen CMS*

---

## 🔧 **Technical Terms**

### **Auto-Draft Sync System**

A feature that automatically creates an Arabic draft when a French event is saved, ensuring bilingual content creation without manual duplication.

### **Field-Level Localization**

The ability to store different values for the same field in multiple languages (French, Arabic, English) within a single database record.

### **JWT (JSON Web Token)**

A secure authentication token used for admin access to the CMS, containing user information and permissions. Optimized for Tunisia network with 7-day expiration and secure payload encryption.

### **CSRF (Cross-Site Request Forgery)**

Security attack where malicious websites trick users into performing unwanted actions on authenticated web applications. Prevented through token-based validation and session management.

### **Rate Limiting**

Security mechanism that restricts the number of API requests within a time window to prevent brute force attacks. Implemented as 5 login attempts per 15-minute window with exponential backoff.

### **Account Lockout**

Security feature that temporarily disables user accounts after multiple failed login attempts. Configured for 5 attempts with 1-hour lockout period and automatic unlock.

### **Exponential Backoff**

Progressive delay mechanism for rate limiting violations, increasing wait time exponentially (15min × 2^violations) to deter automated attacks.

### **LRU (Least Recently Used)**

Cache eviction policy that removes the least recently accessed entries when cache reaches capacity. Implemented in rate limiter to prevent memory leaks.

### **Memory Leak**

Gradual memory consumption issue where unused memory is not properly released. Resolved through automatic cleanup and size limits in performance optimization.

### **Type Safety**

Programming approach using TypeScript to prevent runtime errors through compile-time type checking. Implemented with 150+ comprehensive type definitions.

### **WCAG 2.1 AA**

Web Content Accessibility Guidelines level AA compliance, ensuring CMS usability for people with disabilities through ARIA labels and keyboard navigation.

### **OWASP Top 10**

Industry-standard security risks list. The CMS implements protection against all critical OWASP vulnerabilities including injection, broken authentication, and XSS attacks.

### **MongoDB Atlas**

Cloud-hosted MongoDB database service used for storing CMS content with automatic backups and scaling.

### **Payload CMS**

A headless content management system that provides the backend API and admin interface for the Rotary CMS.

### **Vercel**

A cloud platform for deploying and hosting web applications with automatic scaling and global CDN.

### **Backblaze B2**

Cost-effective cloud storage service used for media files (images, documents) with S3-compatible API.

---

## 🌍 **Localization & Language Terms**

### **RTL (Right-to-Left)**

Text direction used for Arabic script, where text flows from right to left and numbers/English flow left to right.

### **Locale**

A language and region identifier (e.g., `fr` for French, `ar` for Arabic, `en` for English).

### **Fallback Locale**

The default language used when content is not available in the requested language (French is the primary fallback).

### **Language Cascade**

The order in which languages are checked for content: French (primary) → Arabic → English.

---

## 🔐 **Security & Compliance Terms**

### **GDPR (General Data Protection Regulation)**

European Union regulation requiring consent for data collection and providing data subject rights (access, deletion, portability).

### **RBAC (Role-Based Access Control)**

Security model where permissions are assigned based on user roles (admin, editor, volunteer).

### **PAYLOAD_SECRET**

A 32+ character randomly generated secret key used to secure Payload CMS authentication and encryption.

### **MONGODB_URI**

Database connection string containing credentials and connection details for MongoDB Atlas.

### **IP Whitelist**

Security feature that restricts database access to specific IP addresses (Vercel serverless functions).

---

## 📱 **User Interface Terms**

### **Admin Panel**

The backend interface where volunteers create and manage content, accessible at `/admin`.

### **Collection**

A content type in Payload CMS (e.g., Events, Articles, Media, Minutes, Users).

### **Rich Text Editor**

WYSIWYG editor for creating formatted content with support for Arabic RTL and accessibility features.

### **Media Library**

Centralized storage and management system for images, documents, and other media files.

### **Workflow State**

Content status indicators: Draft (unpublished), Published (live), Archived (hidden but preserved).

---

## 🚀 **Project Management Terms**

### **RACI Matrix**

Responsibility assignment framework defining who is Responsible, Accountable, Consulted, and Informed for each task.

### **KPIs (Key Performance Indicators)**

Measurable metrics for project success (e.g., page load time <8s, volunteer adoption rate).

### **MVP (Minimum Viable Product)**

The simplest version of the CMS that provides core functionality for initial user testing.

### **CI/CD (Continuous Integration/Continuous Deployment)**

Automated process for testing and deploying code changes using GitHub Actions and Vercel.

### **Database Integration**

Process of connecting the CMS to MongoDB with optimized queries, security logging, and performance monitoring for Tunisia network conditions.

### **Two-Factor Authentication (2FA)**

Security enhancement requiring two forms of verification: password plus SMS/email code, backup codes, or authenticator app.

### **Content Management System (CMS)**

Web application that allows non-technical users to create, edit, and manage digital content with multi-language support and role-based permissions.

### **Role-Based Access Control (RBAC)**

Security model assigning permissions based on user roles (Admin, Editor, Volunteer) with field-level and collection-level restrictions.

### **GDPR Compliance**

European data protection regulation requiring user consent, data export capabilities, and secure data handling practices.

---

## 📊 **Business Terms**

### **Areas of Focus**

Rotary International's 7 key service areas: Peace, Disease Prevention, Water, Education, Economic Development, Environment, Maternal/Child Health.

### **Impact Metrics**

Quantifiable measures of Rotary project outcomes (meals served, trees planted, volunteer hours).

### **Digital Steward**

The designated volunteer responsible for CMS maintenance, user support, and content quality.

### **Stakeholder**

Anyone with an interest in the CMS project (volunteers, board members, beneficiaries, partners).

---

## 🔄 **Operational Terms**

### **Backup Strategy**

Automated daily backups to Backblaze B2 with 30-day retention and restoration procedures.

### **Emergency Rollback**

Process to revert the CMS to a previous working version in case of critical issues.

### **Maintenance Window**

Scheduled time for system updates and maintenance (typically outside business hours).

### **Support Tiers**

Three levels of technical support: Self-service documentation, volunteer assistance, and expert technical support.

---

## 📈 **Performance Terms**

### **Page Load Time**

Time for a web page to fully load, targeted at <8 seconds on 3G networks for Tunisian users.

### **Mobile-First**

Design approach prioritizing mobile device experience, especially important for Tunisian volunteers.

### **Progressive Enhancement**

Strategy of building basic functionality first, then adding advanced features for capable devices.

### **Lazy Loading**

Technique to load images and content only when needed, improving initial page load performance.

### **Health Check**

Automated system monitoring that verifies application health, memory usage, and performance metrics. Implemented with real-time alerts and periodic checks.

### **Bundle Optimization**

Process of reducing JavaScript bundle size to improve loading times. Includes lazy loading, tree shaking, and critical resource preloading.

### **Progressive Web App (PWA)**

Web application that provides native app-like experience with offline functionality, push notifications, and responsive design.

### **Service Worker**

JavaScript file that runs in the background to provide offline functionality, caching, and push notifications for PWAs.

---

## 🎯 **Quality Assurance Terms**

### **User Acceptance Testing (UAT)**

Final testing phase where volunteers validate the CMS meets their needs before production launch.

### **WCAG 2.1 AA**

Web Content Accessibility Guidelines level AA, ensuring the CMS is usable by people with disabilities.

### **Cross-Browser Testing**

Verification that the CMS works correctly across different browsers (Chrome, Safari, Firefox).

### **Regression Testing**

Testing to ensure new features don't break existing functionality.

### **Security Testing Suite**

Comprehensive test suite covering authentication, rate limiting, account lockout, input validation, and security headers. Currently 19/19 tests passing.

### **End-to-End Testing**

Testing that verifies complete user workflows from start to finish, including authentication, content creation, and user interactions.

### **Load Testing**

Performance testing that simulates multiple users accessing the system simultaneously to identify bottlenecks and capacity limits.

### **Penetration Testing**

Security testing that simulates real-world attacks to identify vulnerabilities and weaknesses in the system.

---

## 📞 **Support Terms**

### **Escalation Path**

Defined process for moving support issues from self-service to expert assistance.

### **Response Time**

Target time for support response: 30 minutes for urgent issues, 24 hours for standard requests.

### **Knowledge Base**

Self-service documentation and troubleshooting guides for common issues.

### **Training Materials**

Documentation, videos, and guides for training new volunteers on CMS usage.

---

*This glossary ensures consistent terminology across all Rotary Club Tunis Doyen CMS documentation. Last updated: August 25, 2025*
