# 📡 **API Documentation & Integration Guide**  

## *Official Reference for Rotary Club Tunis Doyen CMS*

> **"This API enables Rotary volunteers to share their impact stories across linguistic boundaries—without technical barriers."**  
> *A comprehensive reference for frontend developers, third-party integrators, and future partners*

---

## 🌐 **1. API Overview**

### **Core Specifications**

| Property | Value | Tunisia-Specific Notes |
|----------|-------|------------------------|
| **Base URL** | `https://rotary-tunis-doyen.vercel.app/api` | Always use HTTPS (TLS 1.3) |
| **Protocols** | REST (default), GraphQL (optional) | REST recommended for Tunisia's network conditions |
| **Authentication** | Public read access; JWT for admin operations | Never expose admin credentials in client code |
| **Rate Limits** | None on Vercel free tier | Encourage caching for mobile users |
| **CORS** | Configured for `*.rotarytunis.org` only | Prevents unauthorized API consumption |
| **Response Format** | JSON with consistent structure | Proper Arabic encoding (`UTF-8`) |
| **Default Locale** | `fr` (French) | Matches Tunisia's working language |
| **Fallback Locale** | `fr` → `ar` → `en` | Tunisia-specific cascade |

### **Tunisia-Specific Performance Considerations**

- **API Timeout**: 30 seconds (accommodates spotty Tunisian networks)
- **Mobile Optimization**: Responses limited to 50KB where possible
- **Image Handling**: Media served via Backblaze B2 (optimized for web)
- **Network Resilience**: Designed to work with 3G connectivity

> 💡 **Pro Tip**: For Tunisian mobile users, implement request retries with exponential backoff:
>
> ```ts
> const fetchWithRetry = async (url, options = {}, retries = 3) => {
>   try {
>     return await fetch(url, options);
>   } catch (error) {
>     if (retries > 0) {
>       await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
>       return fetchWithRetry(url, options, retries - 1);
>     }
>     throw error;
>   }
> };
>
```

---

## 🔐 **2. Authentication & Access**

### **Public Content (No Authentication Required)**
All `GET` requests to content endpoints are publicly accessible:
- `/api/events`
- `/api/posts`
- `/api/media`

**Example Request:**
```bash
curl "https://rotary-tunis-doyen.vercel.app/api/events?where[status][equals]=published"
```

### **Admin Access (JWT Authentication Required)**

For content creation, updates, and administrative operations:

#### **Step 1: Obtain JWT Token**

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@rotarytunis.org",
  "password": "your-strong-password"
}
```

**Successful Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx",
  "user": {
    "id": "652fabc12c7f5b8d12a3b4c5",
    "email": "admin@rotarytunis.org",
    "role": "admin"
  }
}
```

#### **Step 2: Include Token in Requests**

```http
GET /api/events
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### **Tunisia-Specific Security Implementation**

```ts
// src/payload.config.ts
auth: {
  tokenExpiration: 7 * 24 * 60 * 60, // 7 days (Tunisia network conditions)
  cookies: {
    secure: true,
    sameSite: 'strict' as const,
    path: '/admin',
    domain: process.env.VERCEL_URL?.replace('https://', '') || undefined
  },
  maxLoginAttempts: 5, // Prevents brute force
  lockTime: 60 * 60 * 1000, // 1 hour lock after 5 failed attempts
}
```

> 🔐 **Critical Security Notes for Tunisia**:  
>
> - **Never expose `PAYLOAD_SECRET`** in client-side code or public repositories  
> - **Always use HTTPS**—Tunisian networks are vulnerable to MITM attacks  
> - **Rotate credentials quarterly**—document process for future maintainers  
> - **Admin sessions time out after 30 minutes of inactivity** (configurable per device)  

---

## 📋 **3. Collections & Endpoints**

### **3.1 Events Collection**

#### **`GET /api/events` - Retrieve Published Events**

Fetch all published events with proper localization.

**Query Parameters:**

| Parameter | Description | Default | Tunisia-Specific Notes |
|-----------|-------------|---------|------------------------|
| `where[status][equals]` | Filter by publication status | `published` | Use `draft` for admin previews |
| `locale` | Language to prioritize | `fr` | `ar` for Arabic, `en` for English |
| `depth` | Relationship resolution depth | `0` | Set to `1` to resolve media |
| `limit` | Results per page | `10` | Reduce for mobile performance |
| `page` | Pagination page | `1` | For infinite scroll implementations |

**Example Request:**

```bash
curl "https://rotary-tunis-doyen.vercel.app/api/events?locale=ar&depth=1&limit=5"
```

**Response (200 OK):**

```json
{
  "docs": [
    {
      "id": "652fabc12c7f5b8d12a3b4c5",
      "title": {
        "fr": "Soirée de bienfaisance",
        "ar": "المساء الخيري",
        "en": "Charity Evening"
      },
      "slug": {
        "fr": "soiree-bienfaisance",
        "ar": "المساء-الخيري",
        "en": "charity-evening"
      },
      "eventDate": "2024-03-15",
      "location": {
        "fr": "Tunis",
        "ar": "تونس",
        "en": "Tunis"
      },
      "description": {
        "ar": "<p dir=\"rtl\" class=\"arabic-content\">المساء الخيري لجمع التبرعات...</p>"
      },
      "gallery": [
        {
          "id": "652fabc12c7f5b8d12a3b4c6",
          "image": {
            "id": "652fabc12c7f5b8d12a3b4c7",
            "url": "https://f005.backblazeb2.com/file/rotary-tunis-media/...",
            "altText": {
              "fr": "Bénévoles servant des repas",
              "ar": "المتطوعون يقدمون الوجبات"
            }
          },
          "caption": {
            "fr": "Distribution de repas aux nécessiteux",
            "ar": "توزيع الوجبات على المحتاجين"
          }
        }
      ],
      "areasOfFocus": ["health", "education"],
      "impactMetrics": {
        "mealsServed": 150,
        "treesPlanted": 50,
        "volunteerHours": 120
      },
      "createdAt": "2024-02-10T08:30:00.000Z",
      "updatedAt": "2024-02-10T08:30:00.000Z",
      "locale": "ar",
      "updatedAt": "2024-02-10T08:30:00.000Z"
    }
  ],
  "totalDocs": 12,
  "totalPages": 3,
  "page": 1,
  "limit": 5,
  "hasPrevPage": false,
  "hasNextPage": true
}
```

#### **Tunisia-Specific Response Features**

- Arabic content includes `dir="rtl"` and `class="arabic-content"` for proper rendering
- Date format follows Tunisian standard (`YYYY-MM-DD`)
- Image URLs point to Backblaze B2 (optimized for performance)
- `areasOfFocus` uses Rotary's 7 Areas of Focus taxonomy

#### **`GET /api/events/:id` - Fetch Single Event**

Retrieve a specific event with full localization.

**Example Request:**

```bash
curl "https://rotary-tunis-doyen.vercel.app/api/events/652fabc12c7f5b8d12a3b4c5?locale=fr"
```

**Critical Tunisia-Specific Note**:  
> When requesting an Arabic (`ar`) event, the API automatically checks if content exists. If not, it returns French (`fr`) content per Tunisia's language cascade rules.

#### **`POST /api/events` (Admin Only) - Create New Event**

Create a new event with trilingual content.

**Request Headers:**

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": {
    "fr": "Nouvel événement",
    "ar": "حدث جديد",
    "en": "New Event"
  },
  "eventDate": "2024-04-01",
  "location": {
    "fr": "Tunis",
    "ar": "تونس",
    "en": "Tunis"
  },
  "description": {
    "fr": "<p>Contenu en français ici</p>",
    "ar": "<p dir=\"rtl\" class=\"arabic-content\">محتوى بالعربية هنا</p>"
  },
  "gallery": [
    {
      "image": "652fabc12c7f5b8d12a3b4c7",
      "caption": {
        "fr": "Photo de l'événement",
        "ar": "صورة الحدث"
      }
    }
  ],
  "areasOfFocus": ["environment", "peace"],
  "impactMetrics": {
    "treesPlanted": 100
  },
  "status": "draft"
}
```

