import type { Access } from 'payload'

export const isOwnProgress: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.collection === 'admins') return true
  return { user: { equals: req.user.id } }
}
