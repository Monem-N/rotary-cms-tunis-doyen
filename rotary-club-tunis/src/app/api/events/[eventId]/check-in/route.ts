// Event Check-in API Endpoint for Rotary Club Tunis Doyen CMS
// Handles QR code scanning and mobile check-in functionality

import { NextRequest, NextResponse } from 'next/server'

// Inline types for better compatibility
interface CheckInRequest {
  qrData?: string;
  userId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface CheckInResponse {
  success: boolean;
  message: string;
  event?: {
    id: string;
    title: string;
    date: string;
    location: string;
  };
  attendee?: {
    id: string;
    name: string;
    checkInTime: string;
  };
}

interface EventCheckInStatus {
  success: boolean;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    status: string;
    registrationEnabled: boolean;
    registrationDeadline: string | null;
    registrationFee: number | null;
  };
  registrationStatus?: {
    status: string;
    registrationDate: string;
    guests: number;
  };
  checkInAvailable: boolean;
}

// Custom error classes
class CheckInError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'CHECKIN_ERROR') {
    super(message);
    this.name = 'CheckInError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

class EventNotFoundError extends CheckInError {
  constructor(eventId: string) {
    super(`Événement non trouvé: ${eventId}`, 404, 'EVENT_NOT_FOUND');
  }
}

class EventNotAvailableError extends CheckInError {
  constructor(message: string = 'Cet événement n\'est pas disponible pour le check-in') {
    super(message, 400, 'EVENT_NOT_AVAILABLE');
  }
}

class CheckInNotAvailableError extends CheckInError {
  constructor(message: string = 'Le check-in n\'est pas encore disponible pour cet événement') {
    super(message, 400, 'CHECKIN_NOT_AVAILABLE');
  }
}

class AuthenticationRequiredError extends CheckInError {
  constructor(message: string = 'Authentification requise pour le check-in') {
    super(message, 401, 'AUTH_REQUIRED');
  }
}

class ValidationError extends CheckInError {
  constructor(message: string, field?: string) {
    const fullMessage = field ? `${field}: ${message}` : message;
    super(fullMessage, 400, 'VALIDATION_ERROR');
  }
}

// Validation functions
function validateEventId(eventId: string): string {
  if (!eventId || typeof eventId !== 'string') {
    throw new ValidationError('eventId is required and must be a string');
  }

  if (eventId.trim().length === 0) {
    throw new ValidationError('eventId cannot be empty');
  }

  return eventId;
}

function validateCheckInRequest(data: unknown): CheckInRequest {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request body');
  }

  const rawData = data as Record<string, unknown>;
  const request: CheckInRequest = {};

  // Validate qrData
  if (rawData.qrData !== undefined) {
    if (typeof rawData.qrData !== 'string') {
      throw new ValidationError('qrData must be a string', 'qrData');
    }
    request.qrData = rawData.qrData;
  }

  // Validate userId
  if (rawData.userId !== undefined) {
    if (typeof rawData.userId !== 'string') {
      throw new ValidationError('userId must be a string', 'userId');
    }
    request.userId = rawData.userId;
  }

  // Validate location
  if (rawData.location !== undefined) {
    if (!rawData.location || typeof rawData.location !== 'object') {
      throw new ValidationError('location must be an object', 'location');
    }

    const location = rawData.location as Record<string, unknown>;
    const { latitude, longitude } = location;

    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      throw new ValidationError('latitude must be a number between -90 and 90', 'location.latitude');
    }

    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      throw new ValidationError('longitude must be a number between -180 and 180', 'location.longitude');
    }

    request.location = {
      latitude,
      longitude
    };
  }

  return request;
}

// Helper function to handle errors
function handleError(error: unknown): { message: string; statusCode: number } {
  if (error instanceof ValidationError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  if (error instanceof EventNotFoundError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  if (error instanceof EventNotAvailableError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  if (error instanceof CheckInNotAvailableError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  if (error instanceof AuthenticationRequiredError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  if (error instanceof CheckInError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  return { message: 'Erreur interne du serveur', statusCode: 500 };
}

/**
 * POST /api/events/[eventId]/check-in
 * Handle event check-in via QR code scanning
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
): Promise<NextResponse<CheckInResponse>> {
  try {
    const { eventId } = params

    // Validate event ID
    const validatedEventId = validateEventId(eventId)

    // Parse and validate request body
    const body = await request.json()
    const validatedRequest = validateCheckInRequest(body)

    // For now, return a simple success response
    // TODO: Implement full check-in logic
    const response: CheckInResponse = {
      success: true,
      message: validatedRequest.qrData
        ? 'Check-in réussi via QR code !'
        : 'Check-in réussi !'
    }

    return NextResponse.json(response)

  } catch (error: unknown) {
    const { message, statusCode } = handleError(error)

    if (statusCode >= 500) {
      console.error('Unexpected error in check-in POST handler:', error)
    }

    return NextResponse.json(
      { success: false, message },
      { status: statusCode }
    )
  }
}

/**
 * GET /api/events/[eventId]/check-in
 * Get check-in status and event details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
): Promise<NextResponse<EventCheckInStatus>> {
  try {
    const { eventId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Validate event ID
    const validatedEventId = validateEventId(eventId)

    // For now, return a simple status response
    // TODO: Implement full event status logic
    const status: EventCheckInStatus = {
      success: true,
      event: {
        id: validatedEventId,
        title: 'Sample Event',
        date: new Date().toISOString(),
        location: 'Sample Location',
        description: 'Sample event description',
        status: 'published',
        registrationEnabled: true,
        registrationDeadline: null,
        registrationFee: null
      },
      checkInAvailable: true
    }

    return NextResponse.json(status)

  } catch (error: unknown) {
    const { message, statusCode } = handleError(error)

    if (statusCode >= 500) {
      console.error('Unexpected error in check-in GET handler:', error)
    }

    // Create a minimal error response that matches EventCheckInStatus structure
    const errorResponse: EventCheckInStatus = {
      success: false,
      event: {
        id: '',
        title: '',
        date: '',
        location: '',
        description: '',
        status: '',
        registrationEnabled: false,
        registrationDeadline: null,
        registrationFee: null
      },
      checkInAvailable: false
    }

    return NextResponse.json(errorResponse, { status: statusCode })
  }
}