**Tunisia-Specific Automation**:  
> Upon French (`fr`) event creation, the `syncArabicAfterCreate` hook automatically creates an Arabic (`ar`) draft with `[AR]` prefix. No additional request needed.

---

### **3.2 Media Collection**

#### **`GET /api/media` - Retrieve Media Assets**

Fetch all approved media assets with proper alt text.

**Example Request:**

```bash
curl "https://rotary-tunis-doyen.vercel.app/api/media?where[consentObtained][equals]=true"
```

**Response Features:**

- Only returns media with `consentObtained: true` by default
- Includes both French and Arabic `altText`
- Provides optimized image variants (thumbnail, card)
- Returns EXIF-stripped versions for privacy

**Critical Tunisia-Specific Implementation**:  

```ts
// src/collections/Media.ts
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
  handler: async ({ req, data, file, operation }) => {
    if (operation === 'create') {
      // Strip EXIF metadata for GDPR compliance
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
}
```

---

### **3.3 Minutes Collection (Restricted Access)**

#### **`GET /api/minutes` - Retrieve Board Documents**

*Admin access required*

**Example Request:**

```bash
curl "https://rotary-tunis-doyen.vercel.app/api/minutes?where[meetingDate][greater_than]=2024-01-01" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Tunisia-Specific Security Implementation**:

```ts
// src/collections/Minutes.ts
access: {
  read: ({ req: { user } }) => user.role === 'admin',
  create: ({ req: { user } }) => user.role === 'admin',
  update: ({ req: { user } }) => user.role === 'admin',
  delete: ({ req: { user } }) => user.role === 'admin',
}
```

> 🔐 **Critical Note**: Minutes are private documents accessible only to admins—never exposed via public API.

---

## 🔄 **4. Real-Time & Webhooks**

### **4.1 Tunisia-Specific Update Notification Pattern**

Since Payload doesn't natively support webhooks, use this Tunisia-optimized pattern:

#### **Recommended: Polling with Timestamp Tracking**

For external systems needing updates (e.g., mobile apps, social media):

```ts
// Example: Check for updated events since last sync
const checkForUpdates = async (lastSyncTime) => {
  const response = await fetch(
    `https://rotary-tunis-doyen.vercel.app/api/events?where[updatedAt][greater_than]=${lastSyncTime}&limit=100`
  );
  return response.json();
};

// Usage
const lastSyncTime = localStorage.getItem('lastEventSync') || new Date(0).toISOString();
const { docs } = await checkForUpdates(lastSyncTime);
localStorage.setItem('lastEventSync', new Date().toISOString());

// Process updated events
docs.forEach(event => {
  // Update local cache or trigger notifications
});
```

**Why This Works for Tunisia**:  

- Minimizes data usage (critical for mobile users)
- Handles spotty network connectivity with retry logic
- Simple implementation that works within free tier constraints
- Avoids complex webhook infrastructure

#### **Advanced: Custom Webhook Trigger**

For critical integrations requiring real-time updates:

```ts
// src/hooks/triggerWebhooks.ts
import { CollectionBeforeChangeHook } from 'payload/types';

export const triggerWebhooks: CollectionBeforeChangeHook = async ({ 
  doc, 
  req, 
  operation 
}) => {
  // Tunisia-specific: Only trigger for published content
  if (operation === 'update' && doc._status === 'published') {
    try {
      await fetch('https://external-system.com/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: doc.id,
          type: 'event',
          action: 'published',
          locale: doc.locale,
          timestamp: new Date().toISOString(),
          // Tunisia-specific: Include French title for notifications
          title: doc.title.fr
        })
      });
    } catch (error) {
      req.payload.logger.error(`Webhook failed: ${error.message}`);
    }
  }
  return doc;
};
```

**Attach to Events Collection:**

```ts
// src/collections/Events.ts
hooks: {
  beforeChange: [triggerWebhooks]
}
```

> ⚠️ **Tunisia-Specific Considerations**:  
>
> - Use exponential backoff for failed webhook deliveries  
> - Store webhook delivery status for troubleshooting  
> - Limit to critical events (published content only)  
> - Include French title for notifications (more widely understood)  

---

## 🧱 **5. Frontend Integration (Next.js)**

### **5.1 Fetching Content with ISR (Tunisia-Optimized)**

#### **Static Site Generation with Fallback**

```tsx
// pages/events/index.tsx
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  // Tunisia-specific: Use 15s timeout for spotty networks
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(
      `https://rotary-tunis-doyen.vercel.app/api/events?locale=${locale}&where[status][equals]=published`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch events');
    
    const { docs } = await response.json();
    return {
      props: {
        ...(await serverSideTranslations(locale as string, ['common'])),
        events: docs
      },
      // Revalidate every 1 hour (Tunisia content update frequency)
      revalidate: 3600
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      props: {
        ...(await serverSideTranslations(locale as string, ['common'])),
        events: []
      },
      revalidate: 60 // Try again sooner on error
    };
  }
};

const EventsPage = ({ events }: { events: any[] }) => {
  // Component implementation
};
```

### **5.2 Handling RTL Content (Tunisia-Specific)**

#### **Universal Content Renderer**

```tsx
// components/ContentRenderer.tsx
import React from 'react';

interface ContentRendererProps {
  content: string;
  locale: string;
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  content, 
  locale, 
  className = '' 
}) => {
  // Tunisia-specific: Arabic requires special handling
  const isArabic = locale === 'ar';
  
  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${className} ${isArabic ? 'arabic-content' : ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default ContentRenderer;
```

#### **CSS for Proper Arabic Typography**

```css
/* Tunisia-specific Arabic typography */
.arabic-content {
  line-height: 1.6; /* Critical for Arabic readability */
  text-align: right;
  direction: rtl;
  font-family: 'Tajawal', sans-serif;
  font-size: 16px;
}

.arabic-content p {
  margin-bottom: 1.5em;
}

.arabic-content blockquote {
  border-right: 3px solid #005daa;
  padding-right: 16px;
  margin-right: 0;
}
```

### **5.3 Mobile-First Image Loading (Tunisia-Specific)**

```tsx
// components/OptimizedImage.tsx
import React from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  media: any;
  size?: 'thumbnail' | 'card' | 'original';
  alt?: string;
  className?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  media, 
  size = 'card',
  alt, 
  className 
}) => {
  // Tunisia-specific: Use French alt text as fallback
  const getAltText = () => {
    if (alt) return alt;
    if (media.altText?.fr) return media.altText.fr;
    if (media.altText?.ar) return media.altText.ar;
    return 'Image';
  };

  // Tunisia-specific: Mobile-first sizing
  const width = size === 'thumbnail' ? 300 : size === 'card' ? 600 : undefined;
  const height = size === 'thumbnail' ? 300 : size === 'card' ? 400 : undefined;

  return (
    <Image
      src={media.url}
      alt={getAltText()}
      width={width}
      height={height}
      className={className}
      // Tunisia-specific: Optimize for mobile networks
      loading="lazy"
      placeholder="blur"
      blurDataURL="/placeholder.svg"
    />
  );
};

