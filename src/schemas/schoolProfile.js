import { z } from 'zod'
import { baseFields } from './_base'

// Hex color like #RGB or #RRGGBB. Keep loose to also accept lower/upper case.
const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Expected a hex color like #4f46e5')

// Logo + favicon URLs returned by Supabase Storage. Public URLs are http(s);
// the schema also accepts blank strings for the "unset" state.
const imageUrl = z.string().url().or(z.literal(''))

const navItem = z.object({
  label: z.string().min(1).max(60),
  to: z.string().min(1).max(200),
})

const socialLink = z.object({
  label: z.string().min(1).max(40),
  href: z.string().min(1).max(500),
})

export const schoolProfileSchema = z.object({
  ...baseFields,
  // The singleton row always uses key=1.
  key: z.literal(1).default(1),

  schoolName: z.string().min(1).max(160),
  shortName: z.string().min(1).max(60),
  tagline: z.string().max(200).optional().default(''),
  established: z.number().int().min(1000).max(9999).nullable().optional(),

  contact: z.object({
    addressLines: z.array(z.string().min(1).max(200)).max(6).default([]),
    phone: z.string().max(60).optional().default(''),
    email: z.string().email().or(z.literal('')).optional().default(''),
    officeHours: z.string().max(120).optional().default(''),
  }).default({ addressLines: [], phone: '', email: '', officeHours: '' }),

  social: z.array(socialLink).max(20).default([]),
  nav: z.array(navItem).max(20).default([]),

  // Branding — public URLs of the assets stored in the `branding` bucket.
  logoUrl: imageUrl.nullable().optional(),
  faviconUrl: imageUrl.nullable().optional(),
  primaryColor: hexColor.optional().default('#4f46e5'),

  // Locale-ish hints (UI doesn't enforce yet but stored for downstream use).
  locale: z.string().max(20).optional().default('en'),
  currency: z.string().max(8).optional().default('USD'),
  timezone: z.string().max(80).optional().default(''),
})

export default schoolProfileSchema
