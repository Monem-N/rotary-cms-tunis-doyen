# 📚 **Code Standards & Patterns Developer Documentation**  

## *Official Coding Standard for Rotary Club Tunis Doyen CMS*

> **"This isn't just code—it's the foundation that enables Rotary volunteers to share their impact stories without technical barriers. Every line must respect Tunisia's linguistic reality and non-profit constraints."**  
> *Follow this guide for all development, maintenance, and partner collaboration.*

---

## 🧱 **1. Core Principles**

### **Our Non-Negotiable Development Foundation**

These principles guide every code decision and must be upheld without exception:

1. **Clarity Over Cleverness**  
   > *Code should be easily understood by developers with intermediate TypeScript knowledge. If a junior developer can't grasp your code in 5 minutes, refactor it.*

2. **Consistency with Payload Conventions**  
   > *Follow Payload's official patterns—not custom hacks. When in doubt, consult [Payload Docs](https://payloadcms.com/docs) before implementing.*

3. **Security-First Implementation**  
   > *All access controls must be server-side. Client-side hiding is for UX only—not security. Tunisian volunteers shouldn't need to understand security to use the system safely.*

4. **Volunteer-Friendly Maintenance**  
   > *Assume future maintainers may have limited time or expertise. Code should survive volunteer turnover—documentation is as important as implementation.*

5. **Type Safety Everywhere**  
   > *Zero `any` types permitted. Leverage Payload's auto-generated types (`payload-types.ts`) for complete type safety across the system.*

---

## 📁 **2. Project Structure & File Organization**

### **Predictable, Tunisia-Optimized Layout**

```
/src
  /collections     → All collection configs (Events, Posts, Users)
    Events.ts
    Media.ts
    Minutes.ts
    Posts.ts
    Users.ts
  /components      → React components (admin UI overrides)
    AfterLogin.tsx
    ArabicTypographyValidator.tsx
    RoleBadge.tsx
  /hooks           → Custom Payload hooks
    syncArabic.ts
    validateMedia.ts
  /types           → Global TypeScript interfaces
    rotary.d.ts
  /utilities       → Reusable functions
    dateFormats.ts
    security.ts
  /payload.config.ts → Main config (with Tunisia-specific settings)
  /payload-types.ts → Auto-generated (never edit manually)
```

### **Critical Tunisia-Specific Organization Rules**

| Practice | Example | Why Tunisia-Specific |
|----------|---------|----------------------|
| **PascalCase for collection files** | `Events.ts`, `Minutes.ts` | Ensures consistency across team with French/Arabic speakers |
| **Group Tunisia-specific components** | `ArabicTypographyValidator.tsx` | Critical for proper Arabic rendering in Tunisian context |
| **Separate localization utilities** | `dateFormats.ts` | Ensures Tunisian date formats (`dd/MM/yyyy`) are enforced consistently |
| **Never nest collections** | ❌ `/collections/content/events.ts`<br>✅ `/collections/Events.ts` | Simplifies maintenance for non-technical future stewards |

> 💡 **Pro Tip**: All Tunisia-specific components must include Arabic/French comments explaining their purpose for future volunteer maintainers.

---

## 💬 **3. Naming Conventions**

### **Standardized Naming for Cross-Language Clarity**

| Element | Convention | Example | Tunisia-Specific Reason |
|---------|------------|---------|--------------------------|
| **Variables & Functions** | `camelCase` | `syncArabicAfterCreate` | Clear readability for French/English speakers |
| **Types & Interfaces** | `PascalCase` | `EventDocument` | Matches TypeScript conventions for non-French speakers |
| **Collections** | Singular, capitalized slug | `slug: 'events'` → `Events.ts` | Consistent with Payload docs and French terminology |
| **Hooks** | Suffix with `Hook`/`AfterChange` | `syncArabicAfterCreate` | Clear purpose identification for volunteer maintainers |
| **Arabic-Specific Components** | Prefix with `Arabic` | `ArabicTypographyValidator` | Ensures immediate recognition of RTL-specific code |