export default OptimizedImage;
```

> ✅ **Tunisia-Specific Best Practices**:  
>
> - Always provide French alt text as fallback (more widely understood)  
> - Use `loading="lazy"` to improve mobile performance  
> - Implement placeholder images to reduce layout shifts  
> - Respect Tunisia's network conditions with optimized image sizes  

---

## 🛠️ **6. Development & Testing**

### **6.1 Local API Testing Workflow**

#### **Step 1: Start Development Server**

```bash
npm run dev
```

#### **Step 2: Access Local API**

- Base URL: `http://localhost:3000/api`
- Admin UI: `http://localhost:3000/admin`

#### **Step 3: Test Requests with Curl**

```bash
# Public events request
curl "http://localhost:3000/api/events?locale=fr"

# Admin login (replace credentials)
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@rotarytunis.org", "password":"test123"}'
```

### **6.2 Tunisia-Specific Testing Protocol**

#### **Mobile Device Testing Checklist**

| Test | Method | Success Criteria | Tunisia-Specific Reason |
|------|--------|------------------|-------------------------|
| **3G Network Simulation** | Chrome DevTools throttling | Load time < 8s | Common Tunisian network speed |
| **Small Screen Rendering** | Test on Xiaomi Redmi 9A | No horizontal scrolling | Most common <$150 Android |
| **Touch Target Size** | Measure with ruler | ≥ 48x48px | Glove-friendly interaction |
| **Arabic Typography** | Native speaker review | Line height ≥ 1.6 | Critical for Arabic readability |
| **French Date Format** | Verify display | `dd/MM/yyyy` | Tunisian standard format |

#### **Localization Testing Matrix**

```markdown
# TUNISIA LOCALIZATION TEST MATRIX

## [ ] French Content
- [ ] Date format: `dd/MM/yyyy`
- [ ] Number format: `1 000,5`
- [ ] Proper French typography
- [ ] No American English terms

## [ ] Arabic Content
- [ ] Text direction: RTL
- [ ] Line height: ≥ 1.6
- [ ] Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩)
- [ ] Proper Arabic typography

## [ ] Cross-Language
- [ ] French → Arabic auto-draft works
- [ ] Missing Arabic shows French (not English)
- [ ] Alt text in both French/Arabic
- [ ] Cultural appropriateness validated
```

### **6.3 Postman Collection Setup**

1. **Import Collection**:  
   Download `rotary-tunis-doyen-api.postman_collection.json` from `/docs` directory

2. **Set Environment Variables**:  

   ```json
{
     "api_base_url": "<https://rotary-tunis-doyen.vercel.app/api>",
     "test_email": "<test@rotarytunis.org>",
     "test_password": "test123"
   }
```

3. **Run Collection Tests**:  
   - Public Content Tests
   - Authentication Flow
   - Event Creation Workflow
   - Tunisia-Specific Localization

> 💡 **Pro Tip**: All Postman tests include Tunisia-specific assertions for date formats, Arabic typography, and localization workflows.

---

## 🤝 **7. Partner Support for Advanced Integrations**

### **7.1 Tunisia-Specific Integration Scenarios**

#### **Social Media Amplification**
```ts
// src/endpoints/social.ts
import { Express } from 'express';
import { createPost } from '../integrations/social';

export default (app: Express) => {
  app.post('/api/social/publish', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
      const { eventId, platforms } = req.body;
      
      // Fetch event data (Tunisia-specific French title priority)
      const eventRes = await fetch(
        `https://rotary-tunis-doyen.vercel.app/api/events/${eventId}?locale=fr`
      );
      const event = await eventRes.json();
      
      // Publish to selected platforms
      const results = await Promise.all(
        platforms.map(platform => 
          createPost(platform, {
            title: event.title.fr,
            description: event.description.fr.substring(0, 200),
            imageUrl: event.gallery[0]?.image?.url,
            link: `/events/${event.slug.fr}`
          })
        )
      );
      
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ error: 'Erreur de publication' });
    }
  });
};
```

**Supported Platforms**:  

- Facebook
- WhatsApp
- LinkedIn
- Rotary International channels

#### **Email Newsletter Integration**

```ts
// src/endpoints/newsletter.ts
import { Express } from 'express';
import { sendNewsletter } from '../integrations/email';

export default (app: Express) => {
  app.post('/api/newsletter/generate', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
      const { month, year } = req.body;
      
      // Fetch monthly events (Tunisia-specific date handling)
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;
      
      const eventsRes = await fetch(
        `https://rotary-tunis-doyen.vercel.app/api/events?where[eventDate][between]=${startDate},${endDate}`
      );
      const { docs: events } = await eventsRes.json();
      
      // Generate newsletter in French/Arabic
      const newsletter = {
        fr: generateNewsletterContent(events, 'fr'),
        ar: generateNewsletterContent(events, 'ar')
      };
      
      // Send to Mailchimp/Sendinblue
      const result = await sendNewsletter(newsletter);
      
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: 'Erreur de génération' });
    }
  });
};
```

### **7.2 Recommended Agencies for Tunisia-Specific Work**

#### **Top Partners for Rotary Implementation**

| Partner | Why Recommended for Tunisia | Specific Expertise |
|---------|------------------------------|---------------------|
| **Distinction** | Extensive public sector experience; strong on GDPR compliance | • Tunisia-specific GDPR requirements<br>• French-first API design<br>• Microsoft ecosystem integration |
| **Humaan** | Award-winning UX focus; excellent accessibility implementation | • Volunteer-friendly API documentation<br>• Arabic typography expertise<br>• Mobile-first integration patterns |
| **Enrise B.V.** | Deep Payload expertise; GDPR/compliance specialists | • Tunisia-specific security<br>• Data protection for French members<br>• Performance optimization |
| **FocusReactive** | Content modeling specialists; perfect for Rotary's impact reporting | • Tunisia-specific content workflows<br>• French → Arabic auto-draft<br>• Impact metrics API design |

> 🔗 **Find All Partners**: [Payload Partners Directory](https://payloadcms.com/partners)

### **7.3 Partner Engagement Protocol**

1. **Share this API documentation** before any work begins
2. **Require Tunisia-specific validation** in all deliverables
3. **Include native Arabic speaker review** for RTL implementation
4. **Test on common Tunisian Android devices** (Xiaomi Redmi 9A)
5. **Document integration process** with French-first training materials

> 💡 **Pro Tip**: All partner work must include Tunisia-specific documentation updates—API without proper documentation fails our volunteer sustainability principle.

---

## 📊 **8. Error Handling & Troubleshooting**

### **8.1 Common Error Responses**

#### **Authentication Errors**

```json
// 401 Unauthorized - Invalid or missing token
{
  "errors": [
    {
      "message": "You are not authorized to perform this action.",
      "name": "UnauthorizedError"
    }
  ]
}

