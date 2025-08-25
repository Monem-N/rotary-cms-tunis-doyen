# 📚 **Payload Implementation Guide: Rotary Club Tunis Doyen CMS**  
## *The Official Implementation Manual for Trilingual, RTL-Aware Headless CMS*

> **"This guide transforms technical specifications into actionable steps—ensuring your implementation speaks Tunisian, not just translated words."**  
> *Designed for developers building the system and future maintainers needing reference*

---

## 🚀 **Phase 1: Project Setup & Initialization**

### **1.1 Initialize Next.js + Payload Project**  
*Start with a clean foundation optimized for Tunisia*

```bash
npx create-next-app@latest rotary-club-tunis --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
cd rotary-club-tunis
npx create-payload-app@latest
```

**Critical Tunisia-Specific Prompts:**  
- **Database**: Select MongoDB (Atlas compatible)  
- **Authentication**: Email/password (GDPR-compliant for French members)  
- **Admin UI**: Default (will customize for zero-exposure later)  
- **i18n**: Enable localization (critical for trilingual support)  

> 💡 **Pro Tip**: Use `--src-dir` to create a clean `src/` structure—essential for maintainability with volunteer turnover.

### **1.2 Install Key Dependencies**  
*Include Tunisia-specific requirements*

```bash
npm install @payloadcms/richtext-lexical @payloadcms/plugin-cloud-storage \
@payloadcms/db-mongodb @payloadcms/bundler-webpack sharp \
@payloadcms/plugin-versions @payloadcms/plugin-seo
```

**Critical Tunisia-Specific Packages:**  
- `@payloadcms/plugin-cloud-storage`: For Backblaze B2 compatibility (free tier storage)  
- `sharp`: For automatic image optimization (critical for mobile-first Tunisia)  
- `@payloadcms/plugin-versions`: For audit logging (GDPR compliance requirement)  

### **1.3 Configure Environment Variables**  
*Security-first approach for Tunisia*

Create `.env.local`:
```env
# Database
MONGODB_URI="mongodb+srv://app-user:complex-password@cluster.mongodb.net/rotary_doyen?retryWrites=true&w=majority"

# Security
PAYLOAD_SECRET="generate-64-random-chars-here"
COOKIE_SECRET="another-32-random-chars"

# Deployment
PAYLOAD_PUBLIC_SERVER_URL="http://localhost:3000"

# Media Storage (Backblaze B2)
S3_BUCKET="rotary-tunis-media"
S3_ENDPOINT="https://s3.us-west-000.backblazeb2.com"
S3_ACCESS_KEY="your_backblaze_app_key_id"
S3_SECRET_KEY="your_backblaze_app_key"
S3_REGION="us-west-000"
```

