import type { CollectionConfig } from 'payload'

// Temporary interface to extend User type until payload-types.ts is regenerated
interface ExtendedUser {
  role?: 'admin' | 'editor' | 'volunteer';
  id?: string;
  [key: string]: unknown;
}

const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'languagePreference'],
    group: 'Admin',
  },
  auth: {
    // Login attempt limits for security (max 5 attempts, 1 hour lockout)
    maxLoginAttempts: 5,
    lockTime: 60 * 60 * 1000, // 1 hour in milliseconds
    // JWT token expiration - 7 days for Tunisia network
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days in seconds
    // Secure cookie configuration
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      domain: (() => {
        const vercelUrl = process.env.VERCEL_URL;
        if (vercelUrl) {
          // Only allow valid domain names (no protocol, no path, no port)
          const sanitized = vercelUrl.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
          // Basic domain validation (letters, numbers, hyphens, dots)
          if (/^[a-zA-Z0-9.-]+$/.test(sanitized)) {
            return `.${sanitized}`;
          }
        }
        return undefined;
      })(),
    },
  },
  fields: [
    // Email added by default
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Volunteer', value: 'volunteer' }
      ],
      defaultValue: 'volunteer',
      required: true,
      admin: {
        description: 'Rôle utilisateur pour le contrôle d\'accès'
      }
    },
    {
      name: 'languagePreference',
      type: 'select',
      options: [
        { label: 'Français', value: 'fr' },
        { label: 'العربية', value: 'ar' },
        { label: 'English', value: 'en' }
      ],
      defaultValue: 'fr',
      admin: {
        description: 'Langue préférée pour l\'interface'
      }
    },
    {
      name: 'firstName',
      type: 'text',
      admin: {
        description: 'Prénom du bénévole'
      }
    },
    {
      name: 'lastName',
      type: 'text',
      admin: {
        description: 'Nom de famille du bénévole'
      }
    }
  ],
  access: {
    read: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      if (extendedUser?.role === 'admin') return true;
      if (extendedUser?.role === 'editor') return true; // Simplified for type safety
      return { id: { equals: extendedUser?.id } };
    },
    create: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin';
    },
    update: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      if (extendedUser?.role === 'admin') return true;
      return { id: { equals: extendedUser?.id } };
    },
    delete: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin';
    },
  },
};

export default Users;
