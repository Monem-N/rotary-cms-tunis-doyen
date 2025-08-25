// Critical Tunisia-specific hook: Auto-sync French events to Arabic drafts
// This implements the core workflow for bilingual Rotary volunteers

import type { CollectionAfterChangeHook } from 'payload';

// Note: Using type assertions due to outdated payload-types.ts
// TODO: Remove type assertions after regenerating payload types

function shouldSkipArabicSync(operation: string, locale: unknown): boolean {
  return (
    operation !== 'create' ||
    locale === 'ar' ||
    locale === 'all' ||
    locale === null ||
    locale === undefined
  );
}

export const syncArabicAfterCreate: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection
}) => {
  // CRITICAL GUARD: Only trigger on new documents, not updates (prevents infinite loops)
  if (shouldSkipArabicSync(operation, req.locale)) return;

  // Support both Events and Articles collections for auto-sync
  type AllowedSlug = 'events' | 'articles';
  if (!(['events', 'articles'] as AllowedSlug[]).includes(collection.slug as AllowedSlug)) return;

  const { payload } = req;

  // RETRY LOGIC: Attempt sync with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // SAFE FIELD SELECTION: Explicitly select fields to avoid data corruption
      const safeData = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...((collection.slug as any) === 'events' && {
          title: `[مسودة] ${doc.title}`,
          eventDate: doc.eventDate,
          location: doc.location,
          description: doc.description,
          areasOfFocus: doc.areasOfFocus,
          impactMetrics: doc.impactMetrics,
          gallery: doc.gallery,
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...((collection.slug as any) === 'articles' && {
          title: `[مسودة] ${doc.title}`,
          subtitle: doc.subtitle,
          category: doc.category,
          excerpt: doc.excerpt,
          content: doc.content,
          featuredImage: doc.featuredImage,
          gallery: doc.gallery,
          author: doc.author,
          publishedDate: doc.publishedDate,
          tags: doc.tags,
          featured: doc.featured,
          allowComments: doc.allowComments,
          seo: doc.seo,
        }),
        _status: 'draft', // Use _status for consistency with Payload CMS
        original_language: req.locale,
        arabic_draft_created: true
      };

      // Create Arabic draft version
      const arabicDraft = await payload.create({
        collection: collection.slug,
        data: safeData,
        locale: 'ar'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // Log success for monitoring
      payload.logger.info(`✅ Created Arabic draft for ${collection.slug}: ${doc.title} (ID: ${arabicDraft.id}, attempt ${attempt})`);
      return; // Success, exit the retry loop

    } catch (error) {
      lastError = error as Error;
      payload.logger.warn(`⚠️ Arabic draft creation attempt ${attempt} failed for ${collection.slug}: ${doc.title}`, error);

      // Don't retry on the last attempt
      if (attempt < maxRetries) {
        // Exponential backoff: wait 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Log final failure after all retries exhausted
  payload.logger.error(`❌ Arabic draft creation failed after ${maxRetries} attempts for ${collection.slug}: ${doc.title}`, lastError);
};
