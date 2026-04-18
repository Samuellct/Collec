import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/is-admin.ts'

export const Admins: CollectionConfig = {
  slug: 'admins',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Systeme',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [],
}