// 401 Unauthorized - Expired token
{
  "errors": [
    {
      "message": "Your authentication token has expired.",
      "name": "TokenExpiredError"
    }
  ]
}
```

#### **Validation Errors**

```json
// 400 Bad Request - Missing required fields
{
  "errors": [
    {
      "field": "title.fr",
      "message": "Ce champ est requis"
    },
    {
      "field": "eventDate",
      "message": "La date doit être au format YYYY-MM-DD"
    }
  ]
}

// 400 Bad Request - Invalid locale
{
  "errors": [
    {
      "message": "Locale non supportée. Utilisez: fr, ar, ou en",
      "name": "ValidationError"
    }
  ]
}
```

#### **Server Errors**

```json
// 500 Internal Server Error
{
  "errors": [
    {
      "message": "Erreur interne du serveur",
      "name": "InternalServerError"
    }
  ]
}

// 503 Service Unavailable - Database connection issues
{
  "errors": [
    {
      "message": "Service temporairement indisponible. Réessayez dans quelques minutes.",
      "name": "ServiceUnavailableError"
    }
  ]
}
```

### **8.2 Tunisia-Specific Error Handling**

#### **Network Resilience Patterns**

```ts
// Tunisia-optimized API client with comprehensive error handling
class RotaryApiClient {
  private baseUrl: string;
  private maxRetries: number = 3;
  private timeout: number = 15000; // 15 seconds for Tunisian networks

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle specific error types
          if (response.status === 401) {
            // Token expired - attempt refresh
            if (this.refreshToken) {
              await this.refreshToken();
              // Retry with new token
              continue;
            }
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          }

          if (response.status === 429) {
            // Rate limited - wait and retry
            const retryAfter = response.headers.get('Retry-After') || '5';
            await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
            continue;
          }

          throw new Error(errorData.errors?.[0]?.message || `Erreur HTTP ${response.status}`);
        }

        return await response.json();

      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error.name === 'TypeError' && lastError.message.includes('Failed to fetch')) {
          // Network error - retry with exponential backoff
          if (attempt < this.maxRetries) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          }
        }

        // Don't retry validation errors
        if (error.message.includes('Ce champ est requis') ||
            error.message.includes('ValidationError')) {
          throw error;
        }
      }
    }

    throw lastError || new Error('Échec de la requête après plusieurs tentatives');
  }

  // Helper methods for common endpoints
  async getEvents(locale: string = 'fr', filters: any = {}) {
    const params = new URLSearchParams({
      locale,
      ...Object.fromEntries(
        Object.entries(filters).map(([k, v]) => [`where[${k}]`, v])
      )
    });

    return this.request(`/events?${params}`);
  }

  async createEvent(eventData: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }
}
```

#### **Offline-First Error Handling**

```ts
// Offline detection and queue management for Tunisia
class OfflineManager {
  private isOnline: boolean = true;
  private queue: Array<{ endpoint: string; options: RequestInit }> = [];

  constructor() {
    this.setupNetworkDetection();
  }

  private setupNetworkDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async request(endpoint: string, options: RequestInit = {}) {
    if (!this.isOnline) {
      // Queue request for when connection is restored
      this.queue.push({ endpoint, options });
      throw new Error('Aucune connexion internet. La requête sera envoyée quand la connexion sera rétablie.');
    }

    try {
      return await fetch(endpoint, options);
    } catch (error) {
      if (!navigator.onLine) {
        this.queue.push({ endpoint, options });
        throw new Error('Connexion perdue. Les données seront synchronisées automatiquement.');
      }
      throw error;
    }
  }

  private async processQueue() {
    while (this.queue.length > 0) {
      const { endpoint, options } = this.queue.shift()!;
      try {
        await fetch(endpoint, options);
      } catch (error) {
        // Re-queue failed requests
        this.queue.unshift({ endpoint, options });
        break;
      }
    }
  }
}
```

### **8.3 Error Monitoring & Alerting**

#### **Sentry Integration for API Errors**

```ts
// src/payload.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Tunisia-specific error filtering
  beforeSend(event) {
    // Filter out common network-related errors
    if (event.exception?.values?.[0]?.type === 'TypeError' &&
        event.exception.values[0].value?.includes('Failed to fetch')) {
      return null; // Don't report common network issues
    }

    // Add Tunisia-specific context
    event.tags = {
      ...event.tags,
      region: 'tunisia',
      network_type: 'mobile'
    };

    return event;
  },
  // Capture API-specific errors
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Console({ levels: ['error'] })
  ]
});
```

#### **API Performance Monitoring**

```ts
// src/middleware/apiMonitoring.ts
import { NextApiRequest, NextApiResponse } from 'next';

