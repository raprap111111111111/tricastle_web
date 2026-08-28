import { z } from 'zod'

/** Nested supervisor (from supervisor_id relation) */
const supervisorSchema = z
  .object({
    id: z.number(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    full_name: z.string().optional(),
  })
  .nullable()
  .optional()

/**
 * Full User — matches users migration + UserResource / auth.profile
 */
export const userSchema = z.object({
  id: z.number(),

  // Personal
  first_name: z.string(),
  middle_name: z.string().nullable().optional(),
  last_name: z.string(),
  suffix: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),

  // Contact
  email: z.string().email(),
  email_verified_at: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),

  // Profile
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),

  // Employment
  employee_code: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  hired_date: z.string().nullable().optional(),
  supervisor_id: z.number().nullable().optional(),
  supervisor: supervisorSchema,

  // Address
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  country: z.string().nullable().optional().default('Philippines'),
  postal_code: z.string().nullable().optional(),

  // Account status
  is_active: z.boolean().optional().default(true),
  last_login_at: z.string().nullable().optional(),
  last_login_ip: z.string().nullable().optional(),
  login_count: z.number().optional().default(0),

  // Security (safe fields only — never secret/recovery codes on FE)
  two_factor_enabled: z.boolean().optional().default(false),
  password_changed_at: z.string().nullable().optional(),

  // Preferences
  locale: z.string().optional(),
  timezone: z.string().optional(),
  theme: z.string().optional(),
  theme_preference: z.string().optional(),
  effects_enabled: z.boolean().optional(),
  preferences: z.record(z.unknown()).nullable().optional(),

  // Roles (Spatie / loaded in profile)
  roles: z
    .array(z.union([z.string(), z.object({ name: z.string() }).passthrough()]))
    .optional(),
  permissions: z.array(z.string()).optional(),

  // Timestamps
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

// ─── Create / Update forms (admin user CRUD) ─────────────────────────
const baseUserFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional().nullable(),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  employee_code: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
})

export const createUserSchema = baseUserFormSchema.refine(
  (d) => d.password === d.password_confirmation,
  { message: 'Passwords do not match', path: ['password_confirmation'] }
)

export const updateUserSchema = baseUserFormSchema
  .omit({ password: true, password_confirmation: true })
  .partial()
  .extend({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .optional()
      .or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => {
      if (d.password && d.password !== '') {
        return d.password === d.password_confirmation
      }
      return true
    },
    { message: 'Passwords do not match', path: ['password_confirmation'] }
  )

export type CreateUserForm = z.infer<typeof createUserSchema>
export type UpdateUserForm = z.infer<typeof updateUserSchema>