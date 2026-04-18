import type { Access } from 'payload'

export const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const isSelfOrAdmin: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.collection === 'admins') return true
  return { id: { equals: req.user.id } }
}
