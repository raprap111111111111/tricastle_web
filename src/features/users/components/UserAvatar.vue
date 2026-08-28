<!-- src/features/users/components/UserAvatar.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { User } from '../types'
import { resolveAvatarUrl } from '../utils/avatarUrl'

const props = withDefaults(
  defineProps<{
    user: Pick<User, 'first_name' | 'last_name' | 'avatar' | 'initials'>
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  { size: 'md' }
)

const imgError = ref(false)

watch(
  () => props.user.avatar,
  () => {
    imgError.value = false
  }
)

const sizeClasses = computed(() => ({
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-2xl',
}[props.size]))

const initials = computed(() => {
  if (props.user.initials) return props.user.initials
  const f = props.user.first_name?.[0] ?? ''
  const l = props.user.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
})

const colorClass = computed(() => {
  const colors = [
    'bg-apricot-100 text-apricot-700',
    'bg-blueberry-100 text-blueberry-700',
    'bg-citrus-100 text-citrus-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-blue-100 text-blue-700',
  ]
  const name = `${props.user.first_name ?? ''}${props.user.last_name ?? ''}`
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
})

const avatarUrl = computed(() => resolveAvatarUrl(props.user.avatar))
</script>

<template>
  <div
    class="rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden"
    :class="[sizeClasses, (!avatarUrl || imgError) && colorClass]"
  >
    <img
      v-if="avatarUrl && !imgError"
      :src="avatarUrl"
      class="w-full h-full object-cover"
      alt=""
      @error="imgError = true"
    />
    <span v-else>{{ initials }}</span>
  </div>
</template>