### **Tunisia-Specific Naming Anti-Patterns**

```ts
// ❌ AVOID: French-English hybrid naming (confuses all volunteers)
const createArabeDraft = () => { ... }

// ❌ AVOID: Abbreviations (not clear to non-native speakers)
const syncArAfterCr = () => { ... }

// ✅ PREFERRED: Clear, descriptive English (understood by all)
const syncArabicAfterCreate = () => { ... }
```

> 💡 **Why English for code?**  
> *While our content is trilingual, code should use standardized English terms to ensure consistency with Payload's API and global developer resources.*

---

## 🧩 **4. Payload-Specific Patterns**

### **✅ Preferred: Payload's Built-In Localization (Tunisia-Optimized)**

```ts
// src/collections/Events.ts
{
  name: 'title',
  type: 'text',
  required: true,
  localized: true,
  admin: {
    description: 'Titre de l\'événement en français, arabe et anglais'
  }
}
```

> ✅ **Why This Works for Tunisia**:  
>
> - Clean implementation matches Payload's API design  
> - Properly handles locale switching without custom hacks  
> - Ensures consistent API responses across languages  
> - Built-in fallback system respects Tunisia's language cascade (French → Arabic → English)  
> - Avoids data duplication and query complexity of manual fields  

### **❌ Avoid: Manual Language Fields**

```ts
// src/collections/Events.ts
{
  name: 'titleFr',
  type: 'text',
  required: true
},
{
  name: 'titleAr',
  type: 'text',
  required: true
},
{
  name: 'titleEn',
  type: 'text'
}
```

> ❌ **Why This Fails for Tunisia**:  
>
> - Breaks API consistency (requires custom querying)  
> - Creates maintenance burden for future volunteers  
> - No built-in fallback system (must implement manually)  
> - Complicates the French → Arabic auto-draft workflow  
> - Requires duplicate validation rules for each language field  

### **✅ Tunisia-Specific Localization Enhancement**

```ts
// src/payload.config.ts
localization: {
  locales: [
    { 
      label: 'Français', 
      value: 'fr',
      rtl: false 
    },
    { 
      label: 'العربية', 
      value: 'ar',
      rtl: true 
    },
    { 
      label: 'English', 
      value: 'en',
      rtl: false 
    }
  ],
  defaultLocale: 'fr',
  fallback: true,
  // Critical Tunisia-specific cascade
  fallbackLocale: {
    fr: ['ar', 'en'],
    ar: ['fr', 'en'],
    en: []
  }
}
```

> ✅ **Why Tunisia-Specific Configuration Matters**:  
>
> - Explicit RTL flags ensure proper Arabic typography (not just direction)  
> - French → Arabic fallback respects Tunisian linguistic reality  
> - Never uses English as fallback for Arabic content (culturally inappropriate)  
> - Labels in native scripts help volunteers identify languages  

---

## 🔁 **5. Hook Best Practices**

### **✅ Preferred: Safe `afterChange` Hook with Tunisia-Specific Guards**

