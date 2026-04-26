import type { CollectionConfig } from 'payload'
import { isAdmin, isSelfOrAdmin } from '../access/is-admin.ts'
import { generateVerificationEmailHTML, generateVerificationEmailSubject } from '../email/verification-email.ts'
import { generateResetPasswordEmailHTML, generateResetPasswordEmailSubject } from '../email/reset-password-email.ts'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    verify: {
      generateEmailHTML: (args) =>
        generateVerificationEmailHTML({ token: args?.token ?? '' }),
      generateEmailSubject: () => generateVerificationEmailSubject(),
    },
    maxLoginAttempts: 5,
    lockTime: 600000,
    tokenExpiration: 7200,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    },
    forgotPassword: {
      generateEmailHTML: (args) =>
        generateResetPasswordEmailHTML({ token: args?.token ?? '' }),
      generateEmailSubject: () => generateResetPasswordEmailSubject(),
    },
  },
  admin: {
    useAsTitle: 'email',
    group: 'Utilisateurs',
    hidden: ({ user }) => user?.collection !== 'admins',
    defaultColumns: ['email', 'pseudo', '_verified', 'disabled', 'createdAt'],
    defaultSort: '-createdAt',
    listSearchableFields: ['email', 'pseudo'],
    components: {
      edit: {
        beforeDocumentControls: [
          '@/components/admin/ResendVerificationButton#ResendVerificationButton',
        ],
      },
    },
  },
  access: {
    create: () => true,
    read: isSelfOrAdmin,
    update: isSelfOrAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'disabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Désactiver ce compte pour empêcher la connexion.',
        position: 'sidebar',
      },
    },
  ],
}
