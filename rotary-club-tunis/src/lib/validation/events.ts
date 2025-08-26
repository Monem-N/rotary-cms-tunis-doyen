// Validation functions for Events Collection

import type { ValidationFunction, EventData } from '../types/events';
import { EVENT_CONSTANTS } from '../constants/events';

/**
 * Validates excerpt length
 */
export const validateExcerpt: ValidationFunction = (value: unknown): true | string => {
  if (value && typeof value === 'string' && value.length > EVENT_CONSTANTS.VALIDATION.EXCERPT_MAX_LENGTH) {
    return EVENT_CONSTANTS.MESSAGES.EXCERPT_TOO_LONG;
  }
  return true;
};

/**
 * Validates SEO meta title length
 */
export const validateMetaTitle: ValidationFunction = (value: unknown): true | string => {
  if (value && typeof value === 'string' && value.length > EVENT_CONSTANTS.VALIDATION.META_TITLE_MAX_LENGTH) {
    return EVENT_CONSTANTS.MESSAGES.META_TITLE_TOO_LONG;
  }
  return true;
};

/**
 * Validates SEO meta description length
 */
export const validateMetaDescription: ValidationFunction = (value: unknown): true | string => {
  if (value && typeof value === 'string' && value.length > EVENT_CONSTANTS.VALIDATION.META_DESCRIPTION_MAX_LENGTH) {
    return EVENT_CONSTANTS.MESSAGES.META_DESCRIPTION_TOO_LONG;
  }
  return true;
};

/**
 * Generates slug from title
 */
export const generateSlug = (data?: EventData, value?: string): string => {
  if (typeof value === 'undefined' && data?.title) {
    const title = typeof data.title === 'object' ? data.title.fr || data.title.en || data.title.ar : data.title;
    return (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  return value || '';
};

/**
 * Gets current date for registration
 */
export const getCurrentDate = (): string => new Date().toISOString();