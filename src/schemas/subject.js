import { z } from 'zod'
import { baseFields } from './_base'

export const subjectSchema = z.object({
  ...baseFields,
  name: z.string().min(1).max(60),
  code: z.string().min(1).max(20),
})
