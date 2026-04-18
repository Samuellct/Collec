import type { CollectionConfig } from 'payload'
import { isAdmin, isSelfOrAdmin } from '../access/is-admin.ts'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 600000,
    tokenExpiration: 7200,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    },
  },
  admin: {
    useAsTitle: 'email',
    group: 'Utilisateurs',
    hidden: ({ user }) => user?.collection !== 'admins',
  },
  access: {
    create: () => true,
    read: isSelfOrAdmin,
    update: isSelfOrAdmin,
    delete: isAdmin,
  },
  fields: [],
}
