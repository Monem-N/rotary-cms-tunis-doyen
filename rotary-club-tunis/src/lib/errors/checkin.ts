// Custom error classes for event check-in functionality

export class CheckInError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'CHECKIN_ERROR') {
    super(message);
    this.name = 'CheckInError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class EventNotFoundError extends CheckInError {
  constructor(eventId: string) {
    super(`Événement non trouvé: ${eventId}`, 404, 'EVENT_NOT_FOUND');
  }
}

export class EventNotAvailableError extends CheckInError {
  constructor(message: string = 'Cet événement n\'est pas disponible pour le check-in') {
    super(message, 400, 'EVENT_NOT_AVAILABLE');
  }
}

export class CheckInNotAvailableError extends CheckInError {
  constructor(message: string = 'Le check-in n\'est pas encore disponible pour cet événement') {
    super(message, 400, 'CHECKIN_NOT_AVAILABLE');
  }
}

export class InvalidQRError extends CheckInError {
  constructor(message: string = 'Données QR invalides') {
    super(message, 400, 'INVALID_QR');
  }
}

export class InvalidQRSignatureError extends CheckInError {
  constructor(message: string = 'Code QR invalide ou expiré') {
    super(message, 400, 'INVALID_QR_SIGNATURE');
  }
}

export class QRWrongEventError extends CheckInError {
  constructor(message: string = 'Ce code QR n\'appartient pas à cet événement') {
    super(message, 400, 'QR_WRONG_EVENT');
  }
}

export class AuthenticationRequiredError extends CheckInError {
  constructor(message: string = 'Authentification requise pour le check-in') {
    super(message, 401, 'AUTH_REQUIRED');
  }
}

export class ValidationError extends CheckInError {
  constructor(message: string, field?: string) {
    const fullMessage = field ? `${field}: ${message}` : message;
    super(fullMessage, 400, 'VALIDATION_ERROR');
  }
}