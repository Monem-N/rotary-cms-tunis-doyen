# 🔒 **Rotary Club Tunis Doyen CMS Security & Compliance Handbook**  

## *Official Security Policy for Volunteer-Operated Trilingual Platform*

> **"Security is not a feature—it's the foundation that allows Rotary volunteers to focus on service, not systems."**  
> *This handbook serves as the single source of truth for all security decisions and implementations.*

---

## 🔐 **1. Security Principles**

### **Our Non-Negotiable Security Foundation**

These principles guide every technical decision and must be upheld without exception:

1. **Security Must Not Compromise Volunteer Usability**  
   > *Security measures should protect content without creating barriers for non-technical volunteers. If a process requires technical knowledge, it fails this principle.*

2. **All Access Controls Are Enforced Server-Side — Never Client-Side**  
   > *UI hiding is for convenience only; true security always happens at the API level. What volunteers don't see should also be inaccessible via direct API calls.*

3. **GDPR Compliance for European Data with Tunisian Context**  
   > *We protect French/European member data to GDPR standards while respecting Tunisian data practices for local members—never the lowest common denominator.*

4. **Security Must Survive Volunteer Turnover**  
   > *The system must remain secure even when the entire volunteer team changes. Documentation and processes must outlive individuals.*

5. **"Secure by Default" for Non-Profit Constraints**  
   > *All configurations must prioritize security within free/low-cost hosting limitations. No "I'll secure it later" promises.*

---

## 🛡️ **2. System Overview (Security Context)**

### **Technical Architecture Summary**

| Component | Technology | Security Relevance |
|-----------|------------|-------------------|
| **CMS Engine** | Payload CMS v3 | Provides built-in RBAC, versioning, and security features |
| **Frontend** | Next.js 14 (App Router) | Server-side rendering protects sensitive logic |
| **Hosting** | Vercel Pro Plan | Required for warm serverless functions and security headers |
| **Database** | MongoDB Atlas M2 | Necessary for point-in-time recovery (M0 lacks this) |
| **Media Storage** | Backblaze B2 (S3-compatible) | 10GB free storage with proper access controls |

### **Critical Data Flow**

```
[Volunteer Device] 
     │ HTTPS (TLS 1.3)
     ▼
[Vercel Edge Network] 
     │ • Static content (public)
     │ • Serverless functions (admin/API)
     ▼
[Payload CMS v3] 
     │ • Authentication (JWT)
     │ • Server-side access control
     │ • Audit logging
     ▼
[MongoDB Atlas] ←──[Backblaze B2] 
  • Content data        • Original media
  • User credentials    • Optimized images
  • Audit logs          • Encrypted backups
```

### **Threat Model: Top 3 Risks**

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Unauthorized Content Edits** | High | Medium | • Strict RBAC<br>• Audit logs<br>• Draft/publish workflow |
| **Secret Leakage** | Medium | Critical | • Vercel environment variables<br>• No client-side secrets<br>• Quarterly secret rotation |
| **Data Loss** | Medium | High | • Nightly encrypted backups<br>• Quarterly restore drills<br>• Point-in-time recovery |

### **Tunisia-Specific Security Considerations**

- **Mobile-First Threats**: Volunteers using common <$150 Android devices require extra protection against session hijacking
- **Network Instability**: Spotty internet requires longer session timeouts (7 days vs standard 1 day)
- **Cultural Trust Dynamics**: Rotary's open culture requires technical safeguards against accidental privilege escalation
- **GDPR Scope**: Applies only to French/European members—not all Tunisian members

---

## 👤 **3. Access Control & Authentication**

### **Policy: Who Can Do What**

#### **Authorization Principles**

- **Only authorized Rotary members** may access the admin panel (no public registration)
- **Two roles only** to minimize complexity:
  - `admin`: Full access (settings, users, minutes, content)
  - `editor`: Create/edit content only (cannot delete or change settings)
- **No role escalation** through the UI (only via direct database access with approval)
- **All access decisions** must be server-side (client-side hiding is purely for UX)
- **Photo consent is mandatory** for images containing people (especially minors)

#### **User Management Policy**

- **All users must be manually created** by an admin (no self-registration)
- **New users receive temporary password** valid for 24 hours
- **Inactive accounts** (90+ days) are automatically disabled
- **Quarterly access review** required (board-approved list of current users)
- **Immediate deprovisioning** when volunteers leave Rotary

### **Implementation: Technical Enforcement**

#### **Authentication Configuration**

```ts
// src/payload.config.ts
auth: {
  tokenExpiration: 7 * 24 * 60 * 60, // 7 days (accommodates spotty internet)
  cookies: {
    secure: true, // Always HTTPS
    sameSite: 'strict', // Prevents CSRF
    path: '/admin', // Limits cookie scope
    domain: process.env.VERCEL_URL?.replace('https://', '') || undefined,
  },
  useAPIKey: false, // Disable for volunteer safety
  maxLoginAttempts: 5, // Prevents brute force
  lockTime: 60 * 60 * 1000, // 1 hour lock after 5 failed attempts
},
```

#### **Role-Based Access Control (RBAC)**

```ts
// src/collections/Events.ts
access: {
  // All users can read published content
  read: () => true,
  
  // Editors can create content
  create: ({ req }) => 
    req.user?.role === 'editor' || req.user?.role === 'admin',
  
  // Editors can update their own content
  update: ({ req, id }) => 
    req.user?.role === 'admin' || 
    (req.user?.role === 'editor' && req.user?.id === id),
  
  // Only admins can delete content
  delete: ({ req }) => req.user?.role === 'admin',
  
  // Admins control who sees what
  admin: ({ req }) => req.user?.role === 'admin',
}
```

#### **Critical Security Enhancements**

