// Constants for event check-in functionality

export const CHECKIN_CONSTANTS = {
  // Timing
  EARLY_CHECKIN_MINUTES: 30,
  ANONYMOUS_USER_ID: 'anonymous',

  // Status values
  STATUS_CHECKED_IN: 'checked-in',
  STATUS_CONFIRMED: 'confirmed',
  STATUS_PUBLISHED: 'published',

  // Collections
  EVENTS_COLLECTION: 'events',
  USERS_COLLECTION: 'users',

  // Messages
  MESSAGES: {
    EVENT_NOT_FOUND: 'Événement non trouvé',
    EVENT_NOT_AVAILABLE: 'Cet événement n\'est pas disponible pour le check-in',
    CHECKIN_NOT_AVAILABLE: 'Le check-in n\'est pas encore disponible pour cet événement',
    INVALID_QR: 'Données QR invalides',
    INVALID_QR_SIGNATURE: 'Code QR invalide ou expiré',
    QR_WRONG_EVENT: 'Ce code QR n\'appartient pas à cet événement',
    AUTH_REQUIRED: 'Authentification requise pour le check-in',
    CHECKIN_SUCCESS: 'Check-in réussi !',
    CHECKIN_SUCCESS_QR: 'Check-in réussi via QR code !',
    ERROR_GENERIC: 'Erreur lors du check-in',
    ERROR_FETCH_STATUS: 'Erreur lors de la récupération des informations'
  }
} as const;

export const DEFAULT_LOCALE = 'fr';