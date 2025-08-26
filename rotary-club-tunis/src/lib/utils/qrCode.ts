// QR Code Generation Utility for Rotary Club Tunis Doyen CMS
// Mobile check-in functionality for events

import { createHash } from 'crypto'

export interface QRCodeData {
  eventId: string
  eventTitle: string
  checkInUrl: string
  timestamp: string
  signature: string
}

export interface EventCheckInData {
  eventId: string
  userId?: string
  timestamp: Date
  location?: {
    latitude: number
    longitude: number
  }
}

/**
 * Generate QR code data for event check-in
 * Creates a secure, signed QR code that can be scanned for mobile check-in
 */
export function generateEventQRCode(
  eventId: string,
  eventTitle: string,
): QRCodeData {
  const timestamp = new Date().toISOString()
  const checkInUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/events/${eventId}/check-in`

  // Create a signature for security (prevents QR code tampering)
  const dataToSign = `${eventId}:${eventTitle}:${checkInUrl}:${timestamp}`
  const signature = createHash('sha256')
    .update(dataToSign + process.env.PAYLOAD_SECRET)
    .digest('hex')
    .substring(0, 16) // Short signature for QR code readability

  return {
    eventId,
    eventTitle,
    checkInUrl,
    timestamp,
    signature
  }
}

/**
 * Generate QR code as JSON string for encoding
 * This JSON can be converted to a QR code image
 */
export function generateQRCodeJSON(data: QRCodeData): string {
  return JSON.stringify({
    type: 'rotary-event-checkin',
    eventId: data.eventId,
    title: data.eventTitle,
    url: data.checkInUrl,
    timestamp: data.timestamp,
    signature: data.signature
  })
}

/**
 * Generate QR code as URL for simpler scanning
 * Alternative format for basic QR code readers
 */
export function generateQRCodeURL(data: QRCodeData): string {
  const params = new URLSearchParams({
    event: data.eventId,
    title: encodeURIComponent(data.eventTitle),
    sig: data.signature,
    ts: data.timestamp
  })

  return `${data.checkInUrl}?${params.toString()}`
}

/**
 * Verify QR code signature for security
 * Prevents tampering with QR codes
 */
export function verifyQRCodeSignature(data: QRCodeData): boolean {
  const dataToSign = `${data.eventId}:${data.eventTitle}:${data.checkInUrl}:${data.timestamp}`
  const expectedSignature = createHash('sha256')
    .update(dataToSign + process.env.PAYLOAD_SECRET)
    .digest('hex')
    .substring(0, 16)

  return data.signature === expectedSignature
}

/**
 * Parse QR code data from scanned content
 * Handles both JSON and URL formats
 */
export function parseQRCodeData(qrContent: string): QRCodeData | null {
  try {
    // Try JSON format first
    if (qrContent.startsWith('{')) {
      const parsed = JSON.parse(qrContent)
      if (parsed.type === 'rotary-event-checkin') {
        return {
          eventId: parsed.eventId,
          eventTitle: parsed.title,
          checkInUrl: parsed.url,
          timestamp: parsed.timestamp,
          signature: parsed.signature
        }
      }
    }

    // Try URL format
    if (qrContent.startsWith('http')) {
      const url = new URL(qrContent)
      const eventId = url.searchParams.get('event')
      const title = decodeURIComponent(url.searchParams.get('title') || '')
      const signature = url.searchParams.get('sig')
      const timestamp = url.searchParams.get('ts')

      if (eventId && title && signature && timestamp) {
        return {
          eventId,
          eventTitle: title,
          checkInUrl: `${url.origin}${url.pathname}`,
          timestamp,
          signature
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing QR code data:', error)
    return null
  }
}

/**
 * Generate QR code for event registration confirmation
 * Different from check-in QR codes
 */
export function generateRegistrationQRCode(
  eventId: string,
  userId: string,
  registrationId: string,
): string {
  const timestamp = new Date().toISOString()
  const dataToSign = `${eventId}:${userId}:${registrationId}:${timestamp}`
  const signature = createHash('sha256')
    .update(dataToSign + process.env.PAYLOAD_SECRET)
    .digest('hex')
    .substring(0, 16)

  const qrData = JSON.stringify({
    type: 'rotary-registration',
    eventId,
    userId,
    registrationId,
    timestamp,
    signature
  })

  return qrData
}

/**
 * Generate batch QR codes for multiple events
 * Useful for printing multiple event QR codes
 */
export function generateBatchQRCodes(
  events: Array<{ id: string; title: string }>,
  baseUrl?: string
): Array<{ eventId: string; qrData: string; qrUrl: string }> {
  return events.map(event => {
    const qrData = generateEventQRCode(event.id, event.title)
    return {
      eventId: event.id,
      qrData: generateQRCodeJSON(qrData),
      qrUrl: generateQRCodeURL(qrData)
    }
  })
}

/**
 * Generate QR code with Tunisian localization
 * Includes Arabic text support for Tunisian events
 */
export function generateLocalizedQRCode(
  eventId: string,
  eventTitle: string,
  eventTitleAr: string,
): { english: QRCodeData; arabic: QRCodeData } {
  return {
    english: generateEventQRCode(eventId, eventTitle, baseUrl),
    arabic: generateEventQRCode(eventId, eventTitleAr)
  }
}

/**
 * Create QR code for event feedback collection
 * Post-event feedback system
 */
export function generateFeedbackQRCode(
  eventId: string,
  eventTitle: string,
): string {
  const timestamp = new Date().toISOString()
  const feedbackUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/events/${eventId}/feedback`

  const dataToSign = `${eventId}:${eventTitle}:${feedbackUrl}:${timestamp}`
  const signature = createHash('sha256')
    .update(dataToSign + process.env.PAYLOAD_SECRET)
    .digest('hex')
    .substring(0, 16)

  return JSON.stringify({
    type: 'rotary-feedback',
    eventId,
    title: eventTitle,
    url: feedbackUrl,
    timestamp,
    signature
  })
}