```ts
// src/hooks/syncArabic.ts
import { CollectionAfterChangeHook } from 'payload/types';

export const syncArabicAfterCreate: CollectionAfterChangeHook = async ({ 
  doc, 
  operation, 
  req 
}) => {
  // CRITICAL TUNISIA-SPECIFIC GUARDS
  if (operation !== 'create' || doc.locale !== 'fr') return;
  
  const { payload } = req;
  
  // SAFE FIELD SELECTION (never use spread operator)
  const safeData = {
    title: `[AR] ${doc.title}`,
    description: doc.description,
    eventDate: doc.eventDate,
    location: doc.location,
    gallery: doc.gallery
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

> ✅ **Tunisia-Specific Hook Rules**:  
>
> 1. **Always check `operation` and `locale`** - Prevents infinite loops and data corruption  
> 2. **Never use spread operator** - Avoids copying `_id`, `createdAt`, `updatedAt`  
> 3. **Explicit field selection** - Ensures only safe fields are copied  
> 4. **Locale-specific logging** - Critical for debugging in multilingual context  
> 5. **Async error containment** - Prevents hook failure from blocking other hooks  

### **❌ Avoid: Unbounded Hooks with Tunisia-Specific Risks**

```ts
// src/hooks/syncArabic.ts
const syncArabicAfterChange: AfterChangeHook = async ({ doc, req }) => {
  // ❌ NO OPERATION CHECK → triggers on updates → infinite loop risk
  // ❌ NO LOCALE CHECK → triggers for all languages → duplicate drafts
  await req.payload.create({
    collection: 'events',
    data: {
      ...doc, // ❌ DANGEROUS SPREAD → copies _id and timestamps
      locale: 'ar',
      _status: 'draft',
    }
  });
  return doc;
};
```

> ❌ **Why This Fails for Tunisia**:  
>
> - **Infinite loops**: Creating Arabic draft triggers another hook call  
> - **Data corruption**: Spread operator copies `_id`, causing ID collisions  
> - **Duplicate drafts**: No locale guard creates drafts for Arabic→French  
> - **Broken publishing**: Timestamps copied from French → Arabic version  
> - **No error handling**: Fails silently, confusing volunteers  

---

## 🌍 **6. Localization & RTL Patterns**

### **✅ Preferred: Lexical Editor with Tunisia-Specific RTL Configuration**

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
      // Tunisia-specific Arabic typography validator
      Field: () => <ArabicTypographyValidator />
    }
  }
}
```

> ✅ **Why This Works for Tunisia**:  
>
> - Proper RTL implementation (not just direction flipping)  
> - Automatic `dir="rtl"` injection for Arabic content  
> - Visual validation component helps volunteers spot issues  
> - `arabic-content` class enables Tunisia-specific CSS rules  
> - Works with Payload's native localization system  

### **✅ Tunisia-Specific Arabic Typography Validation**

```tsx
// src/components/ArabicTypographyValidator.tsx
import React from 'react';

const ArabicTypographyValidator: React.FC = () => {
  const [isValid, setIsValid] = React.useState(true);
  
  React.useEffect(() => {
    const checkArabicTypography = () => {
      const content = document.querySelector('.arabic-content');
      if (!content) return;
      
      const style = window.getComputedStyle(content);
      const lineHeight = parseFloat(style.lineHeight);
      const direction = style.direction;
      
      // Tunisia-specific Arabic typography rules
      const isValidTypography = (
        lineHeight >= 1.6 &&
        direction === 'rtl'
      );
      
      setIsValid(isValidTypography);
    };
    
    // Check on mount and when content changes
    checkArabicTypography();
    const observer = new MutationObserver(checkArabicTypography);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => observer.disconnect();
  }, []);

  if (isValid) return null;
  
  return (
    <div className="arabic-warning">
      <strong>⚠️ Problème de typographie arabe :</strong>
      <ul>
        <li>Hauteur de ligne doit être ≥ 1.6</li>
        <li>Direction doit être RTL</li>
      </ul>
      <p>Veuillez vérifier avec un locuteur natif avant publication</p>
    </div>
  );
};

export default ArabicTypographyValidator;
```

> ✅ **Why This Matters for Tunisia**:  
>
> - Enforces minimum line height (1.6) for Arabic readability  
> - Validates proper RTL direction (not just alignment)  
> - Provides clear French error messages for volunteers  
> - Prevents broken Arabic rendering that would make content unusable  
> - Respects Tunisian cultural context in content presentation  

### **✅ Tunisia-Specific Date Formatting**

```ts
// src/collections/Events.ts
{
  name: 'eventDate',
  type: 'date',
  required: true,
  admin: {
    date: {
      pickerAppearance: 'dayOnly',
      // Tunisia-specific date format
      displayFormat: 'dd/MM/yyyy'
    }
  }
}
```

