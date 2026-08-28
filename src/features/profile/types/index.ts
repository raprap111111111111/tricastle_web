export interface UpdateProfilePayload {
  first_name: string
  middle_name?: string | null
  last_name: string
  suffix?: string | null
  email: string
  phone?: string | null
  mobile?: string | null
  date_of_birth?: string | null
  gender?: string | null
  department?: string | null
  position?: string | null
  address?: string | null
  city?: string | null
  province?: string | null
  country?: string | null
  postal_code?: string | null
  bio?: string | null
  avatar?: File | null
}

export interface ChangePasswordPayload {
  current_password?: string
  password?: string
  password_confirmation?: string
}