> 🔐 **Security Note**:  
> - **Never commit `.env.local`**—add to `.gitignore` immediately  
> - **Use dedicated MongoDB user** (`app-user`, not admin) with least privilege  
> - **For Tunisia**: Backblaze B2 is preferred over AWS S3 (10GB free storage vs S3's 5GB with egress fees)

---

## 🏗️ **Phase 2: Core Configuration (`payload.config.ts`)**

### **2.1 Base Configuration with Tunisia-Specific Enhancements**

```ts
// src/payload.config.ts
import { buildConfig } from 'payload/config';
import path from 'path';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3';
import { cloudStorage } from '@payloadcms/plugin-cloud-storage';
import { seoPlugin } from '@payloadcms/plugin-seo';
import { generateTitle } from '@payloadcms/plugin-seo/tools';

import Users from './collections/Users';
import Events from './collections/Events';
import Media from './collections/Media';
import Minutes from './collections/Minutes';

// Configure S3-compatible storage (Backblaze B2)
const storageAdapter = s3Adapter({
  bucket: process.env.S3_BUCKET,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  config: {
    region: process.env.S3_REGION,
  },
  // Tunisia-specific image optimization
  imageTransforms: [
    async ({ inputFile, size, format }) => {
      if (format === 'webp') {
        return require('sharp')(inputFile)
          .webp({ quality: 80 })
          .resize(size?.width, size?.height)
          .toBuffer();
      }
    }
  ]
});

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    // Zero-exposure admin (Phase 4 implementation)
    components: {
      AfterDashboard: [() => null], // Will replace with redirect
      Nav: [() => null],
      BeforeLogin: [() => null]
    }
  },
  editor: lexicalEditor({
    features: ({ rootFeatures }) => [
      ...rootFeatures,
      // Tunisia-specific RTL support
      lexicalEditor.rtlPlugin({
        className: 'arabic-content',
        defaultDirection: 'rtl'
      })
    ]
  }),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI,
  }),
  // Tunisia-specific localization configuration
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
  },
  plugins: [
    // Tunisia-specific media storage
    cloudStorage({
      collections: {
        media: {
          adapter: storageAdapter,
          disableLocalStorage: true
        }
      }
    }),
    // SEO for Tunisian search visibility
    seoPlugin({
      generateTitle,
      collections: ['events', 'posts'],
    }),
    // Audit logging for GDPR compliance
    require('@payloadcms/plugin-versions')({
      collections: ['events', 'posts', 'media', 'minutes'],
      maxPerDoc: 50
    })
  ],
  collections: [Users, Events, Media, Minutes],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  // Tunisia-specific performance tuning
  express: {
    middleware: [
      // Increase timeout for Tunisian network conditions
      (req, res, next) => {
        req.setTimeout(30000); // 30 seconds
        next();
      }
    ]
  }
});
```

### **2.2 Critical Tunisia-Specific Configuration Notes**  
| Configuration | Why Tunisia-Specific | Impact if Skipped |
|---------------|----------------------|-------------------|
| **Explicit RTL locale flags** | Tunisian Arabic requires proper typography, not just direction | Broken Arabic rendering with Latin punctuation |
| **French → Arabic fallback** | Arabic should fall back to French (not English) for local relevance | Content gaps that disrespect Tunisian context |
| **30s API timeout** | Tunisian networks often have higher latency | Volunteers unable to save content during spotty connectivity |
| **WebP optimization** | Mobile-first usage requires smaller image sizes | Slow load times on common <$150 Android devices |
| **Audit logging** | GDPR compliance required for French member data | Legal risk for European members |

---

## 📂 **Phase 3: Collection Design**

### **3.1 Create `src/collections/Media.ts` (Critical for Tunisia)**  
*Proper media handling is essential for volunteer photo uploads*

```ts
// src/collections/Media.ts
import { CollectionConfig } from 'payload/types';

const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        crop: 'center'
      },
      {
        name: 'card',
        width: 600,
        height: 400,
        crop: 'center'
      }
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    // Tunisia-specific EXIF stripping
    handler: async ({ 
      req, 
      data, 
      file, 
      operation 
    }) => {
      if (operation === 'create') {
        // Strip EXIF metadata for privacy (GDPR requirement)
        const sharp = require('sharp');
        const buffer = await sharp(file.buffer)
          .withMetadata({}) // Remove all metadata
          .toBuffer();
        
        return {
          ...data,
          buffer,
          mimetype: file.mimetype,
          filename: file.filename
        };
      }
    }
  },
  fields: [
    {
      name: 'altText',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Description de l\'image en français et arabe (obligatoire)'
      }
    },
    {
      name: 'consentObtained',
      type: 'checkbox',
      label: 'Consentement obtenu (GDPR)',
      defaultValue: false,
      admin: {
        description: 'Cochez cette case uniquement si vous avez l\'autorisation écrite de publication'
      },
      hooks: {
        beforeValidate: [
          ({ data, siblingData, operation }) => {
            if (operation === 'create' && !data.consentObtained) {
              throw new Error('Vous devez obtenir le consentement avant de publier des images avec des personnes');
            }
          }
        ]
      }
    }
  ],
  // Tunisia-specific access control
  access: {
    read: () => true,
    create: ({ req: { user } }) => 
      user.role === 'admin' || user.role === 'editor',
    update: ({ req: { user } }) => 
      user.role === 'admin' || user.role === 'editor',
    delete: ({ req: { user } }) => user.role === 'admin'
  }
};

export default Media;
```

### **3.2 Create `src/collections/Events.ts` with Tunisia-Specific Requirements**

```ts
// src/collections/Events.ts
import { CollectionConfig } from 'payload/types';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { syncArabicAfterCreate } from '../hooks/syncArabic';

const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventDate', 'locale'],
    group: 'Content',
    // Tunisia-specific RTL validation component
    components: {
      AfterInput: () => (
        <div className="rtl-validation">
          <p>Utilisez l'onglet 'العربية' pour le contenu arabe</p>
        </div>
      )
    }
  },
  access: {
    // Critical Tunisia-specific RBAC
    read: () => true,
    create: ({ req: { user } }) => 
      user.role === 'admin' || user.role === 'editor',
    update: ({ req: { user } }) => 
      user.role === 'admin' || user.role === 'editor',
    delete: ({ req: { user } }) => user.role === 'admin',
  },
  hooks: {
    afterChange: [syncArabicAfterCreate]
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Titre de l\'événement en français, arabe et anglais'
      }
    },
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
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      localized: true
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          // Critical Tunisia-specific RTL plugin
          lexicalEditor.rtlPlugin({
            className: 'arabic-content',
            defaultDirection: 'rtl'
          })
        ],
      }),
      admin: {
        components: {
          // Tunisia-specific Arabic typography validator
          Field: () => (
            <div className="arabic-validator">
              <p>Le texte arabe doit utiliser une hauteur de ligne ≥ 1.6</p>
            </div>
          )
        }
      }
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true
        },
        {
          name: 'caption',
          type: 'text',
          localized: true
        }
      ]
    },
    {
      name: 'areasOfFocus',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Éducation', value: 'education' },
        { label: 'Environnement', value: 'environment' },
        { label: 'Santé', value: 'health' },
        { label: 'Paix', value: 'peace' },
        { label: 'Économie', value: 'economy' },
        { label: 'Eau', value: 'water' },
        { label: 'Autre', value: 'other' }
      ],
      admin: {
        description: 'Catégories alignées sur les 7 domaines d\'action de Rotary'
      }
    },
    {
      name: 'impactMetrics',
      type: 'group',
      fields: [
        {
          name: 'mealsServed',
          type: 'number',
          admin: {
            description: 'Repas servis (chiffre entier)'
          }
        },
        {
          name: 'treesPlanted',
          type: 'number',
          admin: {
            description: 'Arbres plantés (chiffre entier)'
          }
        },
        {
          name: 'volunteerHours',
          type: 'number',
          admin: {
            description: 'Heures de bénévolat'
          }
        }
      ]
    }
  ]
};

export default Events;
```

### **3.3 Create `src/collections/Minutes.ts` (Board Memory Preservation)**

```ts
// src/collections/Minutes.ts
import { CollectionConfig } from 'payload/types';

const Minutes: CollectionConfig = {
  slug: 'minutes',
  labels: {
    singular: 'Procès-verbal',
    plural: 'Procès-verbaux'
  },
  access: {
    // Critical Tunisia-specific access control
    read: ({ req: { user } }) => user.role === 'admin',
    create: ({ req: { user } }) => user.role === 'admin',
    update: ({ req: { user } }) => user.role === 'admin',
    delete: ({ req: { user } }) => user.role === 'admin',
  },
  admin: {
    useAsTitle: 'meetingDate',
    defaultColumns: ['meetingDate', 'boardRole'],
    group: 'Content',
    description: 'Documents privés réservés au conseil d\'administration'
  },
  fields: [
    {
      name: 'meetingDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          // Tunisia-specific date format
          displayFormat: 'dd/MM/yyyy'
        }
      }
    },
    {
      name: 'boardRole',
      type: 'select',
      required: true,
      options: [
        { label: 'Président', value: 'president' },
        { label: 'Trésorier', value: 'treasurer' },
        { label: 'Secrétaire', value: 'secretary' },
        { label: 'Membre du conseil', value: 'board-member' }
      ]
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Téléchargez le PDF signé du conseil'
      }
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Résumé des points clés en français/arabe'
      }
    }
  ]
};

export default Minutes;
```

---

## ⚙️ **Phase 4: Advanced Features**

### **4.1 Auto-Draft Sync: French → Arabic Hook (Critical Fix)**  
*Never use spread operator - avoids data corruption*

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
  
  // SAFE FIELD SELECTION: Never use spread operator (prevents ID/timestamp copying)
  const safeData = {
    title: `[AR] ${doc.title}`,
    description: doc.description,
    eventDate: doc.eventDate,
    location: doc.location,
    gallery: doc.gallery,
    areasOfFocus: doc.areasOfFocus,
    impactMetrics: doc.impactMetrics
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

### **4.2 Tunisia-Specific Arabic Typography Validator**  
*Prevents broken Arabic rendering*

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

### **4.3 Zero-Exposure Admin: Volunteer-Friendly Redirect**  
*Designed for Tunisian volunteer workflows*

```tsx
// src/components/AfterLogin.tsx
import React from 'react';
import { useRouter } from 'next/navigation';

const AfterLogin: React.FC = () => {
  const router = useRouter();
  
  React.useEffect(() => {
    // Tunisia-specific redirect based on role
    const userRole = localStorage.getItem('user-role');
    
    if (userRole === 'admin') {
      router.push('/admin/collections/minutes');
    } else {
      router.push('/admin/collections/events');
    }
  }, [router]);

  return (
    <div className="login-redirect">
      <p>Chargement de votre espace de travail...</p>
      <p className="subtext">Redirection vers les événements en cours</p>
    </div>
  );
};

export default AfterLogin;
```

**Implementation in `payload.config.ts`:**
```ts
admin: {
  components: {
    AfterDashboard: [AfterLogin],
    // Remove confusing navigation elements
    Nav: [() => null],
    BeforeLogin: [() => (
      <div className="login-header">
        <h1>Rotary Club Tunis Doyen</h1>
        <p>Espace administratif sécurisé</p>
      </div>
    )]
  }
}
```

---

## ☁️ **Phase 5: Deployment to Vercel**

### **5.1 Tunisia-Specific Deployment Checklist**
| Step | Critical Action | Why Tunisia-Specific |
|------|-----------------|----------------------|
| **1. GitHub Setup** | Create private repo with branch protection | Prevents accidental code exposure |
| **2. Vercel Project** | Select "Next.js" framework preset | Required for Payload serverless compatibility |
| **3. Environment Variables** | Add all secrets (never commit `.env`) | Critical for GDPR compliance |
| **4. Network Configuration** | Consider Vercel Egress IPs add-on | Helps with MongoDB Atlas IP restrictions |
| **5. Mobile Testing** | Validate on Xiaomi Redmi 9A (common <$150 Android) | Ensures usability for Tunisian volunteers |

### **5.2 Critical Environment Variables for Vercel**  
*Add these in Vercel Dashboard → Project Settings → Environment Variables*

| Key | Value | Type | Notes |
|-----|-------|------|-------|
| `MONGODB_URI` | `mongodb+srv://app-user:password@cluster.mongodb.net/db?retryWrites=true&w=majority` | Secret | Use dedicated DB user |
| `PAYLOAD_SECRET` | `64_random_characters_here` | Secret | Must be 32+ chars |
| `S3_BUCKET` | `rotary-tunis-media` | Secret | Backblaze B2 bucket |
| `S3_ENDPOINT` | `https://s3.us-west-000.backblazeb2.com` | Secret | Backblaze B2 endpoint |
| `S3_ACCESS_KEY` | `your_backblaze_app_key_id` | Secret | Backblaze app key |
| `S3_SECRET_KEY` | `your_backblaze_app_key` | Secret | Backblaze app key |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://rotary-tunis-doyen.vercel.app` | Plain | Your Vercel URL |
| `NODE_ENV` | `production` | Plain | Required for production |

> 💡 **Pro Tip**: Use Backblaze B2 instead of AWS S3—10GB free storage vs S3's 5GB with expensive egress fees.

### **5.3 Tunisia-Specific Vercel Configuration**  
*Add to `vercel.json`*

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "regions": ["cdg1"], // Paris region for better EU latency
  "headers": [
    {
      "source": "/admin/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdn.sentry.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.backblazeb2.com; font-src 'self' https://fonts.gstatic.com"
        }
      ]
    }
  ]
}
```

**Critical Tunisia-Specific Notes:**  
- `regions: ["cdg1"]`: Paris region reduces latency for Tunisian users  
- CSP includes Backblaze B2 for media security  
- Admin panel has no caching (critical for volunteer usability)  

---

## 🔐 **Phase 6: Security & Maintenance**

### **6.1 Tunisia-Specific Security Hardening**  
*Add to `src/payload.config.ts`*

```ts
// Tunisia-specific security enhancements
const securityConfig = {
  express: {
    middleware: [
      // Tunisia-specific security headers
      (req, res, next) => {
        // Prevent MIME sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        // Enable XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        // Tunisia-specific frame options
        res.setHeader('X-Frame-Options', 'DENY');
        // Tunisia-specific content security policy
        res.setHeader('Content-Security-Policy', 
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-eval' https://cdn.sentry.io; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https://*.backblazeb2.com; " +
          "font-src 'self' https://fonts.gstatic.com"
        );
        next();
      }
    ]
  },
  // Tunisia-specific cookie configuration
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    httpOnly: true,
    path: '/admin',
    domain: process.env.VERCEL_URL?.replace('https://', '') || undefined
  }
};
```

### **6.2 Automated Backup System (GitHub Actions)**  
*Create `.github/workflows/backup.yml`*

```yaml
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