```ts
// src/utilities/dateFormats.ts
// French date formatting (Tunisian standard)
export const formatFrenchDate = (date: Date) => 
  new Intl.DateTimeFormat('fr-TN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);

// Arabic date formatting (Tunisian standard)
export const formatArabicDate = (date: Date) => 
  new Intl.DateTimeFormat('ar-TN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
```

> ✅ **Why Tunisia-Specific Date Formatting Matters**:  
>
> - Matches Tunisian expectations (`dd/MM/yyyy` not American `MM/dd/yyyy`)  
> - Proper Arabic numerals for Tunisian context (٢٥/١٢/٢٠٢٤)  
> - Prevents confusion among volunteers who aren't used to American formats  
> - Ensures consistency across admin and frontend interfaces  
> - Respects cultural norms for date presentation  

---

## 🔐 **7. Security & Access Control**

### **✅ Preferred: Server-Side Role Checks with Tunisia-Specific Implementation**

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

> ✅ **Why This Works for Tunisia**:  
>
> - Strict server-side enforcement (client-side hiding is only for UX)  
> - Clear role definitions matching Rotary's volunteer structure  
> - Prevents data exposure even if API is called directly  
> - Proper handling of Tunisian network conditions (30s timeout)  
> - Audit logging for all content changes (GDPR compliance)  

### **✅ Tunisia-Specific Photo Consent Enforcement**

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

> ✅ **Why This Matters for Tunisia**:  
>
> - Enforces GDPR compliance for French/European member data  
> - Provides French error messages volunteers can understand  
> - Prevents publishing without proper consent (legal requirement)  
> - Works within Tunisia's specific cultural context for photos  
> - Properly handles common volunteer mistake of forgetting consent  

### **❌ Avoid: Client-Only Permissions**

```tsx
// src/components/EventList.tsx
{user.role === 'admin' && (
  <button onClick={handleDelete}>Supprimer</button>
)}

// ❌ SECURITY RISK: This is UI hiding only!
// ❌ API can still be called directly to delete content
```

> ❌ **Why This Fails for Tunisia**:  
>
> - UI hiding ≠ access denial (API can be called directly)  
> - Volunteers might think "no delete button = safe" but content can still be deleted  
> - Creates false sense of security for non-technical users  
> - Violates GDPR requirements for data protection  
> - Would allow content deletion even when UI hides the button  

---

## 🧪 **8. Testing & Maintainability**

### **✅ Write Self-Documenting Code with Tunisia-Specific Clarity**

```ts
// GOOD: Clear intent with Tunisia-specific context
// Prevent duplicate Arabic drafts on updates (Tunisia-specific guard)
if (operation === 'create' && doc.locale === 'fr') {
  // Create Arabic draft with [AR] prefix
  await createArabicDraft(doc, req);
}

// BAD: Obscure and Tunisia-ignorant
if (op === 'crt' && lang === 'fr') {
  createDraft(doc, req);
}
```

> ✅ **Why This Works for Tunisia**:  
>
> - Clear variable names help French/English speakers understand code  
> - Comments explain Tunisia-specific requirements  
> - No abbreviations that confuse non-native speakers  
> - Explicit operation/locale checks prevent Tunisian-specific bugs  
> - Future maintainers (even with limited English) can grasp the purpose  

### **✅ Add Minimal, Useful Comments with Tunisia-Specific Context**

```ts
// Tunisia-specific hook: French → Arabic auto-draft
// Only triggers on new French content (prevents infinite loops)
// Creates draft with [AR] prefix for volunteer review
const syncArabicAfterCreate: CollectionAfterChangeHook = async ({ 
  doc, 
  operation, 
  req 
}) => {
  if (operation !== 'create' || doc.locale !== 'fr') return;
  
  // SAFE FIELD SELECTION: Never use spread operator (Tunisia-specific data integrity)
  const safeData = {
    title: `[AR] ${doc.title}`,
    description: doc.description,
    eventDate: doc.eventDate,
  };
  
  // ... rest of implementation
};
```

