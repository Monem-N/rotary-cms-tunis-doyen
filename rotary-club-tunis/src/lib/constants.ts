/**
 * Shared constants for Rotary Club Tunis Doyen
 * Ensures consistency across all components
 */

// Club Statistics - Centralized for consistency across HeroSection, AboutSection, etc.
export const CLUB_STATISTICS = [
  { number: "95+", key: "years" },
  { number: "500+", key: "projects" },
  { number: "1000+", key: "volunteers" }
] as const

// Club Information
export const CLUB_INFO = {
  name: "Rotary Club Tunis Doyen",
  founded: 1929,
  location: "Tunis, Tunisia",
  languages: ["fr", "ar", "en"] as const,
  defaultLanguage: "fr" as const
} as const

// Navigation Structure
export const NAVIGATION_ITEMS = [
  { key: "home", href: "/", external: false },
  { key: "about", href: "/about", external: false },
  { key: "events", href: "/events", external: false },
  { key: "articles", href: "/articles", external: false },
  { key: "contact", href: "/contact", external: false }
] as const

// Social Media Links
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/rotarytunisdoyen",
  twitter: "https://twitter.com/rotarytunisdoyen",
  linkedin: "https://linkedin.com/company/rotary-tunis-doyen",
  instagram: "https://instagram.com/rotarytunisdoyen"
} as const

// Contact Information
export const CONTACT_INFO = {
  address: "Tunis, Tunisia",
  email: "contact@rotarytunisdoyen.org",
  phone: "+216 XX XXX XXX"
} as const

// Performance Settings
export const PERFORMANCE_CONFIG = {
  imageLoadingTimeout: 30000, // 30 seconds for Tunisia network
  retryAttempts: 3,
  debounceDelay: 300
} as const

// Security Settings
export const SECURITY_CONFIG = {
  sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8
} as const
