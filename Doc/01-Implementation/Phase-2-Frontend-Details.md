# 🌐 **Phase 2: Frontend Development & Internationalization - Detailed Specifications**

## *Multilingual Frontend Implementation Guide*

---

## 🌐 **3. FRONTEND DEVELOPMENT & INTERNATIONALIZATION**

### **3.1 Enhance Next.js Internationalization**

**Status:** ⏳ Not Started | **Priority:** High | **Estimated Time:** 8 hours

#### **Dependencies:** Collections must be enhanced first

#### **Files to Modify:**

- `src/middleware.ts` (create new)
- `src/i18n/` (create directory structure)
- `src/app/[locale]/` (enhance existing)

#### **Reference Patterns:**

- Build upon existing trilingual configuration
- Follow Next.js App Router patterns
- Use existing font and styling setup

#### **3.1.1 Configure Next-Intl Setup**

**⏱️ Time:** 90 minutes | **Assignee:** Frontend Developer

**Implementation Steps:**

1. Install and configure next-intl:

```bash
npm install next-intl
```

2. Create middleware:

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fr', 'ar', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

3. Create i18n configuration:

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}));
```

**Validation Criteria:**

- [ ] next-intl properly configured
- [ ] Middleware routing working
- [ ] Locale detection functional
- [ ] Translation files loading

**Definition of Done:**

- [ ] i18n setup complete
- [ ] All locales accessible
- [ ] Routing working correctly
- [ ] No configuration errors

#### **3.1.2 Create Localized Routing**

**⏱️ Time:** 75 minutes | **Assignee:** Frontend Developer

**Dependencies:** Complete 3.1.1

**Implementation Steps:**

1. Create localized page structure:

```
src/app/[locale]/
├── page.tsx (homepage)
├── evenements/
│   ├── page.tsx (events list)
│   └── [slug]/page.tsx (event detail)
├── articles/
│   ├── page.tsx (articles list)
│   └── [slug]/page.tsx (article detail)
└── layout.tsx (localized layout)
```

2. Implement dynamic routing:

```typescript
// src/app/[locale]/evenements/page.tsx
import { useTranslations } from 'next-intl';

export default function EventsPage({ params: { locale } }) {
  const t = useTranslations('Events');

  return (
    <div>
      <h1>{t('title')}</h1>
      {/* Events list implementation */}
    </div>
  );
}
```

**Validation Criteria:**

- [ ] All pages accessible in all locales
- [ ] URL structure consistent
- [ ] SEO-friendly URLs
- [ ] Navigation working

**Definition of Done:**

- [ ] Localized routing complete
- [ ] All pages accessible
- [ ] SEO optimization implemented
- [ ] Navigation functional

#### **3.1.3 Build Translation Management**

**⏱️ Time:** 60 minutes | **Assignee:** Frontend Developer

**Dependencies:** Complete 3.1.2

**Implementation Steps:**

1. Create translation files:

```json
// src/messages/fr.json
{
  "Navigation": {
    "home": "Accueil",
    "events": "Événements",
    "articles": "Articles",
    "about": "À propos"
  },
  "Events": {
    "title": "Événements",
    "upcoming": "Événements à venir",
    "past": "Événements passés"
  }
}
```

2. Implement translation validation:

```typescript
// scripts/validate-translations.ts
const validateTranslations = () => {
  // Check for missing keys across locales
  // Validate translation completeness
};
```

**Validation Criteria:**

- [ ] All translation keys defined
- [ ] Translation completeness validated
- [ ] Fallback translations working
- [ ] Translation workflow documented

**Definition of Done:**

- [ ] Translation system complete
- [ ] All content translated
- [ ] Validation scripts working
- [ ] Workflow documented

#### **3.1.4 Implement Language Switching**

**⏱️ Time:** 45 minutes | **Assignee:** Frontend Developer

**Dependencies:** Complete 3.1.3

**Implementation Steps:**

1. Create language switcher component:

```typescript
// src/components/LanguageSwitcher.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="language-switcher">
      <button onClick={() => switchLanguage('fr')}>Français</button>
      <button onClick={() => switchLanguage('ar')}>العربية</button>
      <button onClick={() => switchLanguage('en')}>English</button>
    </div>
  );
}
```

**Validation Criteria:**

- [ ] Language switching functional
- [ ] URL updates correctly
- [ ] State preserved across switches
- [ ] Smooth transitions

**Definition of Done:**

- [ ] Language switcher implemented
- [ ] Smooth language transitions
- [ ] State management working
- [ ] User experience optimized

### **3.2 Implement Arabic RTL Support**

**Status:** ⏳ Not Started | **Priority:** High | **Estimated Time:** 6 hours

#### **Dependencies:** Complete 3.1 (Internationalization) first

#### **Files to Modify:**

- `src/styles/rtl.css` (create new)
- `src/components/ui/` (enhance existing)
- `src/app/globals.css` (modify existing)

#### **Reference Patterns:**

- Build upon existing Open Sans font configuration
- Use existing Tailwind CSS setup
- Follow accessibility best practices

#### **3.2.1 Implement RTL CSS Framework**

**⏱️ Time:** 90 minutes | **Assignee:** Frontend Developer

**Implementation Steps:**

1. Create RTL utilities:

```css
/* src/styles/rtl.css */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

