// Board meeting minutes collection - restricted to admin access
import type { CollectionConfig } from 'payload';

// Temporary interface to extend User type until payload-types.ts is regenerated
interface ExtendedUser {
  role?: 'admin' | 'editor' | 'volunteer';
  id?: string;
  [key: string]: unknown;
}

export const Minutes: CollectionConfig = {
  slug: 'minutes',
  labels: {
    singular: 'Procès-verbal',
    plural: 'Procès-verbaux'
  },
  access: {
    read: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin';
    },
    create: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin';
    },
    update: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin';
    },
    delete: ({ req: { user } }) => {
      const extendedUser = user as unknown as ExtendedUser;
      return extendedUser?.role === 'admin';
    },
  },
  admin: {
    useAsTitle: 'meetingDate',
    defaultColumns: ['meetingDate', 'boardRole'],
    group: 'Content',
    description: 'Documents privés réservés au conseil d\'administration'
  },
  fields: [
    {
      name: 'meetingDate',
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
      name: 'boardRole',
      type: 'select',
      required: true,
      options: [
        { label: 'Président', value: 'president' },
        { label: 'Trésorier', value: 'treasurer' },
        { label: 'Secrétaire', value: 'secretary' },
        { label: 'Membre du conseil', value: 'board-member' }
      ]
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Téléchargez le PDF signé du conseil'
      }
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Résumé des points clés en français/arabe'
      }
    }
  ]
};
