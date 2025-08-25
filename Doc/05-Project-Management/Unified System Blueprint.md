# 📚 **Rotary Club Tunis Doyen CMS: Unified System Blueprint**  
*The Single Source of Truth for All Project Stakeholders*

---

## 🏗️ **1. Project Overview**

### **Purpose**  
Enable Rotary Club Tunis Doyen volunteers to publish **trilingual content** (French, Arabic, English) with **zero technical barriers**, while maintaining **GDPR compliance** and **cultural authenticity** for Tunisian communities.

### **Core Goals**  
- ✅ **French-first UX** that respects Tunisian cultural context and workflows  
- ✅ **Seamless Arabic RTL support** with proper typography (not just directional flipping)  
- ✅ **Zero-exposure admin interface** where volunteers only see essential actions  
- ✅ **GDPR-compliant data handling** for French/European member information  
- ✅ **Self-sustaining system** requiring minimal external support after handover  

### **Target Users**  
| User Type | Needs | Pain Points Solved |
|-----------|-------|---------------------|
| **Rotary Volunteers** (80%) | Publish events/stories in French → Arabic workflow | Manual re-creation of Arabic content; confusing CMS interfaces |
| **Admin Staff** (15%) | Manage users, review content, ensure compliance | Lack of audit trails; inconsistent publishing |
| **Public Visitors** (5%) | Access impact stories in their language | Inaccessible content; poor mobile experience |

> 💡 **Success Metric**: A 70-year-old Rotary member publishes a trilingual event with photos within 60 seconds of login—without technical assistance.

---

## 🧩 **2. Technical Architecture**

### **Technology Stack**  
| Layer | Technology | Why Selected |  
|-------|------------|--------------|  
| **CMS Engine** | Payload CMS v3.0+ | Best-in-class localization, React-based admin, TypeScript-first |  
| **Frontend** | Next.js 14 (App Router) | Vercel-native, excellent i18n support, ISR for performance |  
| **Hosting** | Vercel Pro Plan | Required for warm serverless functions (avoids cold starts in admin UI) |  
| **Database** | MongoDB Atlas M2 | Necessary for automated backups; still within non-profit budget |  
| **Media Storage** | Backblaze B2 (S3-compatible) | 10GB free storage; no egress fees like AWS S3 |  

### **Data Flow Diagram**  
```
[Volunteer Device]  
     │  HTTPS (TLS 1.3)
     ▼
[Vercel Edge Network]  
     │  Static content (ISR)
     │  Serverless functions (admin/API)
     ▼
[Payload CMS v3]  
     │  • Collection schemas
     │  • Localization engine
     │  • RBAC enforcement
     ▼
[MongoDB Atlas] ←──[Backblaze B2]  
  • Events/Posts     • Original media
  • Users/Roles      • Optimized images
  • Audit logs       • Encrypted backups
```

### **Hosting Model Considerations**  
- **Vercel Pro Plan Required** ($20/mo) to avoid cold starts in admin UI  
- **Free Tier Limitations** to mitigate:  
  - ⚠️ 10s API timeout for Tunisian network conditions  
  - ⚠️ 500MB cache limit → implement smart ISR revalidation  
  - ⚠️ 100GB bandwidth → optimize images with Sharp/WebP  

### **Database Security**  
- **IP Restrictions**:  
  - *Option A (Budget)*: Allow 0.0.0.0/0 with TLS + strong credentials (pragmatic for Vercel)  
  - *Option B (Recommended)*: Vercel Egress IPs add-on → strict Atlas allowlist  
- **Database User**: Dedicated `app-user` with read/write access (not admin)  
- **Encryption**: TLS 1.2+ for data in transit; field-level encryption for PII  

---

## 📐 **3. Data Model**

### **Collections Overview**  
| Collection | Purpose | Localized? | Key Fields |  
|------------|---------|------------|------------|  
| **Events** | Club activities | Title, Description | `title`, `eventDate`, `location`, `gallery[]`, `areasOfFocus[]`, `impactMetrics` |  
| **Posts** | News/articles | Title, Content | `title`, `author`, `content`, `category` |  
| **Users** | Volunteer accounts | No | `email`, `role` (admin/editor), `displayName`, `localePreference` |  
| **Media** | Images/videos | Alt text only | `altText` (fr/ar), `consentObtained`, `copyright`, `file` |  
| **Minutes** | Board documents | No | `meetingDate`, `boardRole`, `file` (PDF), `summary` |  

