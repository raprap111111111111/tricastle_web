import type { Permission } from '@shared/constants/permissions'

export interface NavItem {
  icon: string
  title: string
  to: string
  permissions: (Permission | string)[]
  activeRoutes?: string[]
  exact?: boolean          // ← added
}

export interface NavSection {
  title: string
  items: NavItem[]
}