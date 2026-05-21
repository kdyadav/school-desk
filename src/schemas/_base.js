import { z } from 'zod'

export const baseFields = {
  id: z.number().int().positive().optional(),
  uuid: z.string().uuid().optional(),
  // PostgREST returns timestamps as `2025-…T…+00:00` (with a timezone offset),
  // not the bare-`Z` form that Zod's `.datetime()` accepts by default.
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
export const hhmm = z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:MM')