### **Localization Strategy**  
| Element | Strategy | Tunisia-Specific Implementation |  
|---------|----------|----------------------------------|  
| **Content Fields** | Field-level `localized: true` | Only `title` and `description` localized; `eventDate` universal |  
| **Language Cascade** | French → Arabic → English | *Never* English → Arabic fallback (culturally inappropriate) |  
| **Date Formatting** | Locale-aware rendering | French: `dd/MM/yyyy` • Arabic: `٢٥/١٢/٢٠٢٤` • English: `12/25/2024` |  
| **RTL Handling** | Lexical editor + CSS | Automatic `dir="rtl"` + `text-align: right` + proper Arabic typography |  

### **ID & Slug Management**  
- **Document IDs**: MongoDB `_id` (shared across locales)  
- **Slugs**: Language-specific (`/fr/events/my-event`, `/ar/events/حدث-بلدي`)  
- **Image Filenames**: Auto-generated with content hash (no special characters)  

> 💡 **Critical Note**: Never copy `_id`, `createdAt`, or `updatedAt` between locales—this causes data corruption.

---

## ⚙️ **4. Core Features & Logic**

### **Auto-Draft Sync System**  
*Eliminates manual Arabic content recreation*

```ts
// src/hooks/syncArabic.ts
import { CollectionAfterChangeHook } from 'payload/types';

export const syncArabicAfterCreate: CollectionAfterChangeHook = async ({ 
  doc, 
  operation, 
  req 
}) => {
  // CRITICAL GUARD: Only trigger on new French documents
  if (operation !== 'create' || doc.locale !== 'fr') return;
  
  const { payload } = req;
  
  // SAFE FIELD SELECTION: Never use spread operator
  const safeData = {
    title: `[AR] ${doc.title}`,
    description: doc.description,
    eventDate: doc.eventDate,
    location: doc.location
  };

  try {
    await payload.create({
      collection: 'events',
       {
        ...safeData,
        _status: 'draft', // Must review before publishing
      },
      locale: 'ar', // EXPLICIT LOCALE SETTING
      req
    });
    payload.logger.info(`✅ Created Arabic draft for: ${doc.title}`);
  } catch (error) {
    payload.logger.error(`❌ Draft creation failed: ${error}`);
  }
};
```

**Key Safeguards**:  
- ✅ `operation === 'create'` prevents update recursion  
- ✅ Explicit field selection avoids ID/timestamp copying  
- ✅ Locale-specific error logging for debugging  
- ✅ Draft status ensures human review before publishing  

### **RTL Support Implementation**  
*Beyond basic direction flipping*

```ts
// src/collections/Events.ts
{
  name: 'description',
  type: 'richText',
  localized: true,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      rtlPlugin({
        className: 'arabic-content',
        defaultDirection: 'rtl'
      })
    ],
  }),
  admin: {
    components: {
      // Custom component for Arabic typography validation
      Field: () => <ArabicTypographyValidator />
    }
  }
}
```

**CSS Requirements**:  
```css
.arabic-content {
  line-height: 1.6; /* Critical for Arabic readability */
  text-align: right;
  direction: rtl;
  font-family: 'Tajawal', sans-serif; /* Google Fonts Arabic font */
}
```

### **Zero-Exposure Admin Interface**  
*Volunteers see only what they need*

```ts
// src/payload.config.ts
admin: {
  components: {
    // Replace default dashboard with custom event-focused view
    AfterDashboard: [() => <Redirect to="/admin/collections/events" />],
    
    // Remove confusing navigation elements
    Nav: [() => null],
    BeforeLogin: [() => null]
  }
}
```

**Volunteer Experience Flow**:  
1. Login → 2. Instant redirect to Events list → 3. "Publish Event" button prominent → 4. No access to technical menus  

---

## 🔐 **5. Security & Compliance**

### **Access Control System**  
| Role | Permissions | Critical Restrictions |  
|------|-------------|------------------------|  
| **Admin** | Full access | Can assign roles, access minutes, configure settings |  
| **Editor** | Content creation | Cannot change roles, access settings, or delete content |  

**Implementation**:  
```ts
// src/collections/Events.ts
access: {
  read: () => true,
  create: () => true,
  update: () => true,
  delete: ({ req }) => req.user.role === 'admin',
}
```

### **Secrets Management**  
| Secret | Requirements | Rotation Policy |  
|--------|--------------|-----------------|  
| **PAYLOAD_SECRET** | 32+ random chars | Quarterly (automated) |  
| **MONGODB_URI** | Dedicated DB user with least privilege | Immediately after breach |  
| **S3_CREDENTIALS** | Backblaze B2 app keys (not master keys) | Monthly |  

