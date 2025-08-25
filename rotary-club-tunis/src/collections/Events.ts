// Tunisia-specific Events collection for Rotary Club Tunis Doyen
import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { syncArabicAfterCreate } from '../hooks/syncArabicAfterCreate';

// Temporary interface to extend User type until payload-types.ts is regenerated
interface ExtendedUser {
  role?: 'admin' | 'editor' | 'volunteer';
  id?: string;
  [key: string]: unknown;
}

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventDate', 'locale'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin' || extendedUser?.role === 'editor';
    },
    update: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin' || extendedUser?.role === 'editor';
    },
    delete: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin';
    },
  },
  hooks: {
    afterChange: [syncArabicAfterCreate]
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Titre de l\'événement en français, arabe et anglais'
      }
    },
    {
      name: 'eventDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy'
        }
      }
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      localized: true
    },
    {
      name: 'description',
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
        description: 'Description détaillée avec support RTL pour l\'arabe'
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
      ]
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
        description: 'Catégories alignées sur les 7 domaines d\'action de Rotary'
      }
    },
    {
      name: 'impactMetrics',
      type: 'group',
      fields: [
        {
          name: 'mealsServed',
          type: 'number',
          admin: {
            description: 'Repas servis (chiffre entier)'
          }
        },
        {
          name: 'treesPlanted',
          type: 'number',
          admin: {
            description: 'Arbres plantés (chiffre entier)'
          }
        },
        {
          name: 'volunteerHours',
          type: 'number',
          admin: {
            description: 'Heures de bénévolat'
          }
        }
      ]
    }
  ]
};