```ts
// src/collections/Media.ts
fields: [
  {
    name: 'consentObtained',
    type: 'checkbox',
    label: 'Consentement obtenu (GDPR)',
    admin: {
      description: 'Cochez cette case uniquement si vous avez l\'autorisation écrite de publication'
    },
    // Prevent publishing without consent
    hooks: {
      beforeValidate: [
        ({ data, siblingData, operation }) => {
          if (operation === 'create' && !data.consentObtained) {
            throw new Error('Vous devez obtenir le consentement avant de publier des images avec des personnes');
          }
        }
      ]
    }
  },
  // ... other fields
]
```

### **Volunteer-Friendly Security Features**

#### **Micro-Security Training**

- Contextual warnings when handling sensitive actions:
  > *"Attention: Cette action supprimera définitivement le contenu. Confirmez-vous ?"*
  
- Visual role indicators in admin UI:

  ```tsx
// src/components/RoleBadge.tsx
  const RoleBadge = () => (
    <div className={`role-badge role-${useAuth().user.role}`}>
      {useAuth().user.role === 'admin' ? 'Administrateur' : 'Éditeur'}
    </div>
  );
```

#### **Session Management for Volunteers**
- **Auto-logout**: 30 minutes of inactivity (configurable per device)
- **Active sessions view**: Shows current logins with device info
- **Emergency logout**: "Déconnexion partout" button for compromised accounts

#### **Audit Trail for Accountability**
- All content changes logged with:
  - Who made the change
  - What was changed
  - When it happened
  - Previous version (via Payload versioning)
- Exportable for board reviews in French/Arabic

---

## 📁 **4. Data Protection & Privacy**

### **Policy: Handling Sensitive Information**

#### **Data Classification**
| Data Type | Classification | Handling Requirements |
|-----------|----------------|------------------------|
| **Member Personal Data** (French/EU) | GDPR-Sensitive | • Explicit consent<br>• Right to erasure<br>• Data minimization |
| **Member Personal Data** (Tunisian) | Sensitive | • Consent for photos<br>• No unnecessary collection |
| **Content Data** | Public | • No restrictions on access |
| **System Credentials** | Confidential | • Never exposed to volunteers<br>• Quarterly rotation |
| **Audit Logs** | Internal | • Access limited to admins<br>• 90-day retention |

#### **GDPR Compliance Requirements**
- **For French/European members only**:
  - Double opt-in for email communications
  - Data subject request endpoint
  - Privacy notice in French/Arabic
  - Data processing agreement with Vercel/Backblaze
  - Data Protection Officer contact information

### **Implementation: Technical Safeguards**

#### **Data Minimization Practices**
```ts
// src/collections/Users.ts
fields: [
  {
    name: 'email',
    type: 'email',
    required: true,
    unique: true,
    admin: {
      position: 'sidebar',
    },
    // Never store unnecessary PII
    validate: (value) => {
      if (value.includes('@gmail.com') || value.includes('@yahoo.com')) {
        return 'Veuillez utiliser une adresse email professionnelle ou Rotary';
      }
      return true;
    }
  },
  // Only store essential information
  {
    name: 'displayName',
    type: 'text',
    required: true,
    admin: {
      position: 'sidebar',
    }
  },
  // NO phone numbers, addresses, or birthdates stored
]
```

#### **Photo Consent Enforcement**

```ts
// src/hooks/validateMedia.ts
import { CollectionBeforeValidateHook } from 'payload/types';

export const validateMedia: CollectionBeforeValidateHook = ({ data, req, operation }) => {
  // Only enforce for image uploads with people
  if (operation === 'create' && data.mimeType?.startsWith('image/') && !data.consentObtained) {
    throw new Error(
      'Vous devez confirmer avoir obtenu le consentement avant de publier des images contenant des personnes.'
    );
  }
  return data;
};
```

#### **GDPR Data Subject Requests**

```ts
// src/endpoints/gdpr.ts
import { Express } from 'express';

export default (app: Express) => {
  app.post('/api/gdpr/delete', async (req, res) => {
    if (!req.user || !req.body.email) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
      // Verify identity through additional means
      const verification = await sendVerificationCode(req.user.email);
      
      if (verification !== req.body.verificationCode) {
        return res.status(403).json({ error: 'Code de vérification incorrect' });
      }

      // Anonymize user data
      await req.payload.update({
        collection: 'users',
        id: req.user.id,
        data: {
          email: `deleted-${Date.now()}@example.com`,
          displayName: '[Compte supprimé]',
          personalData: null
        }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  });
};
```

---

## 🔑 **5. Secrets Management**

### **Policy: Handling Sensitive Credentials**

#### **Secrets Classification**

| Secret Type | Classification | Rotation Policy | Access Requirements |
|-------------|----------------|-----------------|---------------------|
| **PAYLOAD_SECRET** | Critical | Quarterly | Vercel environment variables only |
| **MONGODB_URI** | Critical | Immediately after breach | Dedicated DB user with least privilege |
| **S3_CREDENTIALS** | High | Monthly | Backblaze B2 app keys (not master keys) |
| **SENTRY_DSN** | Medium | As needed | Restricted to error monitoring |
| **EMAIL_API_KEYS** | Medium | Monthly | Limited to email provider |

#### **Golden Rules of Secrets Handling**

- **Never commit secrets to Git** (even in `.env` files)
- **Always use Vercel environment variables** (never local files)
- **Least privilege principle** for all service accounts
- **Secrets must be 32+ characters** (randomly generated)
- **No secrets in client-side code** (Next.js `public` variables)

### **Implementation: Secure Configuration**

#### **Vercel Environment Setup**

```bash
# REQUIRED ENVIRONMENT VARIABLES (VERCEL DASHBOARD)
PAYLOAD_SECRET="generate-64-random-chars-here"
MONGODB_URI="mongodb+srv://app-user:complex-password@cluster.mongodb.net/db?retryWrites=true&w=majority"
S3_BUCKET="rotary-tunis-media"
S3_ENDPOINT="https://s3.us-west-000.backblazeb2.com"
S3_ACCESS_KEY="your_backblaze_app_key_id"
S3_SECRET_KEY="your_backblaze_app_key"
SENTRY_DSN="https://public@o123456.ingest.sentry.io/1234567"
```