[dir="rtl"] .ml-4 {
  margin-left: 0;
  margin-right: 1rem;
}

/* RTL-aware positioning */
.rtl\:right-0[dir="rtl"] {
  right: 0;
  left: auto;
}
```

2. Create directional utilities:

```typescript
// src/lib/rtl.ts
export const getDirectionClass = (locale: string) => {
  return locale === 'ar' ? 'rtl' : 'ltr';
};

export const getTextAlign = (locale: string) => {
  return locale === 'ar' ? 'text-right' : 'text-left';
};
```

**Validation Criteria:**

- [ ] RTL layout working correctly
- [ ] Text alignment proper
- [ ] Flexbox direction correct
- [ ] Positioning utilities functional

**Definition of Done:**

- [ ] RTL CSS framework complete
- [ ] Layout mirroring working
- [ ] Utilities comprehensive
- [ ] Cross-browser compatible

#### **3.2.2 Configure Arabic Typography**

**⏱️ Time:** 60 minutes | **Assignee:** Frontend Developer

**Dependencies:** Complete 3.2.1

**Implementation Steps:**

1. Configure Arabic fonts:

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&display=swap');

.arabic-text {
  font-family: 'Noto Naskh Arabic', serif;
  line-height: 1.8; /* Better for Arabic text */
  letter-spacing: 0.02em;
}

[dir="rtl"] body {
  font-family: 'Noto Naskh Arabic', serif;
}
```

2. Create typography utilities:

```typescript
// src/lib/typography.ts
export const getTypographyClass = (locale: string) => {
  return locale === 'ar' ? 'arabic-text' : 'latin-text';
};
```

**Validation Criteria:**

- [ ] Arabic fonts loading correctly
- [ ] Typography scales appropriate
- [ ] Line height optimized
- [ ] Text rendering clear

**Definition of Done:**

- [ ] Arabic typography implemented
- [ ] Font loading optimized
- [ ] Text rendering quality verified
- [ ] Performance acceptable

#### **3.2.3 Create RTL Component Library**

**⏱️ Time:** 90 minutes | **Assignee:** Frontend Developer

**Dependencies:** Complete 3.2.2

**Implementation Steps:**

1. Enhance existing components for RTL:

```typescript
// src/components/ui/button.tsx (enhance existing)
import { cn } from "@/lib/utils";
import { getDirectionClass } from "@/lib/rtl";

function Button({ className, locale, ...props }) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        getDirectionClass(locale),
        className
      )}
      {...props}
    />
  );
}
```

2. Create RTL-aware navigation:

```typescript
// src/components/Navigation.tsx
export default function Navigation({ locale }) {
  const isRTL = locale === 'ar';

  return (
    <nav className={cn(
      "flex items-center space-x-4",
      isRTL && "flex-row-reverse space-x-reverse"
    )}>
      {/* Navigation items */}
    </nav>
  );
}
```

**Validation Criteria:**