export function withApiMonitoring(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    const endpoint = req.url;

    try {
      const result = await handler(req, res);
      const duration = Date.now() - startTime;

      // Log API performance for Tunisia optimization
      console.log(`API ${endpoint} completed in ${duration}ms`);

      // Alert on slow responses (>5s for Tunisia)
      if (duration > 5000) {
        console.warn(`Slow API response: ${endpoint} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log API errors with Tunisia context
      console.error(`API Error ${endpoint}:`, {
        error: error.message,
        duration,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      });

      throw error;
    }
  };
}
```

## 📈 **9. API Versioning & Deprecation**

### **9.1 Versioning Strategy**

#### **URL-Based Versioning**

```bash
# Current stable version (recommended)
GET /api/v1/events

# Legacy version (deprecated)
GET /api/v0/events

# Experimental features
GET /api/v2/events
```

#### **Header-Based Versioning**

```http
GET /api/events
X-API-Version: 1.2
Accept: application/vnd.rotary.v1+json
```

### **9.2 Deprecation Policy**

#### **Deprecation Timeline**

1. **Announcement Phase** (30 days)
   - API marked as `deprecated: true` in responses
   - Warning headers added to responses
   - Documentation updated with migration guide

2. **Sunset Phase** (90 days)
   - API still functional but not maintained
   - Error responses include migration instructions
   - Support tickets prioritized lower

3. **Retirement Phase**
   - API removed from service
   - 410 Gone responses for all requests
   - Legacy data migration required

#### **Deprecation Response Example**

```json
{
  "data": [...],
  "meta": {
    "deprecated": true,
    "deprecation_date": "2024-12-31",
    "sunset_date": "2025-03-31",
    "migration_guide": "https://docs.rotarytunis.org/api/migration-v1-to-v2",
    "alternative_endpoint": "/api/v2/events"
  },
  "warnings": [
    {
      "type": "deprecation",
      "message": "Cette version de l'API sera supprimée le 31 mars 2025. Veuillez migrer vers la v2."
    }
  ]
}
```

### **9.3 Breaking Change Policy**

#### **Non-Breaking Changes** (Safe to deploy)
- Adding new optional fields
- Adding new endpoints
- Adding new optional query parameters
- Adding new response fields
- Improving error messages

#### **Breaking Changes** (Require new version)
- Removing fields or endpoints
- Changing field types or formats
- Changing authentication requirements
- Modifying error response formats
- Changing rate limits

#### **Change Communication**

```ts
// src/middleware/apiVersioning.ts
export function apiVersionMiddleware(req, res, next) {
  const requestedVersion = req.headers['x-api-version'] || 'v1';
  const currentVersion = 'v1';

  if (requestedVersion !== currentVersion) {
    res.setHeader('Warning', `299 rotary "API version ${requestedVersion} is deprecated. Use ${currentVersion} instead."`);
    res.setHeader('X-API-Deprecated', 'true');
  }

  req.apiVersion = requestedVersion;
  next();
}
```

## 🔄 **10. Advanced Integration Patterns**

### **10.1 Bulk Operations**

#### **Bulk Event Creation**

```ts
// POST /api/events/bulk
// Content-Type: application/json
{
  "events": [
    {
      "title": { "fr": "Événement 1", "ar": "حدث 1" },
      "eventDate": "2024-01-15",
      "status": "draft"
    },
    {
      "title": { "fr": "Événement 2", "ar": "حدث 2" },
      "eventDate": "2024-01-20",
      "status": "draft"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "created": [
    { "id": "652fabc12c7f5b8d12a3b4c5", "title": { "fr": "Événement 1" } },
    { "id": "652fabc12c7f5b8d12a3b4c6", "title": { "fr": "Événement 2" } }
  ],
  "errors": []
}
```

#### **Bulk Media Upload**

```ts
// POST /api/media/bulk
// Content-Type: multipart/form-data
{
  "files": [file1, file2, file3],
  "metadata": [
    { "altText": { "fr": "Photo 1", "ar": "صورة 1" }, "consentObtained": true },
    { "altText": { "fr": "Photo 2", "ar": "صورة 2" }, "consentObtained": true },
    { "altText": { "fr": "Photo 3", "ar": "صورة 3" }, "consentObtained": true }
  ]
}
```

### **10.2 Advanced Filtering & Search**

#### **Complex Event Filtering**

```bash
# Multiple filters with AND/OR logic
GET /api/events?where[AND][0][status][equals]=published&where[AND][1][OR][0][areasOfFocus][contains]=education&where[AND][1][OR][1][areasOfFocus][contains]=health&locale=fr&limit=10
```

#### **Full-Text Search**

```bash
# Search in title and description
GET /api/events?where[OR][0][title.fr][like]=*rotary*&where[OR][1][description.fr][like]=*service*&locale=fr
```

#### **Date Range Queries**

```bash
# Events in specific date range
GET /api/events?where[eventDate][greater_than]=2024-01-01&where[eventDate][less_than]=2024-12-31&locale=fr
```

### **10.3 Real-Time Subscriptions (WebSocket Alternative)**

#### **Server-Sent Events for Updates**

```ts
// Client-side implementation
const eventSource = new EventSource('/api/events/sse?locale=fr');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New event:', data);

  // Update UI with new event
  updateEventList(data);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  // Fallback to polling for Tunisia networks
  startPolling();
};
```

#### **Long Polling Fallback**

```ts
// Tunisia-optimized polling for spotty networks
async function pollForUpdates(lastUpdateTime) {
  try {
    const response = await fetch(
      `/api/events/updates?since=${lastUpdateTime}&locale=fr`,
      { timeout: 30000 }
    );

    if (response.ok) {
      const updates = await response.json();
      if (updates.length > 0) {
        handleUpdates(updates);
      }
    }
  } catch (error) {
    console.log('Polling failed, will retry...');
  }

  // Retry after 30 seconds (Tunisian network friendly)
  setTimeout(() => pollForUpdates(Date.now()), 30000);
}
```

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
- [ ] When implementing new collections or fields

### **Document Approval Process**

| Action | Responsible | Timeline | Approval Required |
|--------|-------------|----------|-------------------|
| Initial creation | Tech Lead | Before development | Digital Steward |
| Monthly updates | Digital Steward | First Monday monthly | Tech Lead |
| Major revisions | CISO Consultant | After security incidents | Board |
| Annual review | Board Security Committee | Q4 each year | Full Board |

---

## ✅ **Final Integration Philosophy**

> **"This API isn't just endpoints—it's the bridge that connects Rotary volunteers with their communities. Every integration must answer: 'Does this help a Tunisian share their service story in French and Arabic with zero technical barriers?'"**

This API documentation ensures:

- ✅ **Clear, maintainable integrations** that survive volunteer turnover
- ✅ **Tunisia-specific implementation** that respects cultural context
- ✅ **Mobile-first design** for common Tunisian Android devices
- ✅ **Type-safe development** that prevents common bugs
- ✅ **Partner consistency** that ensures quality across contributors

> 💡 **Critical Success Factor**: All integrations must be validated by actual Rotary Tunis Doyen volunteers—not just developers. If a 70-year-old volunteer can't understand the impact of your integration, it fails our core principles.

> 📌 **Remember**: An API is only as good as its documentation. Update this guide whenever reality diverges from plan—it's your most valuable project asset.# 📡 **API Documentation & Integration Guide**  
>
## *Official Reference for Rotary Club Tunis Doyen CMS*

> **"This API enables Rotary volunteers to share their impact stories across linguistic boundaries—without technical barriers."**  
> *A comprehensive reference for frontend developers, third-party integrators, and future partners*

---

## 🌐 **1. API Overview**

### **Core Specifications**

| Property | Value | Tunisia-Specific Notes |
|----------|-------|------------------------|
| **Base URL** | `https://rotary-tunis-doyen.vercel.app/api` | Always use HTTPS (TLS 1.3) |
| **Protocols** | REST (default), GraphQL (optional) | REST recommended for Tunisia's network conditions |
| **Authentication** | Public read access; JWT for admin operations | Never expose admin credentials in client code |
| **Rate Limits** | None on Vercel free tier | Encourage caching for mobile users |
| **CORS** | Configured for `*.rotarytunis.org` only | Prevents unauthorized API consumption |
| **Response Format** | JSON with consistent structure | Proper Arabic encoding (`UTF-8`) |
| **Default Locale** | `fr` (French) | Matches Tunisia's working language |
| **Fallback Locale** | `fr` → `ar` → `en` | Tunisia-specific cascade |

### **Tunisia-Specific Performance Considerations**

- **API Timeout**: 30 seconds (accommodates spotty Tunisian networks)
- **Mobile Optimization**: Responses limited to 50KB where possible
- **Image Handling**: Media served via Backblaze B2 (optimized for web)
- **Network Resilience**: Designed to work with 3G connectivity

> 💡 **Pro Tip**: For Tunisian mobile users, implement request retries with exponential backoff:
>
> ```ts
> const fetchWithRetry = async (url, options = {}, retries = 3) => {
>   try {
>     return await fetch(url, options);
>   } catch (error) {
>     if (retries > 0) {
>       await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
>       return fetchWithRetry(url, options, retries - 1);
>     }
>     throw error;
>   }
> };
>
```

---

## 🔐 **2. Authentication & Access**

### **Public Content (No Authentication Required)**

All `GET` requests to content endpoints are publicly accessible:

- `/api/events`
- `/api/posts`
- `/api/media`

**Example Request:**

```bash
curl "https://rotary-tunis-doyen.vercel.app/api/events?where[status][equals]=published"
```

### **Admin Access (JWT Authentication Required)**

For content creation, updates, and administrative operations:

#### **Step 1: Obtain JWT Token**

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@rotarytunis.org",
  "password": "your-strong-password"
}
```

**Successful Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx",
  "user": {
    "id": "652fabc12c7f5b8d12a3b4c5",
    "email": "admin@rotarytunis.org",
    "role": "admin"
  }
}
```

#### **Step 2: Include Token in Requests**

```http
GET /api/events
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### **Tunisia-Specific Security Implementation**

```ts
// src/payload.config.ts
auth: {
  tokenExpiration: 7 * 24 * 60 * 60, // 7 days (Tunisia network conditions)
  cookies: {
    secure: true,
    sameSite: 'strict' as const,
    path: '/admin',
    domain: process.env.VERCEL_URL?.replace('https://', '') || undefined
  },
  maxLoginAttempts: 5, // Prevents brute force
  lockTime: 60 * 60 * 1000, // 1 hour lock after 5 failed attempts
}
```

> 🔐 **Critical Security Notes for Tunisia**:  
>
> - **Never expose `PAYLOAD_SECRET`** in client-side code or public repositories  
> - **Always use HTTPS**—Tunisian networks are vulnerable to MITM attacks  
> - **Rotate credentials quarterly**—document process for future maintainers  
> - **Admin sessions time out after 30 minutes of inactivity** (configurable per device)  

---

## 📋 **3. Collections & Endpoints**

### **3.1 Events Collection**

#### **`GET /api/events` - Retrieve Published Events**

Fetch all published events with proper localization.

**Query Parameters:**

| Parameter | Description | Default | Tunisia-Specific Notes |
|-----------|-------------|---------|------------------------|
| `where[status][equals]` | Filter by publication status | `published` | Use `draft` for admin previews |
| `locale` | Language to prioritize | `fr` | `ar` for Arabic, `en` for English |
| `depth` | Relationship resolution depth | `0` | Set to `1` to resolve media |
| `limit` | Results per page | `10` | Reduce for mobile performance |
| `page` | Pagination page | `1` | For infinite scroll implementations |

**Example Request:**

```bash
curl "https://rotary-tunis-doyen.vercel.app/api/events?locale=ar&depth=1&limit=5"
```

**Response (200 OK):**

```json
{
  "docs": [
    {
      "id": "652fabc12c7f5b8d12a3b4c5",
      "title": {
        "fr": "Soirée de bienfaisance",
        "ar": "المساء الخيري",
        "en": "Charity Evening"
      },
      "slug": {
        "fr": "soiree-bienfaisance",
        "ar": "المساء-الخيري",
        "en": "charity-evening"
      },
      "eventDate": "2024-03-15",
      "location": {
        "fr": "Tunis",
        "ar": "تونس",
        "en": "Tunis"
      },
      "description": {
        "ar": "<p dir=\"rtl\" class=\"arabic-content\">المساء الخيري لجمع التبرعات...</p>"
      },
      "gallery": [
        {
          "id": "652fabc12c7f5b8d12a3b4c6",
          "image": {
            "id": "652fabc12c7f5b8d12a3b4c7",
            "url": "https://f005.backblazeb2.com/file/rotary-tunis-media/...",
            "altText": {
              "fr": "Bénévoles servant des repas",
              "ar": "المتطوعون يقدمون الوجبات"
            }
          },
          "caption": {
            "fr": "Distribution de repas aux nécessiteux",
            "ar": "توزيع الوجبات على المحتاجين"
          }
        }
      ],
      "areasOfFocus": ["health", "education"],
      "impactMetrics": {
        "mealsServed": 150,
        "treesPlanted": 50,
        "volunteerHours": 120
      },
      "createdAt": "2024-02-10T08:30:00.000Z",
      "updatedAt": "2024-02-10T08:30:00.000Z",
      "locale": "ar",
      "updatedAt": "2024-02-10T08:30:00.000Z"
    }
  ],
  "totalDocs": 12,
  "totalPages": 3,
  "page": 1,
  "limit": 5,
  "hasPrevPage": false,
  "hasNextPage": true
}
```

#### **Tunisia-Specific Response Features**

- Arabic content includes `dir="rtl"` and `class="arabic-content"` for proper rendering
- Date format follows Tunisian standard (`YYYY-MM-DD`)
- Image URLs point to Backblaze B2 (optimized for performance)
- `areasOfFocus` uses Rotary's 7 Areas of Focus taxonomy

#### **`GET /api/events/:id` - Fetch Single Event**

Retrieve a specific event with full localization.

**Example Request:**

```bash
curl "https://rotary-tunis-doyen.vercel.app/api/events/652fabc12c7f5b8d12a3b4c5?locale=fr"
```

**Critical Tunisia-Specific Note**:  
> When requesting an Arabic (`ar`) event, the API automatically checks if content exists. If not, it returns French (`fr`) content per Tunisia's language cascade rules.

#### **`POST /api/events` (Admin Only) - Create New Event**

Create a new event with trilingual content.

**Request Headers:**

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": {
    "fr": "Nouvel événement",
    "ar": "حدث جديد",
    "en": "New Event"
  },
  "eventDate": "2024-04-01",
  "location": {
    "fr": "Tunis",
    "ar": "تونس",
    "en": "Tunis"
  },
  "description": {
    "fr": "<p>Contenu en français ici</p>",
    "ar": "<p dir=\"rtl\" class=\"arabic-content\">محتوى بالعربية هنا</p>"
  },
  "gallery": [
    {
      "image": "652fabc12c7f5b8d12a3b4c7",
      "caption": {
        "fr": "Photo de l'événement",
        "ar": "صورة الحدث"
      }
    }
  ],
  "areasOfFocus": ["environment", "peace"],
  "impactMetrics": {
    "treesPlanted": 100
  },
  "status": "draft"
}
```

**Tunisia-Specific Automation**:  
> Upon French (`fr`) event creation, the `syncArabicAfterCreate` hook automatically creates an Arabic (`ar`) draft with `[AR]` prefix. No additional request needed.

---

### **3.2 Media Collection**

#### **`GET /api/media` - Retrieve Media Assets**

Fetch all approved media assets with proper alt text.

**Example Request:**

```bash
curl "https://rotary-tunis-doyen.vercel.app/api/media?where[consentObtained][equals]=true"
```

**Response Features:**

- Only returns media with `consentObtained: true` by default
- Includes both French and Arabic `altText`
- Provides optimized image variants (thumbnail, card)
- Returns EXIF-stripped versions for privacy

**Critical Tunisia-Specific Implementation**:  

```ts
// src/collections/Media.ts
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
  handler: async ({ req, data, file, operation }) => {
    if (operation === 'create') {
      // Strip EXIF metadata for GDPR compliance
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
}
```

---

### **3.3 Minutes Collection (Restricted Access)**

#### **`GET /api/minutes` - Retrieve Board Documents**

*Admin access required*

**Example Request:**

```bash
curl "https://rotary-tunis-doyen.vercel.app/api/minutes?where[meetingDate][greater_than]=2024-01-01" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Tunisia-Specific Security Implementation**:

```ts
// src/collections/Minutes.ts
access: {
  read: ({ req: { user } }) => user.role === 'admin',
  create: ({ req: { user } }) => user.role === 'admin',
  update: ({ req: { user } }) => user.role === 'admin',
  delete: ({ req: { user } }) => user.role === 'admin',
}
```

> 🔐 **Critical Note**: Minutes are private documents accessible only to admins—never exposed via public API.

---

## 🔄 **4. Real-Time & Webhooks**

### **4.1 Tunisia-Specific Update Notification Pattern**

Since Payload doesn't natively support webhooks, use this Tunisia-optimized pattern:

#### **Recommended: Polling with Timestamp Tracking**

For external systems needing updates (e.g., mobile apps, social media):

```ts
// Example: Check for updated events since last sync
const checkForUpdates = async (lastSyncTime) => {
  const response = await fetch(
    `https://rotary-tunis-doyen.vercel.app/api/events?where[updatedAt][greater_than]=${lastSyncTime}&limit=100`
  );
  return response.json();
};

// Usage
const lastSyncTime = localStorage.getItem('lastEventSync') || new Date(0).toISOString();
const { docs } = await checkForUpdates(lastSyncTime);
localStorage.setItem('lastEventSync', new Date().toISOString());

// Process updated events
docs.forEach(event => {
  // Update local cache or trigger notifications
});
```

**Why This Works for Tunisia**:  

- Minimizes data usage (critical for mobile users)
- Handles spotty network connectivity with retry logic
- Simple implementation that works within free tier constraints
- Avoids complex webhook infrastructure

#### **Advanced: Custom Webhook Trigger**

For critical integrations requiring real-time updates:

```ts
// src/hooks/triggerWebhooks.ts
import { CollectionBeforeChangeHook } from 'payload/types';

export const triggerWebhooks: CollectionBeforeChangeHook = async ({ 
  doc, 
  req, 
  operation 
}) => {
  // Tunisia-specific: Only trigger for published content
  if (operation === 'update' && doc._status === 'published') {
    try {
      await fetch('https://external-system.com/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: doc.id,
          type: 'event',
          action: 'published',
          locale: doc.locale,
          timestamp: new Date().toISOString(),
          // Tunisia-specific: Include French title for notifications
          title: doc.title.fr
        })
      });
    } catch (error) {
      req.payload.logger.error(`Webhook failed: ${error.message}`);
    }
  }
  return doc;
};
```

**Attach to Events Collection:**

```ts
// src/collections/Events.ts
hooks: {
  beforeChange: [triggerWebhooks]
}
```

> ⚠️ **Tunisia-Specific Considerations**:  
>
> - Use exponential backoff for failed webhook deliveries  
> - Store webhook delivery status for troubleshooting  
> - Limit to critical events (published content only)  
> - Include French title for notifications (more widely understood)  

---

## 🧱 **5. Frontend Integration (Next.js)**

### **5.1 Fetching Content with ISR (Tunisia-Optimized)**

#### **Static Site Generation with Fallback**

```tsx
// pages/events/index.tsx
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  // Tunisia-specific: Use 15s timeout for spotty networks
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(
      `https://rotary-tunis-doyen.vercel.app/api/events?locale=${locale}&where[status][equals]=published`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch events');
    
    const { docs } = await response.json();
    return {
      props: {
        ...(await serverSideTranslations(locale as string, ['common'])),
        events: docs
      },
      // Revalidate every 1 hour (Tunisia content update frequency)
      revalidate: 3600
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      props: {
        ...(await serverSideTranslations(locale as string, ['common'])),
        events: []
      },
      revalidate: 60 // Try again sooner on error
    };
  }
};

