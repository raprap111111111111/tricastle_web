<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useThemeStore } from './theme.store'
import SnowEffect from './effects/SnowEffect.vue'
import HeartsEffect from './effects/HeartsEffect.vue'
import SpidersEffect from './effects/SpidersEffect.vue'
import ChristmasTreeEffect from './effects/ChristmasTreeEffect.vue'

const themeStore = useThemeStore()

onMounted(themeStore.loadTheme)

const currentEffect = computed(() =>
  themeStore.effectsEnabled ? themeStore.activeTheme.effect : 'none',
)

const isChristmas = computed(
  () => themeStore.activeThemeName === 'christmas' && themeStore.effectsEnabled,
)
</script>

<template>
  <!-- Snowfall -->
  <SnowEffect v-if="currentEffect === 'snow'" />

  <!-- 🎄 Christmas Tree (bottom-right) -->
  <ChristmasTreeEffect v-if="isChristmas" />

  <!-- Halloween Spiders -->
  <SpidersEffect v-if="currentEffect === 'spiders'" />

  <!-- Valentine's Hearts -->
  <HeartsEffect v-if="currentEffect === 'hearts'" />
</template>