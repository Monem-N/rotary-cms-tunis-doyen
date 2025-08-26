// Events Collection for Rotary Club Tunis Doyen CMS
// Complete event management with scheduling, registration, and calendar integration
import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { syncArabicAfterCreate } from '../hooks/syncArabicAfterCreate'

// Temporary interface to extend User type until payload-types.ts is regenerated
interface ExtendedUser {
  role?: 'admin' | 'editor' | 'volunteer'
  id?: string
  [key: string]: unknown
}

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Événement',
    plural: 'Événements'
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventDate', 'status', 'capacity', 'registrations'],
    group: 'Event Management',
    description: 'Manage Rotary Club events with multi-language support and registration tracking'
  },
  access: {
    read: () => true, // Public read access for published events
    create: ({ req: { user } }: any) => {
      const extendedUser = user as unknown as ExtendedUser
      return extendedUser?.role === 'admin' || extendedUser?.role === 'editor'
    },
    update: ({ req: { user } }: any) => {
      const extendedUser = user as unknown as ExtendedUser
      return extendedUser?.role === 'admin' || extendedUser?.role === 'editor'
    },
    delete: ({ req: { user } }: any) => {
      const extendedUser = user as unknown as ExtendedUser
      return extendedUser?.role === 'admin'
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }: any) => {
        // Set createdBy on creation
        if (operation === 'create' && req.user) {
          data.audit = {
            ...data.audit,
            createdBy: req.user.id
          }
        }

        // Set lastModifiedBy on update
        if (operation === 'update' && req.user) {
          data.audit = {
            ...data.audit,
            lastModifiedBy: req.user.id,
            version: (data.audit?.version || 1) + 1
          }
        }

        return data
      }
    ],
    afterChange: [syncArabicAfterCreate]
  },
  fields: [
    // Basic Event Information
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Event title in French, Arabic, and English'
      }
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (auto-generated from title)',
        position: 'sidebar'
      },
      hooks: {
        beforeValidate: [
          ({ data, value }: any) => {
            if (!value && data.title) {
              const title = typeof data.title === 'object' ? data.title.fr || data.title.en || data.title.ar : data.title
              return title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            }
            return value
          }
        ]
      }
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Brief event description (150-200 characters)',
        rows: 3
      },
      validate: (value: any) => {
        if (value && value.length > 300) {
          return 'Excerpt must be less than 300 characters'
        }
        return true
      }
    },

    // Event Scheduling
    {
      name: 'eventDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Event start date and time (Tunisia timezone UTC+1)',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm'
        },
        position: 'sidebar'
      }
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'Event end date and time (optional for multi-day events)',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm'
        },
        position: 'sidebar'
      }
    },
    {
      name: 'timezone',
      type: 'select',
      defaultValue: 'Africa/Tunis',
      options: [
        { label: 'Tunisia (UTC+1)', value: 'Africa/Tunis' },
        { label: 'UTC', value: 'UTC' },
        { label: 'Paris (UTC+1)', value: 'Europe/Paris' }
      ],
      admin: {
        description: 'Event timezone for proper scheduling',
        position: 'sidebar'
      }
    },

    // Location & Venue
    {
      name: 'location',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Event location/venue address'
      }
    },
    {
      name: 'venue',
      type: 'select',
      options: [
        { label: 'Club Rotary Tunis Doyen', value: 'club-tunis-doyen' },
        { label: 'Hôtel Tunisia Palace', value: 'tunisia-palace' },
        { label: 'Palais des Congrès', value: 'congress-palace' },
        { label: 'Centre Culturel', value: 'cultural-center' },
        { label: 'Autre', value: 'other' }
      ],
      admin: {
        description: 'Predefined Tunisian venues',
        position: 'sidebar'
      }
    },
    {
      name: 'coordinates',
      type: 'group',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          admin: {
            description: 'GPS latitude for maps integration'
          }
        },
        {
          name: 'longitude',
          type: 'number',
          admin: {
            description: 'GPS longitude for maps integration'
          }
        }
      ]
    },

    // Event Details
    {
      name: 'description',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor(),
      admin: {
        description: 'Detailed event description with rich text formatting'
      }
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Réunion Club', value: 'club-meeting' },
        { label: 'Conférence', value: 'conference' },
        { label: 'Action Humanitaire', value: 'humanitarian' },
        { label: 'Événement Social', value: 'social' },
        { label: 'Formation', value: 'training' },
        { label: 'Cérémonie', value: 'ceremony' },
        { label: 'Autre', value: 'other' }
      ],
      admin: {
        description: 'Type of Rotary event',
        position: 'sidebar'
      }
    },
    {
      name: 'areasOfFocus',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Éducation', value: 'education' },
        { label: 'Environnement', value: 'environment' },
        { label: 'Santé', value: 'health' },
        { label: 'Paix', value: 'peace' },
        { label: 'Économie', value: 'economy' },
        { label: 'Eau', value: 'water' },
        { label: 'Autre', value: 'other' }
      ],
      admin: {
        description: 'Rotary Areas of Focus alignment'
      }
    },

    // Capacity & Registration
    {
      name: 'capacity',
      type: 'number',
      defaultValue: 50,
      admin: {
        description: 'Maximum number of attendees',
        position: 'sidebar'
      }
    },
    {
      name: 'registrationEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable online registration for this event',
        position: 'sidebar'
      }
    },
    {
      name: 'registrationDeadline',
      type: 'date',
      admin: {
        description: 'Deadline for event registration',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm'
        },
        position: 'sidebar'
      }
    },
    {
      name: 'registrationFee',
      type: 'number',
      admin: {
        description: 'Registration fee in TND (0 for free events)',
        position: 'sidebar'
      }
    },

    // Media & Visuals
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main event image (recommended: 1200x600px)',
        position: 'sidebar'
      }
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true
        },
        {
          name: 'caption',
          type: 'text',
          localized: true,
          admin: {
            description: 'Image caption in multiple languages'
          }
        },
        {
          name: 'altText',
          type: 'text',
          localized: true,
          required: true,
          admin: {
            description: 'Alt text for accessibility (WCAG compliance)'
          }
        }
      ],
      admin: {
        description: 'Event photo gallery'
      }
    },

    // Publication & Workflow
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'En Révision', value: 'review' },
        { label: 'Publié', value: 'published' },
        { label: 'Annulé', value: 'cancelled' }
      ],
      admin: {
        description: 'Event publication status',
        position: 'sidebar'
      }
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark as featured event (appears prominently)',
        position: 'sidebar'
      }
    },
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Event organizer',
        position: 'sidebar'
      }
    },

    // SEO & Marketing
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
          admin: {
            description: 'SEO title (50-60 characters recommended)'
          },
          validate: (value: any) => {
            if (value && value.length > 70) {
              return 'Meta title should be less than 70 characters'
            }
            return true
          }
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'SEO description (150-160 characters recommended)',
            rows: 3
          },
          validate: (value: any) => {
            if (value && value.length > 180) {
              return 'Meta description should be less than 180 characters'
            }
            return true
          }
        },
        {
          name: 'keywords',
          type: 'text',
          localized: true,
          admin: {
            description: 'SEO keywords (comma-separated)'
          }
        }
      ]
    },

    // Registration Tracking
    {
      name: 'registrations',
      type: 'array',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true
        },
        {
          name: 'registrationDate',
          type: 'date',
          defaultValue: () => new Date()
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'confirmed',
          options: [
            { label: 'Confirmé', value: 'confirmed' },
            { label: 'En Attente', value: 'pending' },
            { label: 'Annulé', value: 'cancelled' }
          ]
        },
        {
          name: 'guests',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of additional guests'
          }
        },
        {
          name: 'specialRequirements',
          type: 'textarea',
          admin: {
            description: 'Dietary restrictions, accessibility needs, etc.'
          }
        }
      ],
      admin: {
        description: 'Event registrations and attendee management'
      }
    },

    // Impact & Results
    {
      name: 'impactMetrics',
      type: 'group',
      fields: [
        {
          name: 'attendees',
          type: 'number',
          admin: {
            description: 'Actual number of attendees'
          }
        },
        {
          name: 'mealsServed',
          type: 'number',
          admin: {
            description: 'Meals served during the event'
          }
        },
        {
          name: 'treesPlanted',
          type: 'number',
          admin: {
            description: 'Trees planted during the event'
          }
        },
        {
          name: 'volunteerHours',
          type: 'number',
          admin: {
            description: 'Total volunteer hours contributed'
          }
        },
        {
          name: 'fundsRaised',
          type: 'number',
          admin: {
            description: 'Funds raised in TND'
          }
        }
      ]
    },

    // Calendar Integration
    {
      name: 'calendarIntegration',
      type: 'group',
      fields: [
        {
          name: 'calendarEventId',
          type: 'text',
          admin: {
            description: 'Google Calendar event ID for sync'
          }
        },
        {
          name: 'icalUrl',
          type: 'text',
          admin: {
            description: 'iCal URL for external calendar subscription'
          }
        },
        {
          name: 'qrCode',
          type: 'text',
          admin: {
            description: 'QR code data for mobile check-in'
          }
        }
      ]
    },

    // Audit Trail
    {
      name: 'audit',
      type: 'group',
      fields: [
        {
          name: 'createdBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'User who created this event',
            position: 'sidebar',
            readOnly: true
          }
        },
        {
          name: 'lastModifiedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'User who last modified this event',
            position: 'sidebar',
            readOnly: true
          }
        },
        {
          name: 'version',
          type: 'number',
          defaultValue: 1,
          admin: {
            description: 'Event version number',
            position: 'sidebar',
            readOnly: true
          }
        }
      ]
    }
  ]
};
