import type { CollectionConfig } from 'payload'

// Temporary interface to extend User type until payload-types.ts is regenerated
interface ExtendedUser {
  role?: 'admin' | 'editor' | 'volunteer';
  id?: string;
  [key: string]: unknown;
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
    group: 'Media',
  },
  access: {
    read: ({ req }) => {
      // Public can read, but we'll handle GDPR compliance in hooks
      return true;
    },
    create: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin' || extendedUser?.role === 'editor' || extendedUser?.role === 'volunteer';
    },
    update: ({ req: { user }, data }) => {
      const extendedUser = user as unknown as ExtendedUser;

      // Only admins can modify consent-related fields
      if (data && (data.consentGiven !== undefined || data.consentType !== undefined || data.legalBasis !== undefined)) {
        return extendedUser?.role === 'admin';
      }

      // Regular editors can update other fields
      return extendedUser?.role === 'admin' || extendedUser?.role === 'editor';
    },
    delete: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      // Only admins can delete media (GDPR compliance)
      return extendedUser?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Texte alternatif pour l\'accessibilité (requis pour GDPR)'
      }
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      admin: {
        description: 'Légende de l\'image (optionnel)'
      }
    },
    {
      name: 'consentGiven',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: {
        description: 'Consentement GDPR obtenu pour cette image (requis)'
      }
    },
    {
      name: 'consentDate',
      type: 'date',
      required: false,
      admin: {
        description: 'Date d\'obtention du consentement',
        condition: (data) => data.consentGiven === true
      }
    },
    {
      name: 'consentType',
      type: 'select',
      required: true,
      options: [
        { label: 'Explicite', value: 'explicit' },
        { label: 'Implicite', value: 'implicit' },
        { label: 'Retiré', value: 'withdrawn' }
      ],
      defaultValue: 'explicit',
      admin: {
        description: 'Type de consentement obtenu'
      }
    },
    {
      name: 'dataProcessingPurpose',
      type: 'textarea',
      localized: true,
      required: false,
      admin: {
        description: 'Finalité du traitement des données (ex: publication sur site web, archives, etc.)',
        condition: (data) => data.consentGiven === true
      }
    },
    {
      name: 'legalBasis',
      type: 'select',
      required: true,
      options: [
        { label: 'Consentement', value: 'consent' },
        { label: 'Intérêt légitime', value: 'legitimate_interest' },
        { label: 'Obligation légale', value: 'legal_obligation' },
        { label: 'Exécution d\'un contrat', value: 'contract_performance' },
        { label: 'Intérêt vital', value: 'vital_interest' },
        { label: 'Intérêt public', value: 'public_interest' }
      ],
      defaultValue: 'consent',
      admin: {
        description: 'Base légale du traitement des données'
      }
    },
    {
      name: 'photographer',
      type: 'text',
      admin: {
        description: 'Nom du photographe (pour attribution)'
      }
    }
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Validation: consentDate is required when consentGiven is true
        if (data.consentGiven && !data.consentDate) {
          throw new Error('La date de consentement est requise lorsque le consentement est donné');
        }

        // Set consentDate to current date if consentGiven is true and no date provided
        if (data.consentGiven && !data.consentDate) {
          data.consentDate = new Date().toISOString();
        }

        // Handle consent withdrawal
        if (data.consentType === 'withdrawn') {
          data.consentGiven = false;
          // Keep the withdrawal date for audit purposes
          if (!data.consentDate) {
            data.consentDate = new Date().toISOString();
          }
        }

        return data;
      }
    ],
    afterChange: [
      ({ doc, previousDoc, operation, req }) => {
        // Audit logging for consent changes
        if (operation === 'update' && previousDoc) {
          const consentFields = ['consentGiven', 'consentType', 'legalBasis'];
          const hasConsentChange = consentFields.some(field =>
            doc[field] !== previousDoc[field]
          );

          if (hasConsentChange) {
            console.log(`[GDPR Audit] Media consent change for ID ${doc.id}:`, {
              user: req.user?.id || 'system',
              timestamp: new Date().toISOString(),
              previousValues: {
                consentGiven: previousDoc.consentGiven,
                consentType: previousDoc.consentType,
                legalBasis: previousDoc.legalBasis
              },
              newValues: {
                consentGiven: doc.consentGiven,
                consentType: doc.consentType,
                legalBasis: doc.legalBasis
              }
            });
          }
        }
      }
    ]
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        crop: 'center'
      },
      {
        name: 'card',
        width: 600,
        height: 400,
        crop: 'center'
      },
      {
        name: 'hero',
        width: 1200,
        height: 600,
        crop: 'center'
      }
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  },
}
