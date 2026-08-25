import { ref, computed } from 'vue'

const isMobileOpen = ref(false)
const isCollapsed = ref(false)

export function useSidebar() {
  const sidebarWidthClass = computed(() => {
    if (isCollapsed.value) return 'md:w-[84px]'
    return 'md:w-[290px]'
  })

  function openMobile() {
    isMobileOpen.value = true
  }

  function closeMobile() {
    isMobileOpen.value = false
  }

  function toggleMobile() {
    isMobileOpen.value = !isMobileOpen.value
  }

  function toggleCollapsed() {
    isCollapsed.value = !isCollapsed.value
  }

  return {
    isMobileOpen,
    isCollapsed,
    sidebarWidthClass,
    openMobile,
    closeMobile,
    toggleMobile,
    toggleCollapsed,
  }
}