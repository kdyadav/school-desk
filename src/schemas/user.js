import { z } from 'zod'
import { baseFields } from './_base'

export const ROLES = ['owner', 'admin', 'teacher', 'student', 'parent']

// Credentials live in Supabase Auth (auth.users); the public `profiles` table
// — which this schema maps to via the `users` API name — only carries role
// and identity metadata.
export const userSchema = z.object({
  ...baseFields,
  email: z.string().email(),
  role: z.enum(ROLES),
  name: z.string().min(1).max(120).optional(),
  linkedId: z.number().int().positive().nullable().optional(),
})
