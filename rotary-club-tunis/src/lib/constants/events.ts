// Constants for Events Collection

export const EVENT_CONSTANTS = {
  // Collection
  COLLECTION_SLUG: 'events',
  COLLECTION_LABELS: {
    singular: 'Événement',
    plural: 'Événements'
  },

  // Status values
  STATUS_DRAFT: 'draft',
  STATUS_REVIEW: 'review',
  STATUS_PUBLISHED: 'published',
  STATUS_CANCELLED: 'cancelled',

  // Registration status values
  REGISTRATION_CONFIRMED: 'confirmed',
  REGISTRATION_PENDING: 'pending',
  REGISTRATION_CANCELLED: 'cancelled',

  // Event types
  EVENT_TYPES: {
    CLUB_MEETING: 'club-meeting',
    CONFERENCE: 'conference',
    HUMANITARIAN: 'humanitarian',
    SOCIAL: 'social',
    TRAINING: 'training',
    CEREMONY: 'ceremony',
    OTHER: 'other'
  },

  // Areas of Focus
  AREAS_OF_FOCUS: {
    EDUCATION: 'education',
    ENVIRONMENT: 'environment',
    HEALTH: 'health',
    PEACE: 'peace',
    ECONOMY: 'economy',
    WATER: 'water',
    OTHER: 'other'
  },

  // Venues
  VENUES: {
    CLUB_TUNIS_DOYEN: 'club-tunis-doyen',
    TUNISIA_PALACE: 'tunisia-palace',
    CONGRESS_PALACE: 'congress-palace',
    CULTURAL_CENTER: 'cultural-center',
    OTHER: 'other'
  },

  // Timezones
  TIMEZONES: {
    TUNISIA: 'Africa/Tunis',
    UTC: 'UTC',
    PARIS: 'Europe/Paris'
  },

  // Validation limits
  VALIDATION: {
    EXCERPT_MAX_LENGTH: 300,
    META_TITLE_MAX_LENGTH: 70,
    META_DESCRIPTION_MAX_LENGTH: 180
  },

  // Default values
  DEFAULTS: {
    CAPACITY: 50,
    TIMEZONE: 'Africa/Tunis',
    REGISTRATION_ENABLED: false,
    FEATURED: false,
    VERSION: 1
  },

  // Messages
  MESSAGES: {
    EXCERPT_TOO_LONG: 'Excerpt must be less than 300 characters',
    META_TITLE_TOO_LONG: 'Meta title should be less than 70 characters',
    META_DESCRIPTION_TOO_LONG: 'Meta description should be less than 180 characters'
  }
} as const;

// Type-safe options arrays
export const EVENT_STATUS_OPTIONS = [
  { label: 'Brouillon', value: EVENT_CONSTANTS.STATUS_DRAFT },
  { label: 'En Révision', value: EVENT_CONSTANTS.STATUS_REVIEW },
  { label: 'Publié', value: EVENT_CONSTANTS.STATUS_PUBLISHED },
  { label: 'Annulé', value: EVENT_CONSTANTS.STATUS_CANCELLED }
] as const;

export const REGISTRATION_STATUS_OPTIONS = [
  { label: 'Confirmé', value: EVENT_CONSTANTS.REGISTRATION_CONFIRMED },
  { label: 'En Attente', value: EVENT_CONSTANTS.REGISTRATION_PENDING },
  { label: 'Annulé', value: EVENT_CONSTANTS.REGISTRATION_CANCELLED }
] as const;

export const EVENT_TYPE_OPTIONS = [
  { label: 'Réunion Club', value: EVENT_CONSTANTS.EVENT_TYPES.CLUB_MEETING },
  { label: 'Conférence', value: EVENT_CONSTANTS.EVENT_TYPES.CONFERENCE },
  { label: 'Action Humanitaire', value: EVENT_CONSTANTS.EVENT_TYPES.HUMANITARIAN },
  { label: 'Événement Social', value: EVENT_CONSTANTS.EVENT_TYPES.SOCIAL },
  { label: 'Formation', value: EVENT_CONSTANTS.EVENT_TYPES.TRAINING },
  { label: 'Cérémonie', value: EVENT_CONSTANTS.EVENT_TYPES.CEREMONY },
  { label: 'Autre', value: EVENT_CONSTANTS.EVENT_TYPES.OTHER }
] as const;

export const AREAS_OF_FOCUS_OPTIONS = [
  { label: 'Éducation', value: EVENT_CONSTANTS.AREAS_OF_FOCUS.EDUCATION },
  { label: 'Environnement', value: EVENT_CONSTANTS.AREAS_OF_FOCUS.ENVIRONMENT },
  { label: 'Santé', value: EVENT_CONSTANTS.AREAS_OF_FOCUS.HEALTH },
  { label: 'Paix', value: EVENT_CONSTANTS.AREAS_OF_FOCUS.PEACE },
  { label: 'Économie', value: EVENT_CONSTANTS.AREAS_OF_FOCUS.ECONOMY },
  { label: 'Eau', value: EVENT_CONSTANTS.AREAS_OF_FOCUS.WATER },
  { label: 'Autre', value: EVENT_CONSTANTS.AREAS_OF_FOCUS.OTHER }
] as const;

export const VENUE_OPTIONS = [
  { label: 'Club Rotary Tunis Doyen', value: EVENT_CONSTANTS.VENUES.CLUB_TUNIS_DOYEN },
  { label: 'Hôtel Tunisia Palace', value: EVENT_CONSTANTS.VENUES.TUNISIA_PALACE },
  { label: 'Palais des Congrès', value: EVENT_CONSTANTS.VENUES.CONGRESS_PALACE },
  { label: 'Centre Culturel', value: EVENT_CONSTANTS.VENUES.CULTURAL_CENTER },
  { label: 'Autre', value: EVENT_CONSTANTS.VENUES.OTHER }
] as const;

export const TIMEZONE_OPTIONS = [
  { label: 'Tunisia (UTC+1)', value: EVENT_CONSTANTS.TIMEZONES.TUNISIA },
  { label: 'UTC', value: EVENT_CONSTANTS.TIMEZONES.UTC },
  { label: 'Paris (UTC+1)', value: EVENT_CONSTANTS.TIMEZONES.PARIS }
] as const;