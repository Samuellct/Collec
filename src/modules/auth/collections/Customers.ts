import type { CollectionConfig, CollectionBeforeOperationHook } from 'payload'
import { APIError } from 'payload'
import { isAdmin, isSelfOrAdmin } from '../access/is-admin.ts'
import { generateVerificationEmailHTML, generateVerificationEmailSubject } from '../email/verification-email.ts'
import { generateResetPasswordEmailHTML, generateResetPasswordEmailSubject } from '../email/reset-password-email.ts'

const blockDisabledLogin: CollectionBeforeOperationHook = async ({ operation, args, req }) => {
  if (operation !== 'login') return args
  const data = (args as Record<string, unknown>).data as Record<string, unknown> | undefined
  const email = typeof data?.email === 'string' ? data.email : null
  if (!email) return args
  const result = await req.payload.find({
    collection: 'customers',
    where: { email: { equals: email }, disabled: { equals: true } },
    limit: 1,
    overrideAccess: true,
  })
  if (result.docs.length > 0) {
    throw new APIError('Ce compte est désactivé.', 401, undefined, true)
  }
  return args
}

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
  hooks: {
    beforeOperation: [blockDisabledLogin],
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