const EventsPage = ({ events }: { events: any[] }) => {
  // Component implementation
};
```

### **5.2 Handling RTL Content (Tunisia-Specific)**

#### **Universal Content Renderer**

```tsx
// components/ContentRenderer.tsx
import React from 'react';

interface ContentRendererProps {
  content: string;
  locale: string;
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  content, 
  locale, 
  className = '' 
}) => {
  // Tunisia-specific: Arabic requires special handling
  const isArabic = locale === 'ar';
  
  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${className} ${isArabic ? 'arabic-content' : ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default ContentRenderer;
```

#### **CSS for Proper Arabic Typography**

```css
/* Tunisia-specific Arabic typography */
.arabic-content {
  line-height: 1.6; /* Critical for Arabic readability */
  text-align: right;
  direction: rtl;
  font-family: 'Tajawal', sans-serif;
  font-size: 16px;
}

.arabic-content p {
  margin-bottom: 1.5em;
}

.arabic-content blockquote {
  border-right: 3px solid #005daa;
  padding-right: 16px;
  margin-right: 0;
}
```

### **5.3 Mobile-First Image Loading (Tunisia-Specific)**

```tsx
// components/OptimizedImage.tsx
import React from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  media: any;
  size?: 'thumbnail' | 'card' | 'original';
  alt?: string;
  className?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  media, 
  size = 'card',
  alt, 
  className 
}) => {
  // Tunisia-specific: Use French alt text as fallback
  const getAltText = () => {
    if (alt) return alt;
    if (media.altText?.fr) return media.altText.fr;
    if (media.altText?.ar) return media.altText.ar;
    return 'Image';
  };

  // Tunisia-specific: Mobile-first sizing
  const width = size === 'thumbnail' ? 300 : size === 'card' ? 600 : undefined;
  const height = size === 'thumbnail' ? 300 : size === 'card' ? 400 : undefined;

  return (
    <Image
      src={media.url}
      alt={getAltText()}
      width={width}
      height={height}
      className={className}
      // Tunisia-specific: Optimize for mobile networks
      loading="lazy"
      placeholder="blur"
      blurDataURL="/placeholder.svg"
    />
  );
};

