// Validation schemas for event check-in functionality

import type { CheckInRequest } from '../types/checkin';
import { ValidationError } from '../errors/checkin';

interface RawCheckInRequest {
  qrData?: unknown;
  userId?: unknown;
  location?: unknown;
}

interface RawLocation {
  latitude?: unknown;
  longitude?: unknown;
}

export function validateCheckInRequest(data: unknown): CheckInRequest {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request body');
  }

  const rawData = data as RawCheckInRequest;
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

    const location = rawData.location as RawLocation;
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

export function validateEventId(eventId: string): string {
  if (!eventId || typeof eventId !== 'string') {
    throw new ValidationError('eventId is required and must be a string');
  }

  if (eventId.trim().length === 0) {
    throw new ValidationError('eventId cannot be empty');
  }

  return eventId;
}

export function validateUserId(userId: string | undefined): string | undefined {
  if (userId !== undefined) {
    if (typeof userId !== 'string') {
      throw new ValidationError('userId must be a string', 'userId');
    }

    if (userId.trim().length === 0) {
      throw new ValidationError('userId cannot be empty', 'userId');
    }
  }

  return userId;
}