#### **Secret Rotation Procedure**

1. **Generate new secret** (32+ random characters)
2. **Update in Vercel dashboard** (all environments)
3. **Deploy new version** with updated secret
4. **Verify functionality** before removing old secret
5. **Document rotation** in security log

> ⚠️ **Critical Note**: PAYLOAD_SECRET rotation invalidates all existing sessions—coordinate with volunteers during off-hours.

#### **Database Security Configuration**

```ts
// MongoDB Atlas connection string best practices
const dbConfig = {
  url: process.env.MONGODB_URI,
  // Use dedicated user with least privilege
  user: 'app-user',
  // Never use admin user for application
  password: process.env.MONGODB_PASSWORD,
  // Enable TLS for data in transit
  options: {
    tls: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Restrict IP access where possible
    // (Vercel Egress IPs add-on recommended)
  }
};
```

---

## 💾 **6. Data Resilience & Backup Strategy**

### **Policy: Protecting Against Data Loss**

#### **Backup Requirements**

- **Frequency**: Nightly automated backups
- **Retention**: 30 days of rolling backups
- **Encryption**: All backups encrypted at rest
- **Verification**: Quarterly restore drills
- **Ownership**: Rotary Digital Steward responsible for verification

#### **Disaster Recovery Objectives**

| Metric | Target | Realistic for Non-Profit |
|--------|--------|--------------------------|
| **RPO** (Recovery Point Objective) | ≤ 24 hours | Achievable with nightly backups |
| **RTO** (Recovery Time Objective) | ≤ 4 hours | Requires documented restore process |
| **Verification** | Quarterly | Mandatory for board reporting |

### **Implementation: Backup System**

#### **Backup Process Flow**

```
1. GitHub Action triggers nightly at 2:00 AM CET
2. mongodump connects to MongoDB Atlas
3. Creates compressed archive of database
4. Encrypts archive using age encryption
5. Uploads to Backblaze B2 bucket
6. Verifies upload integrity
7. Logs success/failure to Sentry
```

#### **GitHub Action Configuration**

```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM CET daily
  workflow_dispatch:     # Manual trigger option

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install MongoDB Tools
        run: |
          sudo apt-get update
          sudo apt-get install -y mongodb-mongosh

      - name: Run Backup
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          AGE_KEY: ${{ secrets.AGE_KEY }}
          B2_ACCOUNT_ID: ${{ secrets.B2_ACCOUNT_ID }}
          B2_APPLICATION_KEY: ${{ secrets.B2_APPLICATION_KEY }}
        run: |
          # Create timestamped backup
          TIMESTAMP=$(date +%Y%m%d)
          mongodump --uri="$MONGODB_URI" --archive="backup-$TIMESTAMP.gz" --gzip
          
          # Encrypt with age (modern encryption)
          echo "$AGE_KEY" > age.key
          age -R age.key backup-$TIMESTAMP.gz -o backup-$TIMESTAMP.age
          
          # Upload to Backblaze B2
          b2 authorize-account $B2_ACCOUNT_ID $B2_APPLICATION_KEY
          b2 upload-file rotary-tunis-backups backup-$TIMESTAMP.age backups/backup-$TIMESTAMP.age
          
          # Cleanup
          rm backup-$TIMESTAMP.gz age.key
```

#### **Restore Procedure**

1. Download encrypted backup from Backblaze B2
2. Decrypt using `age` tool:

   ```bash
age -d -i age.key -o backup-decrypted.gz backup-20231015.age
```
3. Restore to staging environment:
   ```bash
mongorestore --uri="$STAGING_MONGODB_URI" --gzip --archive=backup-decrypted.gz
```

4. Verify content integrity
5. If approved, promote to production

> 💡 **Pro Tip**: Conduct quarterly restore drills with the Rotary Digital Steward to ensure readiness.

---

## 🕵️ **7. Monitoring & Incident Response**

### **Policy: Detecting and Responding to Threats**

#### **Monitoring Requirements**

- **Real-time alerts** for critical security events
- **Quarterly vulnerability scanning**
- **Monthly access review reports**
- **Annual security audit** by qualified third party
- **Incident response plan** tested annually

#### **Incident Classification**

| Severity | Criteria | Response Time |
|----------|----------|---------------|
| **Critical** | Data breach, secret leakage | < 1 hour |
| **High** | Unauthorized access, data corruption | < 4 hours |
| **Medium** | Failed login attempts, policy violations | < 24 hours |
| **Low** | Configuration warnings, informational | < 72 hours |

### **Implementation: Security Monitoring**

#### **Sentry Configuration**

```ts
// src/payload.config.ts
admin: {
  bundler: webpackBundler({
    sentry: {
      dsn: process.env.SENTRY_DSN,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      environment: process.env.VERCEL_ENV,
      ignoreErrors: [
        // Common browser noise
        /ResizeObserver loop limit exceeded/,
        /Non-Error promise rejection captured/,
        // Tunisian network issues
        /NetworkError when attempting to fetch resource/
      ],
      beforeSend(event) {
        // Redact sensitive information
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      }
    }
  })
}
```

#### **Critical Alerting Rules**

| Event | Alert Channel | Recipients | Action Required |
|-------|---------------|------------|-----------------|
| **5+ failed logins** | Slack + Email | Security Lead | Lock account, contact user |
| **Admin role change** | Slack + SMS | Board Security Contact | Verify authorization |
| **Secrets exposure** | SMS + Email | CISO | Immediate rotation |
| **Backup failure** | Email | Digital Steward | Investigate within 24h |
| **Data deletion** | Slack | Content Manager | Verify intent |

#### **Incident Response Playbook**

1. **Containment**: Isolate affected systems
   - Disable compromised accounts
   - Roll secrets immediately
   - Take affected services offline if necessary

