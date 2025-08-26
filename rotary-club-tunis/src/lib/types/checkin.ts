import type { QRCodeData } from '../utils/qrCode';
import type { Event } from '../../payload-types';

export interface CheckInRequest {
  qrData?: string;
  userId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface CheckInResponse {
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

export interface CheckInRecord {
  event: string;
  user: string | null;
  checkInTime: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  qrVerified: boolean;
  registration: string | null;
  status: string;
}

export interface RegistrationInfo {
  id: string;
  user: string;
  status: string;
  registrationDate: string;
  guests: number;
}

export interface EventCheckInStatus {
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

export interface UserDetails {
  id: string;
  name: string;
}

export interface CheckInValidationResult {
  isValid: boolean;
  userId?: string;
  qrVerified: boolean;
  registration?: RegistrationInfo;
  error?: string;
}

export interface EventValidationResult {
  isValid: boolean;
  event?: Event;
  error?: string;
}