- [ ] All components RTL-compatible
- [ ] Navigation works in RTL
- [ ] Forms handle RTL correctly
- [ ] Icons and graphics appropriate

**Definition of Done:**

- [ ] RTL component library complete
- [ ] All UI components RTL-compatible
- [ ] Navigation functional in RTL
- [ ] User experience consistent

#### **3.2.4 Implement RTL Testing**

**⏱️ Time:** 45 minutes | **Assignee:** QA Developer

**Dependencies:** Complete 3.2.3

**Implementation Steps:**

1. Create RTL test suite:

```typescript
// __tests__/rtl.test.tsx
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

describe('RTL Support', () => {
  test('components render correctly in RTL', () => {
    // Test RTL rendering
  });

  test('navigation works in RTL mode', () => {
    // Test RTL navigation
  });
});
```

**Validation Criteria:**

- [ ] RTL rendering tests passing
- [ ] Cross-browser compatibility verified
- [ ] Accessibility maintained in RTL
- [ ] Performance acceptable

**Definition of Done:**

- [ ] RTL testing complete
- [ ] All tests passing
- [ ] Cross-browser verified
- [ ] Accessibility validated

### **3.3 Build Responsive Design System**

**Status:** ⏳ Not Started | **Priority:** Medium | **Estimated Time:** 4 hours

#### **Dependencies:** Complete 3.1 and 3.2 first

#### **Files to Modify:**

- `src/components/ui/` (enhance all components)
- `src/styles/components.css` (create new)
- `tailwind.config.js` (modify existing)

#### **Reference Patterns:**

- Build upon existing shadcn/ui components
- Follow Rotary International brand guidelines
- Use existing Tailwind CSS configuration

#### **3.3.1 Implement Rotary Brand System**

**⏱️ Time:** 90 minutes | **Assignee:** Frontend Developer

**Implementation Steps:**

1. Update Tailwind config with Rotary colors:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        rotary: {
          azure: '#005daa', // Primary
          sky: '#1f8dd6', // Secondary
          royal: '#003f7f', // Tertiary
          gold: '#f7a81b' // Accent
        }
      }
    }
  }
};
```

**Validation Criteria:**

- [ ] Rotary colors implemented
- [ ] Brand guidelines followed
- [ ] Color accessibility verified
- [ ] Design system consistent

**Definition of Done:**

- [ ] Brand system implemented
- [ ] Colors accessible
- [ ] Guidelines compliance verified
- [ ] Design consistency achieved

#### **3.3.2 Create Responsive Component Variants**

**⏱️ Time:** 75 minutes | **Assignee:** Frontend Developer

**Dependencies:** Complete 3.3.1

**Implementation Steps:**

1. Implement responsive variants:

```typescript
// src/components/ui/responsive-card.tsx
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveCard({ children, className }: ResponsiveCardProps) {
  return (
    <div className={cn(
      // Mobile-first responsive design
      "w-full p-4 rounded-lg shadow-sm",
      // Tablet and up
      "md:p-6 md:shadow-md",
      // Desktop and up
      "lg:p-8 lg:shadow-lg",
      className
    )}>
      {children}
    </div>
  );
}
```

**Validation Criteria:**

- [ ] Components responsive across devices
- [ ] Touch-friendly on mobile
- [ ] Performance optimized
- [ ] Accessibility maintained

**Definition of Done:**

- [ ] Responsive components complete
- [ ] All breakpoints working
- [ ] Performance acceptable
- [ ] User experience consistent

#### **3.3.3 Implement Mobile Navigation**

**⏱️ Time:** 60 minutes | **Assignee:** Frontend Developer

**Dependencies:** Complete 3.3.2

**Implementation Steps:**

1. Create mobile navigation:

```typescript
// src/components/MobileNavigation.tsx
'use client';