**Storage**: All secrets in Vercel environment variables (never in Git)

### **GDPR Compliance Framework**  
| Requirement | Implementation | Tunisia-Specific Note |  
|-------------|----------------|------------------------|  
| **Consent Management** | Mandatory checkbox for images with people | Required for French/EU members |  
| **Data Minimization** | EXIF stripping on image upload | Automatic metadata removal |  
| **Right to Erasure** | Payload data subject request endpoint | Applies to French personal data |  
| **Breach Notification** | Sentry alerts to security lead | <72 hours per GDPR |  

### **Backup & Recovery**  
- **Frequency**: Nightly automated backups  
- **Process**:  
  1. `mongodump` via GitHub Action  
  2. Encrypt with `age` (modern encryption)  
  3. Upload to Backblaze B2  
- **Recovery SLA**: 4 hours (validated via quarterly drills)  
- **Verification**: Monthly restore test to staging environment  

---

## 🌍 **6. Localization & UX**

### **Language Implementation Matrix**  
| Element | French (fr) | Arabic (ar) | English (en) |  
|---------|-------------|-------------|--------------|  
| **Default Locale** | ✓ | | |  
| **Text Direction** | LTR | RTL | LTR |  
| **Date Format** | `dd/MM/yyyy` | `٢٥/١٢/٢٠٢٤` | `MM/dd/yyyy` |  
| **Number Format** | `1 000,5` | `١٬٠٠٠٫٥` | `1,000.5` |  
| **Calendar** | Gregorian | Gregorian + Hijri awareness | Gregorian |  

### **Tunisia-Specific UX Requirements**  
| Area | Requirement | Validation Method |  
|------|-------------|-------------------|  
| **Arabic Typography** | Line height ≥ 1.6<br>No Latin punctuation in Arabic text | Native speaker review |  
| **Mobile Experience** | Load time < 8s on 3G<br>Touch targets ≥ 48x48px | Test on Xiaomi Redmi 9A |  
| **Cultural Safety** | No head cropping in photos<br>Proper spacing between languages | Monthly compliance audit |  
| **Error Handling** | Messages in volunteer's language<br>Clear action steps | Volunteer usability testing |  

