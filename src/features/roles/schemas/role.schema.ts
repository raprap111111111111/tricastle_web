import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(255, 'Role name must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9_\- ]+$/, 'Role name can only contain letters, numbers, spaces, hyphens and underscores'),

  description: z
    .string()
    .max(255, 'Description must not exceed 255 characters')
    .nullable()
    .optional(),

  permissions: z
    .array(z.string())
    .optional()
    .default([]),
})

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(255, 'Role name must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9_\- ]+$/, 'Role name can only contain letters, numbers, spaces, hyphens and underscores')
    .optional(),

  description: z
    .string()
    .max(255, 'Description must not exceed 255 characters')
    .nullable()
    .optional(),
})

export type CreateRoleSchema = z.infer<typeof createRoleSchema>
export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>