export default function MobileNavigation({ locale }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuIcon />
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className={cn(
            "absolute top-0 bottom-0 w-64 bg-white shadow-xl",
            locale === 'ar' ? 'right-0' : 'left-0'
          )}>
            {/* Navigation items */}
          </div>
        </div>
      )}
    </>
  );
}
```

**Validation Criteria:**

- [ ] Mobile navigation functional
- [ ] RTL support included
- [ ] Touch interactions smooth
- [ ] Accessibility compliant

**Definition of Done:**

- [ ] Mobile navigation complete
- [ ] All interactions working
- [ ] RTL support verified
- [ ] Performance optimized

#### **3.3.4 Responsive Testing & Validation**

**⏱️ Time:** 45 minutes | **Assignee:** QA Developer

**Dependencies:** Complete 3.3.3

**Implementation Steps:**

1. Create responsive test suite:

```typescript
// __tests__/responsive.test.tsx
describe('Responsive Design', () => {
  test('components adapt to mobile screens', () => {
    // Test mobile layout
  });

  test('navigation works on all screen sizes', () => {
    // Test navigation responsiveness
  });

  test('RTL layout works on mobile', () => {
    // Test RTL on mobile devices
  });
});
```

**Validation Criteria:**

- [ ] All responsive tests passing
- [ ] Cross-device compatibility verified
- [ ] Performance acceptable on mobile
- [ ] Accessibility maintained

**Definition of Done:**

- [ ] Responsive testing complete
- [ ] All tests passing
- [ ] Cross-device verified
- [ ] Performance optimized

### **3.4 Implement Dynamic Content Integration**

**Status:** ⏳ Not Started | **Priority:** High | **Estimated Time:** 6 hours

#### **Dependencies:** Complete collections enhancement and frontend setup

#### **Files to Modify:**

- `src/app/[locale]/evenements/` (enhance existing)
- `src/app/[locale]/articles/` (enhance existing)
- `src/lib/payload.ts` (create new)

#### **3.4.1 Create Content Fetching System**

**⏱️ Time:** 90 minutes | **Assignee:** Full-stack Developer

**Implementation Steps:**

1. Create Payload client:

```typescript
// src/lib/payload.ts
import { getPayloadHMR } from '@payloadcms/next/utilities';
import config from '@payload-config';

export const getPayload = async () => {
  return await getPayloadHMR({ config });
};

export const getEvents = async (locale: string, limit = 10) => {
  const payload = await getPayload();

  return await payload.find({
    collection: 'events',
    locale,
    limit,
    where: {
      status: { equals: 'published' }
    },
    sort: '-eventDate'
  });
};
```

**Validation Criteria:**

- [ ] Content fetching working
- [ ] Localization respected
- [ ] Performance optimized
- [ ] Error handling implemented

**Definition of Done:**

- [ ] Content integration complete
- [ ] Performance acceptable
- [ ] Error handling robust
- [ ] Caching implemented

#### **3.4.2 Build Content Components**

**⏱️ Time:** 120 minutes | **Assignee:** Frontend Developer

**Dependencies:** Complete 3.4.1

**Implementation Steps:**

1. Create content components:

```typescript
// src/components/content/EventCard.tsx
interface EventCardProps {
  event: Event;
  locale: string;
}

export default function EventCard({ event, locale }: EventCardProps) {
  const isRTL = locale === 'ar';

  return (
    <article className={cn(
      "bg-white rounded-lg shadow-md p-6",
      isRTL && "text-right"
    )}>
      <h3 className="text-xl font-bold mb-2">
        {event.title[locale]}
      </h3>
      <p className="text-gray-600 mb-4">
        {event.description[locale]}
      </p>
      <time className="text-sm text-gray-500">
        {formatDate(event.eventDate, locale)}
      </time>
    </article>
  );
}
```

**Validation Criteria:**

- [ ] Content components functional
- [ ] Localization working
- [ ] Performance optimized
- [ ] Error states handled

**Definition of Done:**

- [ ] Content components complete
- [ ] All data types supported
- [ ] Performance acceptable
- [ ] Error handling robust

#### **3.4.3 Implement Content Caching**

**⏱️ Time:** 75 minutes | **Assignee:** Backend Developer

**Dependencies:** Complete 3.4.2

**Implementation Steps:**

1. Implement caching strategy:

```typescript
// src/lib/cache.ts
import { unstable_cache } from 'next/cache';