export default OptimizedImage;
```

> ✅ **Tunisia-Specific Best Practices**:  
>
> - Always provide French alt text as fallback (more widely understood)  
> - Use `loading="lazy"` to improve mobile performance  
> - Implement placeholder images to reduce layout shifts  
> - Respect Tunisia's network conditions with optimized image sizes  

---

## 🛠️ **6. Development & Testing**

### **6.1 Local API Testing Workflow**

#### **Step 1: Start Development Server**

```bash
npm run dev
```

#### **Step 2: Access Local API**

- Base URL: `http://localhost:3000/api`
- Admin UI: `http://localhost:3000/admin`

#### **Step 3: Test Requests with Curl**

```bash
# Public events request
curl "http://localhost:3000/api/events?locale=fr"

# Admin login (replace credentials)
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@rotarytunis.org", "password":"test123"}'
```

### **6.2 Tunisia-Specific Testing Protocol**

#### **Mobile Device Testing Checklist**

| Test | Method | Success Criteria | Tunisia-Specific Reason |
|------|--------|------------------|-------------------------|
| **3G Network Simulation** | Chrome DevTools throttling | Load time < 8s | Common Tunisian network speed |
| **Small Screen Rendering** | Test on Xiaomi Redmi 9A | No horizontal scrolling | Most common <$150 Android |
| **Touch Target Size** | Measure with ruler | ≥ 48x48px | Glove-friendly interaction |
| **Arabic Typography** | Native speaker review | Line height ≥ 1.6 | Critical for Arabic readability |
| **French Date Format** | Verify display | `dd/MM/yyyy` | Tunisian standard format |

