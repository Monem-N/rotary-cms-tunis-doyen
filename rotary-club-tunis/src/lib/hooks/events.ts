// Hooks for Events Collection

import type { FieldHookArgs } from 'payload';
import type { EventData } from '../types/events';

/**
 * Hook to set audit fields on creation and update
 */
export const setAuditFields = async (args: FieldHookArgs<EventData>) => {
  const { data, req, operation } = args;

  if (operation === 'create' && req.user) {
    return {
      ...data,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id,
      version: 1
    };
  }

  if (operation === 'update' && req.user) {
    return {
      ...data,
      lastModifiedBy: req.user.id,
      version: ((data as EventData)?.audit?.version || 1) + 1
    };
  }

  return data;
};

/**
 * Hook to generate slug from title
 */
export const generateSlug = async (args: FieldHookArgs<EventData>) => {
  const { data, value } = args;

  if (typeof value === 'undefined' && data?.title) {
    const title = typeof data.title === 'object' ? data.title.fr || data.title.en || data.title.ar : data.title;
    return (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  return value;
};