export const getCachedEvents = unstable_cache(
  async (locale: string, limit: number) => {
    return await getEvents(locale, limit);
  },
  ['events'],
  { revalidate: 300 } // 5 minutes
);

export const getCachedArticles = unstable_cache(
  async (locale: string, category?: string) => {
    return await getArticles(locale, category);
  },
  ['articles'],
  { revalidate: 600 } // 10 minutes
);
```

**Validation Criteria:**

- [ ] Content caching working
- [ ] Cache invalidation functional
- [ ] Performance improved
- [ ] Memory usage acceptable

**Definition of Done:**

- [ ] Content caching complete
- [ ] Performance benchmarks met
- [ ] Cache invalidation working
- [ ] Memory usage optimized

#### **3.4.4 Content Integration Testing**

**⏱️ Time:** 45 minutes | **Assignee:** QA Developer

**Dependencies:** Complete 3.4.3

**Implementation Steps:**

1. Create content integration tests:

```typescript
// __tests__/content-integration.test.tsx
describe('Content Integration', () => {
  test('events load correctly', () => {
    // Test event loading and display
  });

  test('articles render with proper localization', () => {
    // Test article rendering
  });

  test('content caching works', () => {
    // Test caching functionality
  });
});
```

**Validation Criteria:**

- [ ] Content integration tests passing
- [ ] Localization working correctly
- [ ] Performance acceptable
- [ ] Error handling robust

**Definition of Done:**

- [ ] Content integration testing complete
- [ ] All tests passing
- [ ] Performance validated
- [ ] Error handling verified

### **3.5 Frontend Performance Optimization**

**⏱️ Time:** 120 minutes | **Assignee:** Frontend Developer

**Dependencies:** Complete all frontend development

**Implementation Steps:**

1. Implement performance optimizations:

```typescript
// src/lib/performance.ts
// Image optimization
export const getOptimizedImageProps = (src: string, alt: string) => ({
  src,
  alt,
  width: 800,
  height: 600,
  quality: 85,
  placeholder: 'blur',
  blurDataURL: generateBlurDataURL(src)
});

// Bundle optimization
export const dynamicImports = {
  EventModal: dynamic(() => import('../components/EventModal')),
  ArticleEditor: dynamic(() => import('../components/ArticleEditor'))
};
```

**Validation Criteria:**

- [ ] Performance optimizations implemented
- [ ] Bundle size reduced
- [ ] Loading times improved
- [ ] Core Web Vitals met

**Definition of Done:**

- [ ] Performance optimization complete
- [ ] Core Web Vitals achieved
- [ ] Bundle size optimized
- [ ] Loading performance improved

### **3.6 End-to-End Testing Suite**

**⏱️ Time:** 90 minutes | **Assignee:** QA Developer

**Dependencies:** Complete all frontend development

**Implementation Steps:**

1. Create comprehensive E2E tests:

```typescript
// __tests__/e2e/frontend.test.ts
describe('Frontend E2E Tests', () => {
  test('user can navigate between languages', () => {
    // Test language switching
  });

  test('content loads correctly in all locales', () => {
    // Test content loading
  });

  test('RTL layout works correctly', () => {
    // Test RTL functionality
  });

  test('responsive design works on mobile', () => {
    // Test mobile responsiveness
  });
});
```

**Validation Criteria:**

- [ ] E2E tests comprehensive
- [ ] All user workflows tested
- [ ] Cross-browser compatibility verified
- [ ] Performance benchmarks met

**Definition of Done:**

- [ ] E2E testing complete
- [ ] All tests passing
- [ ] User workflows validated
- [ ] Performance optimized

---

## 🔄 **Cross-References**

**Related Files:**

- Main Overview: `Phase-2-Implementation-Guide.md`
- Collections Details: `Phase-2-Collections-Details.md`
- Security Details: `Phase-2-Security-Details.md`

**Integration Points:**

- Content components integrate with Payload CMS collections
- Internationalization works with security authentication
- RTL support affects all UI components consistently

---

*Document Version: 1.0 | Last Updated: 2025-08-25 | Cross-reference: Phase-2-Implementation-Guide.md*
