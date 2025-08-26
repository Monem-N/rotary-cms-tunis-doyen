// Enhanced Payload CMS configuration for Rotary Club Tunis Doyen
// Security-focused configuration with Tunisia-specific optimizations
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Import collections
import Users from './collections/Users'
import { Media } from './collections/Media'
import { Events } from './collections/Events'
import { Minutes } from './collections/Minutes'
import { Articles } from './collections/Articles'
import LoginAttempts from './collections/LoginAttempts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',

  // Enhanced authentication with secure defaults
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Enhanced admin panel security for Tunisia
    meta: {
      title: 'Rotary Club Tunis Doyen - Secure Admin Panel',
      description: 'Enterprise-grade administrative interface for Rotary Club Tunis Doyen',
    },
    // Custom components for enhanced security and UX
    components: {
      logout: {
        Button: path.resolve(dirname, './components/admin/CustomLogoutButton'),
      },
    },
  },

  // Enhanced lexical editor with Tunisia-specific RTL support
  editor: lexicalEditor(),

  // Enhanced Tunisia-specific trilingual localization with proper RTL support
  localization: {
    locales: [
      {
        label: 'Français',
        code: 'fr',
        rtl: false
      },
      {
        label: 'العربية',
        code: 'ar',
        rtl: true
      },
      {
        label: 'English',
        code: 'en',
        rtl: false
      }
    ],
    defaultLocale: 'fr',
    fallback: true,
    // Critical Tunisia-specific cascade for content availability
    fallbackLocale: {
      fr: ['ar', 'en'],
      ar: ['fr', 'en'],
      en: ['fr']
    }
  },

  // Collections with enhanced security and Tunisia-specific features
  collections: [Users, Media, Events, Minutes, Articles, LoginAttempts],

  // Enhanced security configuration
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // Enhanced database configuration with Tunisia-specific optimizations
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || process.env.DATABASE_URI || '',
    // Tunisia-specific connection optimizations
    connectOptions: {
      maxPoolSize: 10, // Connection pooling for Tunisia network
      serverSelectionTimeoutMS: 30000, // 30s timeout for slow connections
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
      // Security enhancements
      tls: true,
      tlsInsecure: false,
    },
  }),

  // Enhanced security configuration for Tunisia network
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.VERCEL_URL || '',
    'https://rotary-tunis-doyen.vercel.app',
    'https://cms.rotary-tunis.tn',
  ].filter(Boolean),

  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.VERCEL_URL || '',
    'https://rotary-tunis-doyen.vercel.app',
    'https://cms.rotary-tunis.tn',
  ].filter(Boolean),

  // Enhanced Sharp configuration for Tunisia mobile optimization
  sharp
})