2. **Assessment**: Determine scope and impact
   - Review audit logs
   - Identify affected data
   - Classify incident severity

3. **Notification**: Inform appropriate parties
   - Rotary board within 1 hour of critical incidents
   - Affected members per GDPR requirements
   - Authorities if required by law

4. **Remediation**: Fix the root cause
   - Patch vulnerabilities
   - Update security policies
   - Enhance monitoring

5. **Review**: Document lessons learned
   - Full incident report within 7 days
   - Update security handbook
   - Train team on prevention

> 💡 **Critical Process**: All incidents must be documented in the Security Incident Log with French/Arabic descriptions.

---

## 📜 **8. Compliance & Governance**

### **Policy: Meeting Regulatory Requirements**

#### **Applicable Regulations**

| Regulation | Scope | Rotary Tunisia Requirements |
|------------|-------|------------------------------|
| **GDPR** | French/European members | • Consent management<br>• Right to erasure<br>• Data processing agreement |
| **Tunisian Data Law** | Tunisian members | • Basic consent for photos<br>• No unnecessary data collection |
| **Rotary International Policy** | All content | • Brand compliance<br>• Impact reporting standards |
| **Vercel Terms of Service** | Technical infrastructure | • Acceptable use policy<br>• Resource limitations |

#### **Compliance Verification**

- **Quarterly**: Access review and backup verification
- **Biannually**: Security configuration audit
- **Annually**: Full compliance assessment
- **After incidents**: Targeted compliance review

### **Implementation: Governance Framework**

#### **Security Roles & Responsibilities**

| Role | Responsibilities | Accountability |
|------|------------------|----------------|
| **Rotary Board** | • Approve security policy<br>• Budget for security needs<br>• Review incident reports | Ultimate accountability |
| **Digital Steward** | • Day-to-day security management<br>• Backup verification<br>• Incident response coordination | Operational accountability |
| **Tech Lead** | • Implement security controls<br>• Conduct vulnerability scans<br>• Maintain documentation | Technical accountability |
| **All Volunteers** | • Follow security policies<br>• Report suspicious activity<br>• Complete annual training | Individual accountability |

#### **Annual Security Checklist**

```markdown
# ROTARY CLUB TUNIS DOYEN SECURITY CHECKLIST

## [ ] Q1: Access Review
- [ ] Verified user list matches current members
- [ ] Disabled inactive accounts (>90 days)
- [ ] Confirmed no unauthorized role changes

## [ ] Q2: Backup Verification
- [ ] Successfully restored backup to staging
- [ ] Verified content integrity after restore
- [ ] Documented restore process improvements

## [ ] Q3: Policy Compliance
- [ ] Confirmed GDPR compliance for French members
- [ ] Verified photo consent for all images
- [ ] Updated terminology per cultural guidelines

## [ ] Q4: Training & Awareness
- [ ] Completed annual security training
- [ ] Documented new volunteer onboarding process
- [ ] Updated security handbook with lessons learned
```

#### **Volunteer Security Training Requirements**

- **Mandatory for all content editors**
- **Conducted annually** (or upon onboarding)
- **Available in French with Arabic glossary**
- **Includes practical scenarios**:
  > *"Que faire si vous recevez un email demandant votre mot de passe?"*  
  > *"Comment vérifier que vous êtes sur le vrai site Rotary?"*

---

## 📋 **9. Living Document Governance**

### **Maintenance Protocol**

- **Version Control**: Tag with date and changelog (e.g., "v1.1 - 2023-10-15: Added Tunisia-specific GDPR guidance")
- **Storage**: Maintain in shared knowledge base (Notion recommended) with version history
- **Review Cadence**:
  - Monthly: Update with lessons learned
  - Quarterly: Full review with Digital Steward
  - Annually: Board-level policy review

### **Critical Update Triggers**

- [ ] New Tunisia-specific regulation identified
- [ ] Security incident occurs
- [ ] Volunteer reports usability/security conflict
- [ ] Technology stack changes
- [ ] After each quarterly backup restore drill

### **Document Approval Process**

| Action | Responsible | Timeline | Approval Required |
|--------|-------------|----------|-------------------|
| Initial creation | Tech Lead | Before development | Board + Digital Steward |
| Monthly updates | Digital Steward | First Monday monthly | Tech Lead |
| Major revisions | CISO Consultant | After security incidents | Board |
| Annual review | Board Security Committee | Q4 each year | Full Board |

---

## ✅ **10. Security Sign-off Template**

```markdown
# ROTARY CLUB TUNIS DOYEN SECURITY POLICY ACKNOWLEDGEMENT

I, the undersigned, acknowledge that I have read and understand the Rotary Club Tunis Doyen Security & Compliance Handbook:

_________________________
Full Name
Date: _________

_________________________
Role (Admin/Editor)
Date: _________

## My Security Responsibilities:
- [ ] I will not share my login credentials with anyone
- [ ] I will report suspicious activity immediately
- [ ] I will obtain proper consent before uploading photos with people
- [ ] I will complete annual security training
- [ ] I will follow all documented security procedures

## Emergency Contacts:
- Digital Steward: [name] • [phone] • [email]
- Tech Lead: [name] • [phone] • [email]
- Board Security Contact: [name] • [phone] • [email]
```

---

## 💡 **Final Security Philosophy**

> **"In non-profit work, security isn't about protecting data—it's about protecting trust. Every security decision must answer: 'Does this help Rotary volunteers serve their community with confidence?'"**

This handbook ensures:

- ✅ **GDPR compliance** for European members while respecting Tunisian context
- ✅ **Volunteer-friendly security** that doesn't create barriers to service
- ✅ **Data resilience** through tested backup and restore procedures
- ✅ **Accountability** through clear roles and documented processes
- ✅ **Sustainability** through knowledge transfer and documentation

> 🔐 **Remember**: Security is everyone's responsibility. When in doubt, ask the Digital Steward before proceeding—your caution protects Rotary's mission.# 🔒 **Rotary Club Tunis Doyen CMS Security & Compliance Handbook**  
>
## *Official Security Policy for Volunteer-Operated Trilingual Platform*

