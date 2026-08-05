<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
const snowflakes: any[] = []

onMounted(() => {
  const cv = canvas.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return

  function resize() {
    if (!cv) return
    cv.width = window.innerWidth
    cv.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Initialize snowflakes
  for (let i = 0; i < 80; i++) {
    snowflakes.push({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      radius: Math.random() * 3 + 1,
      speed: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      drift: Math.random() * 0.4 - 0.2,
    })
  }

  function draw() {
    if (!ctx || !cv) return
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'

    for (const flake of snowflakes) {
      ctx.globalAlpha = flake.opacity
      ctx.beginPath()
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
      ctx.fill()

      flake.y += flake.speed
      flake.x += flake.drift

      if (flake.y > cv.height) {
        flake.y = -5
        flake.x = Math.random() * cv.width
      }
    }

    animationId = requestAnimationFrame(draw)
  }
  draw()
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="fixed inset-0 pointer-events-none z-[9999]"
  />
</template>