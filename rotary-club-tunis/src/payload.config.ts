// Tunisia-specific Payload CMS configuration for Rotary Club Tunis Doyen
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Enhanced admin panel security
    meta: {
      title: 'Rotary Club Tunis Doyen - Admin Panel',
      description: 'Secure administrative interface for Rotary Club Tunis Doyen',
      // keywords field removed for security reasons
    },
    // Custom components for enhanced security
    components: {
      logout: {
        Button: path.resolve(dirname, './components/admin/CustomLogoutButton'),
      },
    },
    // Live preview configuration for secure content editing
    livePreview: {
      url: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
      collections: ['articles', 'events', 'minutes'],
    },
  },
  editor: lexicalEditor({
    // RTL support will be added via custom CSS in the admin panel
    // Tunisia-specific configuration for Arabic content
  }),
  // Tunisia-specific trilingual localization with RTL support
  localization: {
    locales: [
      {
        label: 'Français',
        code: 'fr'
      },
      {
        label: 'العربية',
        code: 'ar'
      },
      {
        label: 'English',
        code: 'en'
      }
    ],
    defaultLocale: 'fr',
    fallback: true
  },
  collections: [Users, Media, Events, Minutes, Articles],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  // Security configuration for Tunisia network
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.VERCEL_URL || '',
    'https://rotary-tunis-doyen.vercel.app',
  ].filter(Boolean),
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.VERCEL_URL || '',
    'https://rotary-tunis-doyen.vercel.app',
  ].filter(Boolean),
  sharp,
})
