import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  deviceName: z.string().optional().default('web'),
})

export const registerSchema = z.object({
  firstName:  z.string().min(2, 'First name is required'),
  middleName: z.string().optional(),
  lastName:   z.string().min(2, 'Last name is required'),
  email:      z.string().email('Invalid email address'),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirmation: z.string(),
  phone:      z.string().optional(),
  mobile:     z.string().min(10, 'Mobile number is required'),
  role:       z.string().optional().default('guest'),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ['passwordConfirmation'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>