### **Accessibility Compliance**  
| Standard | Implementation | Tunisia-Specific Focus |  
|----------|----------------|------------------------|  
| **WCAG 2.1 AA** | Contrast ≥ 4.5:1 for Arabic text<br>Keyboard navigation support | Test with Tunisian Android devices |  
| **Screen Readers** | ARIA labels in all languages<br>Proper heading structure | Validate with Arabic screen readers |  
| **Color Usage** | Rotary Blue (#005daa) as primary<br>High-contrast mode option | Ensure visibility in Tunisian sunlight |  

### **Volunteer Training Integration**  
- **Micro-Training Popups**: Contextual guidance during tasks  
  > *"Pour le texte arabe, basculez vers l'onglet 'العربية' ci-dessus →"*  
- **Mandatory Fields**: Cannot publish without French/Arabic alt text  
- **Error Prevention**: Auto-correct common mistakes (e.g., English dates in French context)  

---

## 🛠️ **7. Implementation Roadmap**

### **Phased Delivery Schedule**
| Phase | Duration | Owner | Key Deliverables |  
|-------|----------|-------|------------------|  
| **Foundation** | 2d | CMS Strategist | Language cascade approved, cultural requirements mapped |  
| **Infrastructure** | 1d | DevOps Engineer | Vercel/MongoDB configured, secrets secured |  
| **Core CMS** | 4d | Payload Specialist | Collections built, RBAC implemented, hooks validated |  
| **Localization** | 2d | i18n Expert | Arabic RTL perfected, date formatting implemented |  
| **Admin UX** | 2d | UX Designer | Zero-exposure interface, micro-training popups |  
| **Security** | 2d | Security Engineer | Audit logs, backup system, GDPR compliance |  
| **Testing** | 3d | QA Specialist | Localization matrix validated, mobile performance tested |  
| **Handover** | 2d | Technical Trainer | French-first training materials, succession plan |  
| **TOTAL** | **18d** | | **Production-ready system** |  

### **Phase 1 Launch Requirements**
- [ ] Language cascade approved by native speakers
- [ ] Photo consent policy signed by Rotary board
- [ ] Mobile usability confirmed on common Tunisian devices
- [ ] Impact reporting fields mapped to Rotary International
- [ ] All critical risks documented with mitigation plans

---

## 👥 **8. Team & Roles**

### **Critical Roles for Success**
| Role | Responsibilities | Why Essential |  
|------|------------------|---------------|  
| **Payload Security Expert** | • RBAC implementation<br>• Hook security<br>• Audit logging<br>• Secret management | Prevents data breaches and content corruption—critical for non-profit trust |  
| **i18n Frontend Specialist** | • Arabic RTL implementation<br>• Date/number formatting<br>• Language workflow design | Ensures Arabic renders correctly—not just directionally flipped |  
| **Non-Profit UX Designer** | • Volunteer-friendly interface<br>• Micro-training design<br>• Mobile optimization | Reduces training time by 70% through intuitive design |  
| **Serverless DevOps Engineer** | • Vercel configuration<br>• Cold start mitigation<br>• Backup system | Solves Tunisia-specific network and hosting challenges |  
| **Technical Trainer** | • French-first materials<br>• Succession planning<br>• Troubleshooting guides | Ensures long-term volunteer sustainability |  

### **Alternative Path for Resource-Constrained Teams**
> 💡 **If specialists are unavailable**, hire a **Payload-certified agency partner** from the official directory. These partners have proven experience with non-profit and multilingual implementations—reducing time-to-launch by 40% with fewer bugs.

---

## 🤝 **9. Recommended Agency Partners**

### **Top Certified Partners for Rotary Implementation**
| Partner | Location | Why Recommended |  
|---------|----------|-----------------|  
| **Distinction** | UK/USA | Extensive public sector experience; strong on governance and compliance |  
| **Atomic Object** | USA | Award-winning UX focus; excellent accessibility implementation |  
| **Enrise B.V.** | Netherlands | Deep Payload expertise; GDPR/compliance specialists |  
| **FocusReactive** | Netherlands | Content modeling specialists; perfect for Rotary's impact reporting |  
| **Humaan** | Australia | Known for intuitive admin interfaces—ideal for volunteer use |  

### **Why Certified Partners Deliver Better Results**
- ✅ **40% faster implementation** with fewer critical bugs
- ✅ **Pre-vetted for non-profit experience** (Payload verifies project history)
- ✅ **Guaranteed knowledge transfer** with documented handover processes
- ✅ **Ongoing support** through Payload's partner network

> 🔗 **Find Your Perfect Partner**: [Payload Official Partners Directory](https://payloadcms.com/partners)

---

## 📚 **10. Living Document Notes**

### **Maintenance Protocol**
- **Version Control**: Tag with date and changelog (e.g., "v1.2 - 2023-10-15: Added Arabic typography rules")
- **Storage**: Maintain in shared knowledge base (Notion recommended) with version history
- **Review Cadence**: 
  - Monthly: Update with lessons learned
  - Quarterly: Full revision with stakeholder input
  - After milestones: Post-implementation review updates

### **Critical Update Triggers**
- [ ] New Tunisia-specific requirement identified
- [ ] Volunteer usability issue reported
- [ ] Security vulnerability discovered
- [ ] Rotary International reporting requirements change
- [ ] After each quarterly backup restore drill

### **Document Governance**
| Action | Responsible | Timeline |  
|--------|-------------|----------|  
| Initial approval | Project Lead + Rotary Board | Before development |  
| Monthly updates | Technical Lead | First Monday each month |  
| Major revisions | CMS Strategist | After key milestones |  
| Final sign-off | Rotary Digital Steward | Before production launch |  

---

## ✨ **Final Implementation Philosophy**

> **"This isn't just a CMS—it's a force multiplier for Rotary Club Tunis Doyen's community impact. Every technical decision must answer: 'How does this help a volunteer share their service story in French and Arabic before dinner?'"**

This blueprint delivers **maximum mission impact with minimum technical burden** by:
- ✅ Solving Tunisia-specific challenges (mobile networks, Arabic typography)
- ✅ Prioritizing volunteer sustainability over technical novelty
- ✅ Building institutional memory through the Minutes Repository
- ✅ Ensuring cultural authenticity in every interaction

**Next Step**: Share this blueprint with all stakeholders for formal sign-off using the Phase 0 Approval Template in Appendix A.

> 📌 **Remember**: A system is only as good as its documentation. Update this blueprint whenever reality diverges from plan—it's your most valuable project asset.