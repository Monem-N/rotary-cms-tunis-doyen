// Business logic service for event check-in functionality

import { getPayload } from 'payload';
import payload from 'payload';
import type { Event as BaseEvent } from '../../payload-types';
import type {
  CheckInRequest,
  CheckInResponse,
  CheckInRecord,
  CheckInValidationResult,
  EventValidationResult,
  EventCheckInStatus,
  UserDetails,
  RegistrationInfo
} from '../types/checkin';
import { CHECKIN_CONSTANTS, DEFAULT_LOCALE } from '../constants/checkin';
import {
  EventNotFoundError,
  EventNotAvailableError,
  CheckInNotAvailableError,
  InvalidQRError,
  InvalidQRSignatureError,
  QRWrongEventError,
  AuthenticationRequiredError
} from '../errors/checkin';
import { parseQRCodeData, verifyQRCodeSignature } from '../utils/qrCode';

// Extended Event interface with all fields from Events collection
interface Event extends BaseEvent {
  status?: string;
  registrations?: RegistrationInfo[];
  registrationEnabled?: boolean;
  registrationDeadline?: string;
  registrationFee?: number;
  endDate?: string;
  capacity?: number;
  featured?: boolean;
  organizer?: string;
  venue?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  timezone?: string;
  excerpt?: string;
  eventType?: string;
  featuredImage?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  audit?: {
    createdBy?: string;
    lastModifiedBy?: string;
    version?: number;
  };
}

// Extended User interface
interface ExtendedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Get Payload instance
 */
async function getPayloadInstance() {
  return await getPayload({ config: payload.config });
}

/**
 * Find event by ID with proper typing
 */
export async function findEvent(eventId: string): Promise<Event> {
  const payloadInstance = await getPayloadInstance();

  const event = await payloadInstance.findByID({
    collection: CHECKIN_CONSTANTS.EVENTS_COLLECTION,
    id: eventId
  });

  if (!event) {
    throw new EventNotFoundError(eventId);
  }

  return event as Event;
}

/**
 * Validate event availability for check-in
 */
export function validateEventForCheckIn(event: Event): EventValidationResult {
  // Check if event is published
  if (event.status !== CHECKIN_CONSTANTS.STATUS_PUBLISHED) {
    return {
      isValid: false,
      error: CHECKIN_CONSTANTS.MESSAGES.EVENT_NOT_AVAILABLE
    };
  }

  // Check if event has already started (allow check-in 30 minutes early)
  const eventDate = new Date(event.eventDate);
  const now = new Date();
  const thirtyMinutesBefore = new Date(eventDate.getTime() - CHECKIN_CONSTANTS.EARLY_CHECKIN_MINUTES * 60 * 1000);

  if (now < thirtyMinutesBefore) {
    return {
      isValid: false,
      error: CHECKIN_CONSTANTS.MESSAGES.CHECKIN_NOT_AVAILABLE
    };
  }

  return {
    isValid: true,
    event
  };
}

/**
 * Validate QR code data
 */
export function validateQRCode(qrData: string, eventId: string): CheckInValidationResult {
  const qrCodeData = parseQRCodeData(qrData);

  if (!qrCodeData) {
    return {
      isValid: false,
      qrVerified: false,
      error: CHECKIN_CONSTANTS.MESSAGES.INVALID_QR
    };
  }

  // Verify QR code signature
  if (!verifyQRCodeSignature(qrCodeData)) {
    return {
      isValid: false,
      qrVerified: false,
      error: CHECKIN_CONSTANTS.MESSAGES.INVALID_QR_SIGNATURE
    };
  }

  // Check if QR code matches the event
  if (qrCodeData.eventId !== eventId) {
    return {
      isValid: false,
      qrVerified: false,
      error: CHECKIN_CONSTANTS.MESSAGES.QR_WRONG_EVENT
    };
  }

  return {
    isValid: true,
    qrVerified: true
  };
}

/**
 * Validate check-in request
 */
export function validateCheckInRequest(request: CheckInRequest, eventId: string): CheckInValidationResult {
  const { qrData, userId } = request;
  let qrVerified = false;
  let attendeeUserId = userId;

  // If QR data is provided, verify it
  if (qrData) {
    const qrValidation = validateQRCode(qrData, eventId);
    if (!qrValidation.isValid) {
      return qrValidation;
    }
    qrVerified = true;
  }

  // If no user ID provided and QR not verified, require authentication
  if (!attendeeUserId && !qrVerified) {
    return {
      isValid: false,
      qrVerified,
      error: CHECKIN_CONSTANTS.MESSAGES.AUTH_REQUIRED
    };
  }

  // If QR verified but no user ID, this is an anonymous check-in
  if (qrVerified && !attendeeUserId) {
    attendeeUserId = CHECKIN_CONSTANTS.ANONYMOUS_USER_ID;
  }

  return {
    isValid: true,
    userId: attendeeUserId,
    qrVerified
  };
}

