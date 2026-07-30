export interface User {
  id: number
  first_name: string
  middle_name?: string | null
  last_name: string
  full_name?: string
  email: string
  phone?: string | null
  avatar?: string | null
  employee_code?: string
  department?: string
  position?: string
  is_active: boolean
  last_login_at?: string
  roles: string[]
  permissions: string[]
  created_at?: string
  updated_at?: string
}