> ✅ **Why This Works for Tunisia**:  
>
> - Comments explain Tunisia-specific requirements  
> - Highlights critical Tunisia-specific guards  
> - Clarifies why certain patterns are used (data integrity)  
> - Helps future maintainers understand cultural context  
> - Written in clear English with French terms where helpful  

### **❌ Avoid: Over-Commenting Obvious Code**

```ts
// BAD: Over-commenting obvious code
// This function checks if operation is create
// Operation is a string from Payload hook
if (operation === 'create') {
  // This checks if locale is French
  // Locale comes from Payload localization system
  if (doc.locale === 'fr') {
    // ... implementation
  }
}
```

> ❌ **Why This Fails for Tunisia**:  
>
> - Creates maintenance burden for future volunteers  
> - Makes code harder to read by adding noise  
> - Doesn't explain Tunisia-specific requirements  
> - Wastes space that could be used for important context  
> - Confuses non-technical maintainers with unnecessary detail  

---

## 🛠️ **9. Tooling & Enforcement**

### **Tunisia-Optimized Development Environment**

#### **Critical `tsconfig.json` Settings**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    // Critical Tunisia-specific setting
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

> ✅ **Why Tunisia-Specific Configuration Matters**:  
>
> - `strict: true` enforces type safety (critical for maintainability)  
> - `forceConsistentCasingInFileNames` prevents issues on case-sensitive servers  
> - Proper paths configuration enables clean imports (`import Events from '@/collections/Events'`)  
> - Ensures compatibility with Vercel's serverless environment  
> - Reduces bugs from type errors in Tunisia-specific logic  

#### **ESLint Configuration for Tunisia**

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "camelcase": "error",
    "no-console": "warn",
    // Tunisia-specific rules
    "max-lines-per-function": ["error", 100],
    "max-statements": ["error", 20],
    "complexity": ["error", 10]
  },
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { "argsIgnorePattern": "^_" }
        ]
      }
    }
  ]
}
```

> ✅ **Why Tunisia-Specific ESLint Rules Matter**:  
>
> - Prevents `any` types (ensures type safety for maintainers)  
> - Limits function complexity (critical for volunteer-friendly code)  
> - Enforces camelCase (improves readability for French speakers)  
> - Tunisia-specific line/statement limits prevent overly complex hooks  
> - Reduces bugs from unused variables in Tunisia-specific logic  

#### **Prettier Configuration**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  // Tunisia-specific readability
  "arrowParens": "always",
  "bracketSpacing": true
}
```

> ✅ **Why Tunisia-Specific Prettier Matters**:  
>
> - 100-character print width improves readability on common Tunisian monitors  
> - Consistent formatting helps non-native English speakers parse code  
> - Prevents formatting disagreements that waste volunteer time  
> - Ensures clean diffs for future maintainers with limited expertise  

