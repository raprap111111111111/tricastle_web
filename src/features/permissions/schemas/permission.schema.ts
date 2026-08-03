import { z } from 'zod'

// Enforce dot notation: module.action
const DOT_NOTATION_REGEX = /^[a-z]+\.[a-zA-Z]+$/

export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Permission name is required')
    .max(255, 'Permission name must not exceed 255 characters')
    .regex(
      DOT_NOTATION_REGEX,
      'Must be in dot notation (e.g., "role.viewAny")'
    ),

  description: z
    .string()
    .max(255, 'Description must not exceed 255 characters')
    .nullable()
    .optional(),

  module: z
    .string()
    .max(100, 'Module must not exceed 100 characters')
    .nullable()
    .optional(),
})

export const updatePermissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Permission name is required')
    .max(255)
    .regex(
      DOT_NOTATION_REGEX,
      'Must be in dot notation (e.g., "role.viewAny")'
    )
    .optional(),

  description: z
    .string()
    .max(255)
    .nullable()
    .optional(),

  module: z
    .string()
    .max(100)
    .nullable()
    .optional(),
})

export type CreatePermissionSchema = z.infer<typeof createPermissionSchema>
export type UpdatePermissionSchema = z.infer<typeof updatePermissionSchema>