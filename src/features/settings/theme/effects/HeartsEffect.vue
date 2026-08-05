<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const container = ref<HTMLDivElement | null>(null)
let interval: any = null

onMounted(() => {
  interval = setInterval(() => {
    if (!container.value) return
    const heart = document.createElement('div')
    heart.textContent = ['💗', '💕', '💖', '❤️', '💘'][Math.floor(Math.random() * 5)]
    heart.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      bottom: -30px;
      font-size: ${Math.random() * 24 + 16}px;
      opacity: ${Math.random() * 0.6 + 0.4};
      animation: heartFloatUp ${Math.random() * 4 + 4}s linear;
      pointer-events: none;
    `
    container.value.appendChild(heart)
    setTimeout(() => heart.remove(), 8000)
  }, 400)
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div
    ref="container"
    class="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
  />
</template>

<style>
@keyframes heartFloatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-110vh) rotate(360deg);
    opacity: 0;
  }
}
</style>