#### **Git Hooks Setup**

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src"
  },
  "devDependencies": {
    "husky": "^8.0.3",
    "lint-staged": "^14.0.1"
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "npm run lint",
      "npm run format"
    ]
  }
}
```

> ✅ **Why Tunisia-Specific Git Hooks Matter**:  
>
> - Blocks unformatted code from being committed  
> - Ensures consistent code quality across all contributors  
> - Prevents style debates that waste volunteer time  
> - Critical for maintaining code quality with volunteer turnover  
> - Ensures future maintainers (even with limited expertise) can contribute safely  

---

## 🤝 **10. Partner Collaboration & Code Reviews**

### **Code Review Checklist for Tunisia-Specific Requirements**

When reviewing code (whether from internal developers or partners), verify these Tunisia-specific requirements:

| Check | Description | Criticality |
|-------|-------------|-------------|
| **Arabic Typography** | Line height ≥ 1.6, proper RTL implementation | ✅ Critical |
| **Date Formatting** | `dd/MM/yyyy` in admin UI, Tunisian standards | ✅ Critical |
| **Hook Safeguards** | Operation/locale guards, no spread operator | ✅ Critical |
| **Photo Consent** | Proper enforcement for images with people | ✅ Critical |
| **Mobile Performance** | Tested on common Tunisian Android devices | ⚠️ High |
| **French Error Messages** | All UI errors in French with Arabic glossary | ⚠️ High |
| **GDPR Compliance** | For French/European member data | ✅ Critical |
| **Role-Based Access** | Server-side enforcement only | ✅ Critical |

### **Recommended Agencies for Code Audit & Tunisia-Specific Support**

#### **Top Partners for Rotary Implementation**

| Partner | Why Recommended for Tunisia | Specific Expertise |
|---------|------------------------------|---------------------|
| **Distinction** | Extensive public sector experience; strong on GDPR compliance | • Tunisia-specific GDPR requirements<br>• French-first implementation |
| **Humaan** | Award-winning UX focus; excellent accessibility implementation | • Volunteer-friendly interfaces<br>• Arabic typography expertise |
| **Enrise B.V.** | Deep Payload expertise; GDPR/compliance specialists | • Tunisia-specific security<br>• Data protection for French members |
| **FocusReactive** | Content modeling specialists; perfect for Rotary's impact reporting | • Tunisia-specific content workflows<br>• French → Arabic auto-draft |

> 🔗 **Find All Partners**: [Payload Partners Directory](https://payloadcms.com/partners)

### **Partner Engagement Protocol**

1. **Share this coding standard** before any work begins
2. **Require Tunisia-specific validation** in all deliverables
3. **Include native Arabic speaker review** for RTL implementation
4. **Test on common Tunisian Android devices** (Xiaomi Redmi 9A)
5. **Document handover process** with French-first training materials

> 💡 **Pro Tip**: All partner work must include Tunisia-specific documentation updates—code without proper documentation fails our volunteer sustainability principle.

---

## 📌 **Living Document Governance**

### **Maintenance Protocol**

- **Version Control**: Tag with date and changelog (e.g., "v1.2 - 2023-10-15: Added Tunisia-specific RTL requirements")
- **Storage**: Maintain in shared knowledge base (Notion recommended) with version history
- **Review Cadence**:
  - Monthly: Update with lessons learned
  - Quarterly: Full review with Digital Steward
  - After milestones: Post-implementation review updates

### **Critical Update Triggers**

- [ ] New Tunisia-specific requirement identified
- [ ] Volunteer reports usability issue
- [ ] Security vulnerability discovered
- [ ] After each quarterly backup restore drill
- [ ] When implementing new Payload features

### **Document Approval Process**

| Action | Responsible | Timeline | Approval Required |
|--------|-------------|----------|-------------------|
| Initial creation | Tech Lead | Before development | Digital Steward |
| Monthly updates | Digital Steward | First Monday monthly | Tech Lead |
| Major revisions | CISO Consultant | After security incidents | Board |
| Annual review | Board Security Committee | Q4 each year | Full Board |

---

## ✅ **Final Implementation Philosophy**

> **"This isn't just code—it's the foundation that enables Rotary volunteers to share their impact stories without technical barriers. Every line must respect Tunisia's linguistic reality and non-profit constraints."**

This coding standard ensures:

- ✅ **Clear, maintainable code** that survives volunteer turnover
- ✅ **Tunisia-specific implementation** that respects cultural context
- ✅ **Security-first approach** that protects member data
- ✅ **Type-safe development** that prevents common bugs
- ✅ **Partner consistency** that ensures quality across contributors

> 💡 **Critical Success Factor**: All code changes must be validated by actual Rotary Tunis Doyen volunteers—not just developers. If a 70-year-old volunteer can't understand the impact of your code change, it fails our core principles.

> 📌 **Remember**: Code is temporary, but documentation is forever. Update this guide whenever reality diverges from plan—it's your most valuable project asset.
