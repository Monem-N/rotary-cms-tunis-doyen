// Modular field configurations for Events Collection

import { lexicalEditor } from '@payloadcms/richtext-lexical';
import type { Field } from '../../types/events';
import { EVENT_CONSTANTS } from '../../constants/events';
import {
  validateExcerpt,
  validateMetaTitle,
  validateMetaDescription,
  generateSlug,
  getCurrentDate
} from '../../validation/events';

// Basic Event Information Fields
export const basicInfoFields: Field[] = [
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
        ({ data, value }) => generateSlug(data, value as string)
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
    validate: validateExcerpt
  }
];

// Event Scheduling Fields
export const schedulingFields: Field[] = [
  {
    name: 'eventDate',
    type: 'date',
    required: true,
    admin: {
      description: 'Event start date and time (Tunisia timezone UTC+1)',
      position: 'sidebar',
      date: {
        pickerAppearance: 'dayAndTime',
        displayFormat: 'dd/MM/yyyy HH:mm'
      }
    }
  },
  {
    name: 'endDate',
    type: 'date',
    admin: {
      description: 'Event end date and time (optional for multi-day events)',
      position: 'sidebar',
      date: {
        pickerAppearance: 'dayAndTime',
        displayFormat: 'dd/MM/yyyy HH:mm'
      }
    }
  },
  {
    name: 'timezone',
    type: 'select',
    defaultValue: EVENT_CONSTANTS.DEFAULTS.TIMEZONE,
    options: [
      { label: 'Tunisia (UTC+1)', value: 'Africa/Tunis' },
      { label: 'UTC', value: 'UTC' },
      { label: 'Paris (UTC+1)', value: 'Europe/Paris' }
    ],
    admin: {
      description: 'Event timezone for proper scheduling',
      position: 'sidebar'
    }
  }
];

// Location and Venue Fields
export const locationFields: Field[] = [
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
  }
];

// Event Details Fields
export const detailsFields: Field[] = [
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
  }
];

// Capacity and Registration Fields
export const registrationFields: Field[] = [
  {
    name: 'capacity',
    type: 'number',
    defaultValue: EVENT_CONSTANTS.DEFAULTS.CAPACITY,
    admin: {
      description: 'Maximum number of attendees',
      position: 'sidebar'
    }
  },
  {
    name: 'registrationEnabled',
    type: 'checkbox',
    defaultValue: EVENT_CONSTANTS.DEFAULTS.REGISTRATION_ENABLED,
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
      position: 'sidebar',
      date: {
        pickerAppearance: 'dayAndTime',
        displayFormat: 'dd/MM/yyyy HH:mm'
      }
    }
  },
  {
    name: 'registrationFee',
    type: 'number',
    admin: {
      description: 'Registration fee in TND (0 for free events)',
      position: 'sidebar'
    }
  }
];

// Media and Visual Fields
export const mediaFields: Field[] = [
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
        relationTo: 'media'
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
        admin: {
          description: 'Alt text for accessibility (WCAG compliance)'
        }
      }
    ],
    admin: {
      description: 'Event photo gallery'
    }
  }
];

// Publication and Workflow Fields
export const publicationFields: Field[] = [
  {
    name: 'status',
    type: 'select',
    required: true,
    defaultValue: EVENT_CONSTANTS.STATUS_DRAFT,
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
    defaultValue: EVENT_CONSTANTS.DEFAULTS.FEATURED,
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
  }
];

// SEO and Marketing Fields
export const seoFields: Field[] = [
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
        validate: validateMetaTitle
      },
      {
        name: 'metaDescription',
        type: 'textarea',
        localized: true,
        admin: {
          description: 'SEO description (150-160 characters recommended)',
          rows: 3
        },
        validate: validateMetaDescription
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
  }
];

// Registration Tracking Fields
export const registrationTrackingFields: Field[] = [
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
        defaultValue: getCurrentDate
      },
      {
        name: 'status',
        type: 'select',
        defaultValue: EVENT_CONSTANTS.REGISTRATION_CONFIRMED,
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
          description: 'Number of guests'
        }
      }
    ]
  }
];

// Audit Trail Fields
export const auditFields: Field[] = [
  {
    name: 'audit',
    type: 'group',
    admin: {
      description: 'Track event creation and modifications'
    },
    fields: [
      {
        name: 'createdBy',
        type: 'relationship',
        relationTo: 'users',
        admin: {
          readOnly: true,
          description: 'User who created the event'
        }
      },
      {
        name: 'lastModifiedBy',
        type: 'relationship',
        relationTo: 'users',
        admin: {
          readOnly: true,
          description: 'User who last modified the event'
        }
      },
      {
        name: 'version',
        type: 'number',
        defaultValue: EVENT_CONSTANTS.DEFAULTS.VERSION,
        admin: {
          readOnly: true,
          description: 'Revision number'
        }
      }
    ]
  }
];

// All fields combined
export const allEventFields: Field[] = [
  ...basicInfoFields,
  ...schedulingFields,
  ...locationFields,
  ...detailsFields,
  ...registrationFields,
  ...mediaFields,
  ...publicationFields,
  ...seoFields,
  ...registrationTrackingFields,
  ...auditFields
];