> **"Security is not a feature—it's the foundation that allows Rotary volunteers to focus on service, not systems."**  
> *This handbook serves as the single source of truth for all security decisions and implementations.*

---

## 🔐 **1. Security Principles**

### **Our Non-Negotiable Security Foundation**

These principles guide every technical decision and must be upheld without exception:

1. **Security Must Not Compromise Volunteer Usability**  
   > *Security measures should protect content without creating barriers for non-technical volunteers. If a process requires technical knowledge, it fails this principle.*

2. **All Access Controls Are Enforced Server-Side — Never Client-Side**  
   > *UI hiding is for convenience only; true security always happens at the API level. What volunteers don't see should also be inaccessible via direct API calls.*

3. **GDPR Compliance for European Data with Tunisian Context**  
   > *We protect French/European member data to GDPR standards while respecting Tunisian data practices for local members—never the lowest common denominator.*

4. **Security Must Survive Volunteer Turnover**  
   > *The system must remain secure even when the entire volunteer team changes. Documentation and processes must outlive individuals.*

5. **"Secure by Default" for Non-Profit Constraints**  
   > *All configurations must prioritize security within free/low-cost hosting limitations. No "I'll secure it later" promises.*

---

## 🛡️ **2. System Overview (Security Context)**

### **Technical Architecture Summary**

| Component | Technology | Security Relevance |
|-----------|------------|-------------------|
| **CMS Engine** | Payload CMS v3 | Provides built-in RBAC, versioning, and security features |
| **Frontend** | Next.js 14 (App Router) | Server-side rendering protects sensitive logic |
| **Hosting** | Vercel Pro Plan | Required for warm serverless functions and security headers |
| **Database** | MongoDB Atlas M2 | Necessary for point-in-time recovery (M0 lacks this) |
| **Media Storage** | Backblaze B2 (S3-compatible) | 10GB free storage with proper access controls |

### **Critical Data Flow**

```
[Volunteer Device] 
     │ HTTPS (TLS 1.3)
     ▼
[Vercel Edge Network] 
     │ • Static content (public)
     │ • Serverless functions (admin/API)
     ▼
[Payload CMS v3] 
     │ • Authentication (JWT)
     │ • Server-side access control
     │ • Audit logging
     ▼
[MongoDB Atlas] ←──[Backblaze B2] 
  • Content data        • Original media
  • User credentials    • Optimized images
  • Audit logs          • Encrypted backups
```

### **Threat Model: Top 3 Risks**

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Unauthorized Content Edits** | High | Medium | • Strict RBAC<br>• Audit logs<br>• Draft/publish workflow |
| **Secret Leakage** | Medium | Critical | • Vercel environment variables<br>• No client-side secrets<br>• Quarterly secret rotation |
| **Data Loss** | Medium | High | • Nightly encrypted backups<br>• Quarterly restore drills<br>• Point-in-time recovery |

### **Tunisia-Specific Security Considerations**

- **Mobile-First Threats**: Volunteers using common <$150 Android devices require extra protection against session hijacking
- **Network Instability**: Spotty internet requires longer session timeouts (7 days vs standard 1 day)
- **Cultural Trust Dynamics**: Rotary's open culture requires technical safeguards against accidental privilege escalation
- **GDPR Scope**: Applies only to French/European members—not all Tunisian members

---

## 👤 **3. Access Control & Authentication**

### **Policy: Who Can Do What**

#### **Authorization Principles**

- **Only authorized Rotary members** may access the admin panel (no public registration)
- **Two roles only** to minimize complexity:
  - `admin`: Full access (settings, users, minutes, content)
  - `editor`: Create/edit content only (cannot delete or change settings)
- **No role escalation** through the UI (only via direct database access with approval)
- **All access decisions** must be server-side (client-side hiding is purely for UX)
- **Photo consent is mandatory** for images containing people (especially minors)

#### **User Management Policy**

- **All users must be manually created** by an admin (no self-registration)
- **New users receive temporary password** valid for 24 hours
- **Inactive accounts** (90+ days) are automatically disabled
- **Quarterly access review** required (board-approved list of current users)
- **Immediate deprovisioning** when volunteers leave Rotary

### **Implementation: Technical Enforcement**

#### **Authentication Configuration**

```ts
// src/payload.config.ts
auth: {
  tokenExpiration: 7 * 24 * 60 * 60, // 7 days (accommodates spotty internet)
  cookies: {
    secure: true, // Always HTTPS
    sameSite: 'strict', // Prevents CSRF
    path: '/admin', // Limits cookie scope
    domain: process.env.VERCEL_URL?.replace('https://', '') || undefined,
  },
  useAPIKey: false, // Disable for volunteer safety
  maxLoginAttempts: 5, // Prevents brute force
  lockTime: 60 * 60 * 1000, // 1 hour lock after 5 failed attempts
},
```

#### **Role-Based Access Control (RBAC)**

```ts
// src/collections/Events.ts
access: {
  // All users can read published content
  read: () => true,
  
  // Editors can create content
  create: ({ req }) => 
    req.user?.role === 'editor' || req.user?.role === 'admin',
  
  // Editors can update their own content
  update: ({ req, id }) => 
    req.user?.role === 'admin' || 
    (req.user?.role === 'editor' && req.user?.id === id),
  
  // Only admins can delete content
  delete: ({ req }) => req.user?.role === 'admin',
  
  // Admins control who sees what
  admin: ({ req }) => req.user?.role === 'admin',
}
```

#### **Critical Security Enhancements**