#### **Localization Testing Matrix**

```markdown
# TUNISIA LOCALIZATION TEST MATRIX

## [ ] French Content
- [ ] Date format: `dd/MM/yyyy`
- [ ] Number format: `1 000,5`
- [ ] Proper French typography
- [ ] No American English terms

## [ ] Arabic Content
- [ ] Text direction: RTL
- [ ] Line height: ≥ 1.6
- [ ] Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩)
- [ ] Proper Arabic typography

## [ ] Cross-Language
- [ ] French → Arabic auto-draft works
- [ ] Missing Arabic shows French (not English)
- [ ] Alt text in both French/Arabic
- [ ] Cultural appropriateness validated
```

### **6.3 Postman Collection Setup**

1. **Import Collection**:  
   Download `rotary-tunis-doyen-api.postman_collection.json` from `/docs` directory

2. **Set Environment Variables**:  

   ```json
{
     "api_base_url": "https://rotary-tunis-doyen.vercel.app/api",
     "test_email": "test@rotarytunis.org",
     "test_password": "test123"
   }
```

3. **Run Collection Tests**:  
   - Public Content Tests
   - Authentication Flow
   - Event Creation Workflow
   - Tunisia-Specific Localization

> 💡 **Pro Tip**: All Postman tests include Tunisia-specific assertions for date formats, Arabic typography, and localization workflows.

---

## 🤝 **7. Partner Support for Advanced Integrations**

### **7.1 Tunisia-Specific Integration Scenarios**

#### **Social Media Amplification**

```ts
// src/endpoints/social.ts
import { Express } from 'express';
import { createPost } from '../integrations/social';

export default (app: Express) => {
  app.post('/api/social/publish', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
      const { eventId, platforms } = req.body;
      
      // Fetch event data (Tunisia-specific French title priority)
      const eventRes = await fetch(
        `https://rotary-tunis-doyen.vercel.app/api/events/${eventId}?locale=fr`
      );
      const event = await eventRes.json();
      
      // Publish to selected platforms
      const results = await Promise.all(
        platforms.map(platform => 
          createPost(platform, {
            title: event.title.fr,
            description: event.description.fr.substring(0, 200),
            imageUrl: event.gallery[0]?.image?.url,
            link: `/events/${event.slug.fr}`
          })
        )
      );
      
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ error: 'Erreur de publication' });
    }
  });
};
```

**Supported Platforms**:  

- Facebook
- WhatsApp
- LinkedIn
- Rotary International channels

#### **Email Newsletter Integration**

```ts
// src/endpoints/newsletter.ts
import { Express } from 'express';
import { sendNewsletter } from '../integrations/email';

export default (app: Express) => {
  app.post('/api/newsletter/generate', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
      const { month, year } = req.body;
      
      // Fetch monthly events (Tunisia-specific date handling)
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;
      
      const eventsRes = await fetch(
        `https://rotary-tunis-doyen.vercel.app/api/events?where[eventDate][between]=${startDate},${endDate}`
      );
      const { docs: events } = await eventsRes.json();
      
      // Generate newsletter in French/Arabic
      const newsletter = {
        fr: generateNewsletterContent(events, 'fr'),
        ar: generateNewsletterContent(events, 'ar')
      };
      
      // Send to Mailchimp/Sendinblue
      const result = await sendNewsletter(newsletter);
      
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: 'Erreur de génération' });
    }
  });
};
```

### **7.2 Recommended Agencies for Tunisia-Specific Work**

#### **Top Partners for Rotary Implementation**

| Partner | Why Recommended for Tunisia | Specific Expertise |
|---------|------------------------------|---------------------|
| **Distinction** | Extensive public sector experience; strong on GDPR compliance | • Tunisia-specific GDPR requirements<br>• French-first API design<br>• Microsoft ecosystem integration |
| **Humaan** | Award-winning UX focus; excellent accessibility implementation | • Volunteer-friendly API documentation<br>• Arabic typography expertise<br>• Mobile-first integration patterns |
| **Enrise B.V.** | Deep Payload expertise; GDPR/compliance specialists | • Tunisia-specific security<br>• Data protection for French members<br>• Performance optimization |
| **FocusReactive** | Content modeling specialists; perfect for Rotary's impact reporting | • Tunisia-specific content workflows<br>• French → Arabic auto-draft<br>• Impact metrics API design |

> 🔗 **Find All Partners**: [Payload Partners Directory](https://payloadcms.com/partners)

### **7.3 Partner Engagement Protocol**

1. **Share this API documentation** before any work begins
2. **Require Tunisia-specific validation** in all deliverables
3. **Include native Arabic speaker review** for RTL implementation
4. **Test on common Tunisian Android devices** (Xiaomi Redmi 9A)
5. **Document integration process** with French-first training materials

> 💡 **Pro Tip**: All partner work must include Tunisia-specific documentation updates—API without proper documentation fails our volunteer sustainability principle.

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
- [ ] When implementing new collections or fields

### **Document Approval Process**

| Action | Responsible | Timeline | Approval Required |
|--------|-------------|----------|-------------------|
| Initial creation | Tech Lead | Before development | Digital Steward |
| Monthly updates | Digital Steward | First Monday monthly | Tech Lead |
| Major revisions | CISO Consultant | After security incidents | Board |
| Annual review | Board Security Committee | Q4 each year | Full Board |

---

## ✅ **Final Integration Philosophy**

> **"This API isn't just endpoints—it's the bridge that connects Rotary volunteers with their communities. Every integration must answer: 'Does this help a Tunisian share their service story in French and Arabic with zero technical barriers?'"**

This API documentation ensures:

- ✅ **Clear, maintainable integrations** that survive volunteer turnover
- ✅ **Tunisia-specific implementation** that respects cultural context
- ✅ **Mobile-first design** for common Tunisian Android devices
- ✅ **Type-safe development** that prevents common bugs
- ✅ **Partner consistency** that ensures quality across contributors

> 💡 **Critical Success Factor**: All integrations must be validated by actual Rotary Tunis Doyen volunteers—not just developers. If a 70-year-old volunteer can't understand the impact of your integration, it fails our core principles.

> 📌 **Remember**: An API is only as good as its documentation. Update this guide whenever reality diverges from plan—it's your most valuable project asset.
good as its documentation. Update this guide whenever reality diverges from plan—it's your most valuable project asset.
