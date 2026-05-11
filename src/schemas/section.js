import { z } from 'zod'
import { baseFields } from './_base'

export const sectionSchema = z.object({
  ...baseFields,
  classId: z.number().int().positive(),
  name: z.string().min(1).max(20),
  classTeacherId: z.number().int().positive().nullable().optional(),
})