```ts
// src/collections/Media.ts
fields: [
  {
    name: 'consentObtained',
    type: 'checkbox',
    label: 'Consentement obtenu (GDPR)',
    admin: {
      description: 'Cochez cette case uniquement si vous avez l\'autorisation écrite de publication'
    },
    // Prevent publishing without consent
    hooks: {
      beforeValidate: [
        ({ data, siblingData, operation }) => {
          if (operation === 'create' && !data.consentObtained) {
            throw new Error('Vous devez obtenir le consentement avant de publier des images avec des personnes');
          }
        }
      ]
    }
  },
  // ... other fields
]
```

### **Volunteer-Friendly Security Features**

#### **Micro-Security Training**

- Contextual warnings when handling sensitive actions:
  > *"Attention: Cette action supprimera définitivement le contenu. Confirmez-vous ?"*
  
- Visual role indicators in admin UI:

  ```tsx
// src/components/RoleBadge.tsx
  const RoleBadge = () => (
    <div className={`role-badge role-${useAuth().user.role}`}>
      {useAuth().user.role === 'admin' ? 'Administrateur' : 'Éditeur'}
    </div>
  );
```

#### **Session Management for Volunteers**

- **Auto-logout**: 30 minutes of inactivity (configurable per device)
- **Active sessions view**: Shows current logins with device info
- **Emergency logout**: "Déconnexion partout" button for compromised accounts

#### **Audit Trail for Accountability**

- All content changes logged with:
  - Who made the change
  - What was changed
  - When it happened
  - Previous version (via Payload versioning)
- Exportable for board reviews in French/Arabic

---

## 📁 **4. Data Protection & Privacy**

### **Policy: Handling Sensitive Information**

#### **Data Classification**

| Data Type | Classification | Handling Requirements |
|-----------|----------------|------------------------|
| **Member Personal Data** (French/EU) | GDPR-Sensitive | • Explicit consent<br>• Right to erasure<br>• Data minimization |
| **Member Personal Data** (Tunisian) | Sensitive | • Consent for photos<br>• No unnecessary collection |
| **Content Data** | Public | • No restrictions on access |
| **System Credentials** | Confidential | • Never exposed to volunteers<br>• Quarterly rotation |
| **Audit Logs** | Internal | • Access limited to admins<br>• 90-day retention |

#### **GDPR Compliance Requirements**

- **For French/European members only**:
  - Double opt-in for email communications
  - Data subject request endpoint
  - Privacy notice in French/Arabic
  - Data processing agreement with Vercel/Backblaze
  - Data Protection Officer contact information

### **Implementation: Technical Safeguards**

#### **Data Minimization Practices**

```ts
// src/collections/Users.ts
fields: [
  {
    name: 'email',
    type: 'email',
    required: true,
    unique: true,
    admin: {
      position: 'sidebar',
    },
    // Never store unnecessary PII
    validate: (value) => {
      if (value.includes('@gmail.com') || value.includes('@yahoo.com')) {
        return 'Veuillez utiliser une adresse email professionnelle ou Rotary';
      }
      return true;
    }
  },
  // Only store essential information
  {
    name: 'displayName',
    type: 'text',
    required: true,
    admin: {
      position: 'sidebar',
    }
  },
  // NO phone numbers, addresses, or birthdates stored
]
```

#### **Photo Consent Enforcement**

```ts
// src/hooks/validateMedia.ts
import { CollectionBeforeValidateHook } from 'payload/types';

export const validateMedia: CollectionBeforeValidateHook = ({ data, req, operation }) => {
  // Only enforce for image uploads with people
  if (operation === 'create' && data.mimeType?.startsWith('image/') && !data.consentObtained) {
    throw new Error(
      'Vous devez confirmer avoir obtenu le consentement avant de publier des images contenant des personnes.'
    );
  }
  return data;
};
```

#### **GDPR Data Subject Requests**

```ts
// src/endpoints/gdpr.ts
import { Express } from 'express';

export default (app: Express) => {
  app.post('/api/gdpr/delete', async (req, res) => {
    if (!req.user || !req.body.email) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
      // Verify identity through additional means
      const verification = await sendVerificationCode(req.user.email);
      
      if (verification !== req.body.verificationCode) {
        return res.status(403).json({ error: 'Code de vérification incorrect' });
      }

      // Anonymize user data
      await req.payload.update({
        collection: 'users',
        id: req.user.id,
        data: {
          email: `deleted-${Date.now()}@example.com`,
          displayName: '[Compte supprimé]',
          personalData: null
        }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  });
};
```

---

## 🔑 **5. Secrets Management**

### **Policy: Handling Sensitive Credentials**

#### **Secrets Classification**

| Secret Type | Classification | Rotation Policy | Access Requirements |
|-------------|----------------|-----------------|---------------------|
| **PAYLOAD_SECRET** | Critical | Quarterly | Vercel environment variables only |
| **MONGODB_URI** | Critical | Immediately after breach | Dedicated DB user with least privilege |
| **S3_CREDENTIALS** | High | Monthly | Backblaze B2 app keys (not master keys) |
| **SENTRY_DSN** | Medium | As needed | Restricted to error monitoring |
| **EMAIL_API_KEYS** | Medium | Monthly | Limited to email provider |

#### **Golden Rules of Secrets Handling**

- **Never commit secrets to Git** (even in `.env` files)
- **Always use Vercel environment variables** (never local files)
- **Least privilege principle** for all service accounts
- **Secrets must be 32+ characters** (randomly generated)
- **No secrets in client-side code** (Next.js `public` variables)

### **Implementation: Secure Configuration**

#### **Vercel Environment Setup**

```bash
# REQUIRED ENVIRONMENT VARIABLES (VERCEL DASHBOARD)
PAYLOAD_SECRET="generate-64-random-chars-here"
MONGODB_URI="mongodb+srv://app-user:complex-password@cluster.mongodb.net/db?retryWrites=true&w=majority"
S3_BUCKET="rotary-tunis-media"
S3_ENDPOINT="https://s3.us-west-000.backblazeb2.com"
S3_ACCESS_KEY="your_backblaze_app_key_id"
S3_SECRET_KEY="your_backblaze_app_key"
SENTRY_DSN="https://public@o123456.ingest.sentry.io/1234567"
```