/**
 * Find user registration for event
 */
export async function findUserRegistration(event: Event, userId: string): Promise<RegistrationInfo | null> {
  if (userId === CHECKIN_CONSTANTS.ANONYMOUS_USER_ID) {
    return null;
  }

  const registrations = (event.registrations as RegistrationInfo[]) || [];
  return registrations.find((reg: RegistrationInfo) => reg.user === userId) || null;
}

/**
 * Get user details
 */
export async function getUserDetails(userId: string): Promise<UserDetails | null> {
  if (userId === CHECKIN_CONSTANTS.ANONYMOUS_USER_ID) {
    return null;
  }

  try {
    const payloadInstance = await getPayloadInstance();
    const user = await payloadInstance.findByID({
      collection: CHECKIN_CONSTANTS.USERS_COLLECTION,
      id: userId
    });

    if (!user) {
      return null;
    }

    const extendedUser = user as ExtendedUser;
    return {
      id: extendedUser.id,
      name: `${extendedUser.firstName || ''} ${extendedUser.lastName || ''}`.trim() || extendedUser.email
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

/**
 * Create check-in record
 */
export function createCheckInRecord(
  eventId: string,
  userId: string | null,
  qrVerified: boolean,
  location: { latitude: number; longitude: number } | undefined,
  registration: RegistrationInfo | null
): CheckInRecord {
  return {
    event: eventId,
    user: userId !== CHECKIN_CONSTANTS.ANONYMOUS_USER_ID ? userId : null,
    checkInTime: new Date().toISOString(),
    location: location ? {
      latitude: location.latitude,
      longitude: location.longitude
    } : undefined,
    qrVerified,
    registration: registration?.id || null,
    status: CHECKIN_CONSTANTS.STATUS_CHECKED_IN
  };
}

/**
 * Process check-in and return response
 */
export async function processCheckIn(eventId: string, request: CheckInRequest): Promise<CheckInResponse> {
  // Find and validate event
  const event = await findEvent(eventId);
  const eventValidation = validateEventForCheckIn(event);

  if (!eventValidation.isValid) {
    throw new CheckInNotAvailableError(eventValidation.error);
  }

  // Validate check-in request
  const validation = validateCheckInRequest(request, eventId);
  if (!validation.isValid) {
    throw new AuthenticationRequiredError(validation.error);
  }

  const { userId: attendeeUserId, qrVerified } = validation;

  // Find user registration
  const registration = attendeeUserId ? await findUserRegistration(event, attendeeUserId) : null;

  // Create check-in record
  const checkInData = createCheckInRecord(
    eventId,
    attendeeUserId || null,
    qrVerified,
    request.location,
    registration
  );

  // TODO: Save check-in record to database
  // For now, we'll log it
  console.log('Event check-in:', checkInData);

  // Get user details
  const userDetails = attendeeUserId ? await getUserDetails(attendeeUserId) : null;

  return {
    success: true,
    message: qrVerified
      ? CHECKIN_CONSTANTS.MESSAGES.CHECKIN_SUCCESS_QR
      : CHECKIN_CONSTANTS.MESSAGES.CHECKIN_SUCCESS,
    event: {
      id: event.id,
      title: event.title,
      date: event.eventDate,
      location: event.location
    },
    attendee: userDetails ? {
      id: userDetails.id,
      name: userDetails.name,
      checkInTime: checkInData.checkInTime
    } : undefined
  };
}

/**
 * Get event check-in status
 */
export async function getEventCheckInStatus(eventId: string, userId?: string): Promise<EventCheckInStatus> {
  // Find event
  const event = await findEvent(eventId);

  // Check registration status if user is provided
  let registrationStatus = null;
  if (userId) {
    const registrations = (event.registrations as RegistrationInfo[]) || [];
    const registration = registrations.find((reg: RegistrationInfo) => reg.user === userId);
    if (registration) {
      registrationStatus = {
        status: registration.status,
        registrationDate: registration.registrationDate,
        guests: registration.guests || 0
      };
    }
  }

  return {
    success: true,
    event: {
      id: event.id,
      title: event.title,
      date: event.eventDate,
      location: event.location,
      description: Array.isArray(event.description)
        ? event.description.map(block => {
            if (typeof block === 'object' && block !== null && typeof block === 'object' && 'children' in block) {
              const textBlock = block as { children?: Array<{ text?: string }> };
              return textBlock.children?.map(child => child.text || '').join('') || '';
            }
            return '';
          }).join(' ')
        : '',
      status: event.status || 'draft',
      registrationEnabled: event.registrationEnabled || false,
      registrationDeadline: event.registrationDeadline || null,
      registrationFee: event.registrationFee || null
    },
    registrationStatus: registrationStatus || undefined,
    checkInAvailable: event.status === CHECKIN_CONSTANTS.STATUS_PUBLISHED
  };
}