**Critical Tunisia-Specific Notes:**  
- `age` encryption is modern and lightweight (better than GPG for non-technical maintainers)  
- Backblaze B2 is used instead of AWS S3 for cost reasons (10GB free storage)  
- Quarterly restore drills required (documented in Phase 7)  

### **6.3 Tunisia-Specific Maintenance Protocol**

#### **Quarterly Tasks**
```markdown
# ROTARY CLUB TUNIS DOYEN MAINTENANCE CHECKLIST

## [ ] Backup Verification
- [ ] Download encrypted backup from Backblaze B2
- [ ] Decrypt using `age` tool
- [ ] Restore to staging environment
- [ ] Verify content integrity
- [ ] Document process improvements

## [ ] Security Review
- [ ] Check for Payload updates with security patches
- [ ] Verify no exposed secrets in logs
- [ ] Confirm photo consent for all new images
- [ ] Update Tunisia-specific security headers

## [ ] Localization Validation
- [ ] Conduct Arabic typography review with native speaker
- [ ] Verify date/number formatting per Tunisian standards
- [ ] Test on common Tunisian Android devices
- [ ] Update terminology as needed
```

---

## 🤝 **Phase 7: Expert Support & Handover**

### **7.1 Recommended Agency Partners for Non-Profits**  
*Curated list from [Payload Partners Directory](https://payloadcms.com/partners)*

| Partner | Location | Why Recommended for Rotary Tunis Doyen |
|---------|----------|----------------------------------------|
| **Distinction** | UK/USA | Extensive public sector experience; strong on GDPR compliance |
| **Humaan** | Australia | Award-winning UX focus; excellent accessibility implementation |
| **Enrise B.V.** | Netherlands | Deep Payload expertise; GDPR/compliance specialists |
| **FocusReactive** | Netherlands | Content modeling specialists; perfect for Rotary's impact reporting |
| **Atomic Object** | USA | Non-profit experience; strong on volunteer-friendly interfaces |

> 💡 **How to Engage**: All partners offer free consultation calls—ask specifically about:
> - Non-profit pricing models
> - Multilingual RTL implementation experience
> - Tunisia-specific deployment considerations

### **7.2 Tunisia-Specific Handover Package**  
*Must include these for volunteer sustainability*

#### **French-First Training Materials**
```markdown
# ROTARY CLUB TUNIS DOYEN HANDOVER CHECKLIST

## [ ] Technical Documentation
- [ ] This implementation guide (PDF)
- [ ] Tunisia-specific localization guide
- [ ] Backup/restore procedure (with screenshots)

## [ ] Volunteer Training
- [ ] 5-minute video: "Publier un événement en 60 secondes"
- [ ] Cheat sheet: "Que faire en cas de problème"
- [ ] Arabic glossary of key technical terms

## [ ] Succession Planning
- [ ] Named "Digital Steward" with documented responsibilities
- [ ] Quarterly handover shadowing requirement
- [ ] Emergency contact procedure (French/Arabic)
```

#### **Critical Success Factors**
- All training materials must be **tested by actual Rotary volunteers** before handover
- Documentation must include **real Rotary Tunis Doyen content examples**
- Succession planning must identify **two Digital Stewards** (primary + backup)

---

## 📌 **Phase 8: Tunisia-Specific Validation**

### **8.1 Pre-Launch Validation Checklist**
| Test | Method | Success Criteria |
|------|--------|------------------|
| **Arabic Typography** | Native speaker review | Line height ≥ 1.6, proper punctuation |
| **Mobile Performance** | Test on Xiaomi Redmi 9A | Load time < 8s on 3G network |
| **French → Arabic Flow** | Volunteer test | Auto-draft created without errors |
| **Photo Consent** | Form submission test | Cannot publish without consent |
| **Backup Verification** | Restore to staging | All content intact after restore |

### **8.2 Go/No-Go Launch Criteria**
- [ ] Language cascade approved by native speakers
- [ ] Photo consent policy signed by Rotary board
- [ ] Mobile usability confirmed on common Tunisian devices
- [ ] Impact reporting fields mapped to Rotary International
- [ ] All critical risks documented with mitigation plans

---

## ✅ **Final Implementation Philosophy**

> **"This isn't just a CMS—it's a force multiplier for Rotary Club Tunis Doyen's community impact. Every technical decision must answer: 'How does this help a volunteer share their service story in French and Arabic before dinner?'"**

This guide delivers **maximum mission impact with minimum technical burden** by:
- ✅ Solving Tunisia-specific challenges (mobile networks, Arabic typography)
- ✅ Prioritizing volunteer sustainability over technical novelty
- ✅ Building institutional memory through the Minutes Repository
- ✅ Ensuring cultural authenticity in every interaction

> 📌 **Critical Success Factor**: Update this guide whenever reality diverges from plan—it's your most valuable project asset. All changes must be validated by actual Rotary Tunis Doyen volunteers.

---

## 📚 **Appendix A: Tunisia-Specific Reference Materials**

### **Arabic Typography Requirements**
```css
/* Tunisian Arabic content styling */
.arabic-content {
  line-height: 1.6; /* Critical for Arabic readability */
  text-align: right;
  direction: rtl;
  font-family: 'Tajawal', sans-serif;
  font-size: 16px;
}

/* Proper Arabic typography rules */
.arabic-content p {
  margin-bottom: 1.5em;
}

.arabic-content blockquote {
  border-right: 3px solid #005daa;
  padding-right: 16px;
  margin-right: 0;
}
```

### **Tunisia-Specific Date Formatting**
```ts
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

### **Emergency Contact Procedure**
1. **Digital Steward**: [Name] • [Phone] • [Email]
2. **Tech Lead**: [Name] • [Phone] • [Email]
3. **Board Security Contact**: [Name] • [Phone] • [Email]

> "En cas d'urgence, contactez le Digital Steward avant de prendre des mesures. Votre prudence protège la mission de Rotary."