#### **Secret Rotation Procedure**

1. **Generate new secret** (32+ random characters)
2. **Update in Vercel dashboard** (all environments)
3. **Deploy new version** with updated secret
4. **Verify functionality** before removing old secret
5. **Document rotation** in security log

> ⚠️ **Critical Note**: PAYLOAD_SECRET rotation invalidates all existing sessions—coordinate with volunteers during off-hours.

#### **Database Security Configuration**

```ts
// MongoDB Atlas connection string best practices
const dbConfig = {
  url: process.env.MONGODB_URI,
  // Use dedicated user with least privilege
  user: 'app-user',
  // Never use admin user for application
  password: process.env.MONGODB_PASSWORD,
  // Enable TLS for data in transit
  options: {
    tls: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Restrict IP access where possible
    // (Vercel Egress IPs add-on recommended)
  }
};
```

---

## 💾 **6. Data Resilience & Backup Strategy**

### **Policy: Protecting Against Data Loss**

#### **Backup Requirements**

- **Frequency**: Nightly automated backups
- **Retention**: 30 days of rolling backups
- **Encryption**: All backups encrypted at rest
- **Verification**: Quarterly restore drills
- **Ownership**: Rotary Digital Steward responsible for verification

#### **Disaster Recovery Objectives**

| Metric | Target | Realistic for Non-Profit |
|--------|--------|--------------------------|
| **RPO** (Recovery Point Objective) | ≤ 24 hours | Achievable with nightly backups |
| **RTO** (Recovery Time Objective) | ≤ 4 hours | Requires documented restore process |
| **Verification** | Quarterly | Mandatory for board reporting |

### **Implementation: Backup System**

#### **Backup Process Flow**

```
1. GitHub Action triggers nightly at 2:00 AM CET
2. mongodump connects to MongoDB Atlas
3. Creates compressed archive of database
4. Encrypts archive using age encryption
5. Uploads to Backblaze B2 bucket
6. Verifies upload integrity
7. Logs success/failure to Sentry
```

#### **GitHub Action Configuration**

```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM CET daily
  workflow_dispatch:     # Manual trigger option

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install MongoDB Tools
        run: |
          sudo apt-get update
          sudo apt-get install -y mongodb-mongosh

      - name: Run Backup
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          AGE_KEY: ${{ secrets.AGE_KEY }}
          B2_ACCOUNT_ID: ${{ secrets.B2_ACCOUNT_ID }}
          B2_APPLICATION_KEY: ${{ secrets.B2_APPLICATION_KEY }}
        run: |
          # Create timestamped backup
          TIMESTAMP=$(date +%Y%m%d)
          mongodump --uri="$MONGODB_URI" --archive="backup-$TIMESTAMP.gz" --gzip
          
          # Encrypt with age (modern encryption)
          echo "$AGE_KEY" > age.key
          age -R age.key backup-$TIMESTAMP.gz -o backup-$TIMESTAMP.age
          
          # Upload to Backblaze B2
          b2 authorize-account $B2_ACCOUNT_ID $B2_APPLICATION_KEY
          b2 upload-file rotary-tunis-backups backup-$TIMESTAMP.age backups/backup-$TIMESTAMP.age
          
          # Cleanup
          rm backup-$TIMESTAMP.gz age.key
```

#### **Restore Procedure**

1. Download encrypted backup from Backblaze B2
2. Decrypt using `age` tool:

   ```bash
age -d -i age.key -o backup-decrypted.gz backup-20231015.age
```

3. Restore to staging environment:

   ```bash
mongorestore --uri="$STAGING_MONGODB_URI" --gzip --archive=backup-decrypted.gz
```

4. Verify content integrity
5. If approved, promote to production

> 💡 **Pro Tip**: Conduct quarterly restore drills with the Rotary Digital Steward to ensure readiness.

---

## 🕵️ **7. Monitoring & Incident Response**

### **Policy: Detecting and Responding to Threats**

#### **Monitoring Requirements**

- **Real-time alerts** for critical security events
- **Quarterly vulnerability scanning**
- **Monthly access review reports**
- **Annual security audit** by qualified third party
- **Incident response plan** tested annually

#### **Incident Classification**

| Severity | Criteria | Response Time |
|----------|----------|---------------|
| **Critical** | Data breach, secret leakage | < 1 hour |
| **High** | Unauthorized access, data corruption | < 4 hours |
| **Medium** | Failed login attempts, policy violations | < 24 hours |
| **Low** | Configuration warnings, informational | < 72 hours |

### **Implementation: Security Monitoring**

#### **Sentry Configuration**

```ts
// src/payload.config.ts
admin: {
  bundler: webpackBundler({
    sentry: {
      dsn: process.env.SENTRY_DSN,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      environment: process.env.VERCEL_ENV,
      ignoreErrors: [
        // Common browser noise
        /ResizeObserver loop limit exceeded/,
        /Non-Error promise rejection captured/,
        // Tunisian network issues
        /NetworkError when attempting to fetch resource/
      ],
      beforeSend(event) {
        // Redact sensitive information
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      }
    }
  })
}
```

#### **Critical Alerting Rules**

| Event | Alert Channel | Recipients | Action Required |
|-------|---------------|------------|-----------------|
| **5+ failed logins** | Slack + Email | Security Lead | Lock account, contact user |
| **Admin role change** | Slack + SMS | Board Security Contact | Verify authorization |
| **Secrets exposure** | SMS + Email | CISO | Immediate rotation |
| **Backup failure** | Email | Digital Steward | Investigate within 24h |
| **Data deletion** | Slack | Content Manager | Verify intent |

#### **Incident Response Playbook**

1. **Containment**: Isolate affected systems
   - Disable compromised accounts
   - Roll secrets immediately
   - Take affected services offline if necessary

2. **Assessment**: Determine scope and impact
   - Review audit logs
   - Identify affected data
   - Classify incident severity

