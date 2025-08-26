// Access control functions for Events Collection

import type { AccessArgs } from 'payload';
import type { User } from '../types/events';

/**
 * Check if user can create events
 */
export const canCreateEvent = ({ req }: AccessArgs): boolean => {
  const user = req.user as User | null | undefined;
  return Boolean(user?.role === 'admin' || user?.role === 'editor');
};

/**
 * Check if user can update events
 */
export const canUpdateEvent = ({ req }: AccessArgs): boolean => {
  const user = req.user as User | null | undefined;
  return Boolean(user?.role === 'admin' || user?.role === 'editor');
};

/**
 * Check if user can delete events
 */
export const canDeleteEvent = ({ req }: AccessArgs): boolean => {
  const user = req.user as User | null | undefined;
  return Boolean(user?.role === 'admin');
};

/**
 * Public read access for published events
 * Users can read published events, admins/editors can read all events
 */
export const canReadEvent = ({ req }: AccessArgs): boolean | object => {
  const user = req.user as User | null | undefined;

  // If user is admin or editor, they can read all events
  if (user?.role === 'admin' || user?.role === 'editor') {
    return true;
  }

  // Public users can only read published events
  return {
    status: {
      equals: 'published'
    }
  };
};