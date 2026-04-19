import type { Access } from 'payload'

export const readPublishedOrAdmin: Access = ({ req }) => {
  if (req.user?.collection === 'admins') return true
  return { is_published: { equals: true } }
}