3. **Notification**: Inform appropriate parties
   - Rotary board within 1 hour of critical incidents
   - Affected members per GDPR requirements
   - Authorities if required by law

4. **Remediation**: Fix the root cause
   - Patch vulnerabilities
   - Update security policies
   - Enhance monitoring

5. **Review**: Document lessons learned
   - Full incident report within 7 days
   - Update security handbook
   - Train team on prevention

> 💡 **Critical Process**: All incidents must be documented in the Security Incident Log with French/Arabic descriptions.

---

## 📜 **8. Compliance & Governance**

### **Policy: Meeting Regulatory Requirements**

#### **Applicable Regulations**

| Regulation | Scope | Rotary Tunisia Requirements |
|------------|-------|------------------------------|
| **GDPR** | French/European members | • Consent management<br>• Right to erasure<br>• Data processing agreement |
| **Tunisian Data Law** | Tunisian members | • Basic consent for photos<br>• No unnecessary data collection |
| **Rotary International Policy** | All content | • Brand compliance<br>• Impact reporting standards |
| **Vercel Terms of Service** | Technical infrastructure | • Acceptable use policy<br>• Resource limitations |

#### **Compliance Verification**

- **Quarterly**: Access review and backup verification
- **Biannually**: Security configuration audit
- **Annually**: Full compliance assessment
- **After incidents**: Targeted compliance review

### **Implementation: Governance Framework**

#### **Security Roles & Responsibilities**

| Role | Responsibilities | Accountability |
|------|------------------|----------------|
| **Rotary Board** | • Approve security policy<br>• Budget for security needs<br>• Review incident reports | Ultimate accountability |
| **Digital Steward** | • Day-to-day security management<br>• Backup verification<br>• Incident response coordination | Operational accountability |
| **Tech Lead** | • Implement security controls<br>• Conduct vulnerability scans<br>• Maintain documentation | Technical accountability |
| **All Volunteers** | • Follow security policies<br>• Report suspicious activity<br>• Complete annual training | Individual accountability |

#### **Annual Security Checklist**

```markdown
# ROTARY CLUB TUNIS DOYEN SECURITY CHECKLIST

## [ ] Q1: Access Review
- [ ] Verified user list matches current members
- [ ] Disabled inactive accounts (>90 days)
- [ ] Confirmed no unauthorized role changes

## [ ] Q2: Backup Verification
- [ ] Successfully restored backup to staging
- [ ] Verified content integrity after restore
- [ ] Documented restore process improvements

## [ ] Q3: Policy Compliance
- [ ] Confirmed GDPR compliance for French members
- [ ] Verified photo consent for all images
- [ ] Updated terminology per cultural guidelines

## [ ] Q4: Training & Awareness
- [ ] Completed annual security training
- [ ] Documented new volunteer onboarding process
- [ ] Updated security handbook with lessons learned
```

#### **Volunteer Security Training Requirements**

- **Mandatory for all content editors**
- **Conducted annually** (or upon onboarding)
- **Available in French with Arabic glossary**
- **Includes practical scenarios**:
  > *"Que faire si vous recevez un email demandant votre mot de passe?"*  
  > *"Comment vérifier que vous êtes sur le vrai site Rotary?"*

---

## 📋 **9. Living Document Governance**

### **Maintenance Protocol**

- **Version Control**: Tag with date and changelog (e.g., "v1.1 - 2023-10-15: Added Tunisia-specific GDPR guidance")
- **Storage**: Maintain in shared knowledge base (Notion recommended) with version history
- **Review Cadence**:
  - Monthly: Update with lessons learned
  - Quarterly: Full review with Digital Steward
  - Annually: Board-level policy review

### **Critical Update Triggers**

- [ ] New Tunisia-specific regulation identified
- [ ] Security incident occurs
- [ ] Volunteer reports usability/security conflict
- [ ] Technology stack changes
- [ ] After each quarterly backup restore drill

### **Document Approval Process**

| Action | Responsible | Timeline | Approval Required |
|--------|-------------|----------|-------------------|
| Initial creation | Tech Lead | Before development | Board + Digital Steward |
| Monthly updates | Digital Steward | First Monday monthly | Tech Lead |
| Major revisions | CISO Consultant | After security incidents | Board |
| Annual review | Board Security Committee | Q4 each year | Full Board |

---

## ✅ **10. Security Sign-off Template**

```markdown
# ROTARY CLUB TUNIS DOYEN SECURITY POLICY ACKNOWLEDGEMENT

I, the undersigned, acknowledge that I have read and understand the Rotary Club Tunis Doyen Security & Compliance Handbook:

_________________________
Full Name
Date: _________

_________________________
Role (Admin/Editor)
Date: _________

## My Security Responsibilities:
- [ ] I will not share my login credentials with anyone
- [ ] I will report suspicious activity immediately
- [ ] I will obtain proper consent before uploading photos with people
- [ ] I will complete annual security training
- [ ] I will follow all documented security procedures

## Emergency Contacts:
- Digital Steward: [name] • [phone] • [email]
- Tech Lead: [name] • [phone] • [email]
- Board Security Contact: [name] • [phone] • [email]
```

---

## 💡 **Final Security Philosophy**

> **"In non-profit work, security isn't about protecting data—it's about protecting trust. Every security decision must answer: 'Does this help Rotary volunteers serve their community with confidence?'"**

This handbook ensures:

- ✅ **GDPR compliance** for European members while respecting Tunisian context
- ✅ **Volunteer-friendly security** that doesn't create barriers to service
- ✅ **Data resilience** through tested backup and restore procedures
- ✅ **Accountability** through clear roles and documented processes
- ✅ **Sustainability** through knowledge transfer and documentation

> 🔐 **Remember**: Security is everyone's responsibility. When in doubt, ask the Digital Steward before proceeding—your caution protects Rotary's mission.
 in doubt, ask the Digital Steward before proceeding—your caution protects Rotary's mission.
