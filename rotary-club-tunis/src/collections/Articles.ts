// Articles collection for Rotary Club news, announcements, and blog posts
import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { syncArabicAfterCreate } from '../hooks/syncArabicAfterCreate.ts';

// Temporary interface to extend User type until payload-types.ts is regenerated
interface ExtendedUser {
  role?: 'admin' | 'editor' | 'volunteer';
  id?: string;
  [key: string]: unknown;
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Article',
    plural: 'Articles'
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedDate'],
    group: 'Content',
    description: 'Articles, actualités et annonces du Rotary Club'
  },
  access: {
    read: ({ req: { user }, data }) => {
      const extendedUser = user as unknown as ExtendedUser;

      // Public read access for published articles
      if (data?.status === 'published') {
        return true;
      }

      // Authenticated users can read their own drafts and reviews
      if (user && data?.author === extendedUser?.id) {
        return true;
      }

      // Editors and admins can read all articles
      return extendedUser?.role === 'admin' || extendedUser?.role === 'editor';
    },
    create: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin' || extendedUser?.role === 'editor';
    },
    update: ({ req: { user }, data }) => {
      const extendedUser = user as unknown as ExtendedUser;

      // Users can update their own drafts and reviews
      if (data?.author === extendedUser?.id && (data?.status === 'draft' || data?.status === 'review')) {
        return true;
      }

      // Editors and admins have full update access
      return extendedUser?.role === 'admin' || extendedUser?.role === 'editor';
    },
    delete: ({ req: { user }, data }) => {
      const extendedUser = user as unknown as ExtendedUser;

      // Only admins can delete published articles
      if (data?.status === 'published' && extendedUser?.role !== 'admin') {
        return false;
      }

      // Users can delete their own drafts
      if (data?.author === extendedUser?.id && data?.status === 'draft') {
        return true;
      }

      return extendedUser?.role === 'admin';
    },
  },
  hooks: {
    beforeChange: [
      // Status transition validation
      ({ data, originalDoc, req }) => {
        const extendedUser = req.user as unknown as ExtendedUser;

        if (!data?.status || !originalDoc?.status) return data;

        // Define allowed status transitions
        const allowedTransitions: Record<string, string[]> = {
          draft: ['review', 'archived'],
          review: ['draft', 'published', 'archived'],
          published: ['archived', 'draft'], // Allow unpublishing
          archived: ['draft', 'review']
        };

        const currentStatus = originalDoc.status as string;
        const newStatus = data.status as string;

        // Skip validation for new documents (no originalDoc)
        if (!originalDoc.id) return data;

        // Check if transition is allowed
        if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
          throw new Error(`Transition from ${currentStatus} to ${newStatus} is not allowed`);
        }

        // Role-based restrictions
        if (newStatus === 'published' && extendedUser?.role === 'volunteer') {
          throw new Error('Volunteers cannot publish articles directly');
        }

        return data;
      }
    ],
    afterChange: [
      syncArabicAfterCreate,
      // Status change logging
      ({ doc, previousDoc, req, operation }) => {
        if (operation === 'update' && previousDoc?.status !== doc.status) {
          const extendedUser = req.user as unknown as ExtendedUser;
          console.log(`Article "${doc.title}" status changed from "${previousDoc?.status}" to "${doc.status}" by user ${extendedUser?.id || 'unknown'}`);
        }
      }
    ]
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Titre de l\'article en français, arabe et anglais'
      }
    },
    {
      name: 'subtitle',
      type: 'text',
      localized: true,
      admin: {
        description: 'Sous-titre ou accroche (optionnel)'
      }
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Actualités', value: 'news' },
        { label: 'Événements', value: 'events' },
        { label: 'Projets', value: 'projects' },
        { label: 'Annonces', value: 'announcements' },
        { label: 'Témoignages', value: 'testimonials' },
        { label: 'Partenariats', value: 'partnerships' },
        { label: 'Autres', value: 'other' }
      ],
      admin: {
        description: 'Catégorie de l\'article'
      }
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Image principale de l\'article'
      },
      validate: (value: unknown) => {
        if (value && typeof value === 'object' && value !== null && !('alt' in value)) {
          return 'L\'image doit avoir un texte alternatif pour l\'accessibilité';
        }
        return true;
      }
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Résumé court pour les listes d\'articles'
      }
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures
          // RTL support will be handled via CSS classes and localization settings
          // TODO: Add @payloadcms/plugin-lexical-rtl when available
        ]
      }),
      admin: {
        description: 'Contenu principal avec support RTL pour l\'arabe'
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
          localized: true
        }
      ],
      admin: {
        description: 'Galerie d\'images pour l\'article'
      }
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Auteur principal de l\'article (requis)'
      }
    },
    {
      name: 'contributors',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Contributeurs supplémentaires à l\'article (optionnel, plusieurs sélections possibles)'
      }
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm'
        },
        description: 'Date de publication (automatiquement définie lors de la publication)',
        condition: (data) => data?.status === 'published'
      },
      hooks: {
        beforeChange: [
          ({ value, data }) => {
            // Auto-set published date when status changes to published
            if (data?.status === 'published' && !value) {
              return new Date();
            }
            // Clear published date if status is not published
            if (data?.status !== 'published') {
              return null;
            }
            return value;
          }
        ]
      }
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          localized: true
        }
      ],
      admin: {
        description: 'Mots-clés pour le référencement'
      }
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Article à la une',
      defaultValue: false,
      admin: {
        description: 'Afficher en tête de page d\'accueil'
      }
    },
    {
      name: 'allowComments',
      type: 'checkbox',
      label: 'Autoriser les commentaires',
      defaultValue: true,
      admin: {
        description: 'Permettre aux visiteurs de commenter'
      }
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'En révision', value: 'review' },
        { label: 'Publiée', value: 'published' },
        { label: 'Archivée', value: 'archived' }
      ],
      admin: {
        description: 'Statut de publication de l\'article'
      }
    },
    {
      name: 'reviewer',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Réviseur qui a approuvé l\'article',
        condition: (data) => data?.status === 'published' || data?.status === 'review'
      }
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
      admin: {
        description: 'Notes du réviseur',
        condition: (data) => data?.status === 'published' || data?.status === 'review'
      }
    },
    {
      name: 'lastModifiedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Dernier utilisateur ayant modifié l\'article',
        readOnly: true
      },
      hooks: {
        beforeChange: [
          ({ req }) => {
            const extendedUser = req.user as unknown as ExtendedUser;
            return extendedUser?.id || null;
          }
        ]
      }
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
          maxLength: 60,
          admin: {
            description: 'Titre pour les moteurs de recherche (60 caractères max)'
          }
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
          admin: {
            description: 'Description pour les moteurs de recherche (160 caractères max)'
          }
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'URL canonique pour éviter le contenu dupliqué'
          }
        }
      ]
    }
  ]
};
