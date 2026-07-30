import type { AxiosError } from 'axios'

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

export function parseApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>

  if (axiosError.response) {
    return {
      message: axiosError.response.data?.message ?? 'Something went wrong.',
      errors:  axiosError.response.data?.errors,
      status:  axiosError.response.status,
    }
  }

  if (axiosError.request) {
    return { message: 'Network error. Please check your connection.' }
  }

  return { message: 'Unexpected error occurred.' }
}