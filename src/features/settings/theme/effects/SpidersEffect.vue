<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const container = ref<HTMLDivElement | null>(null)

interface Spider {
  el: HTMLDivElement
  x: number
  targetX: number
  y: number
  direction: 'down' | 'up'
}

let spiders: Spider[] = []
let animationId: number | null = null

onMounted(() => {
  if (!container.value) return

  // Create 4 spiders that swing on webs
  for (let i = 0; i < 4; i++) {
    const web = document.createElement('div')
    const spider = document.createElement('div')

    const x = (window.innerWidth / 5) * (i + 1)

    web.style.cssText = `
      position: absolute;
      top: 0;
      left: ${x}px;
      width: 1px;
      background: rgba(255,255,255,0.3);
      pointer-events: none;
    `

    spider.textContent = '🕷️'
    spider.style.cssText = `
      position: absolute;
      top: 0;
      left: ${x - 12}px;
      font-size: 24px;
      transition: top 3s ease-in-out;
      pointer-events: none;
      z-index: 10000;
    `

    container.value.appendChild(web)
    container.value.appendChild(spider)

    spiders.push({
      el: spider,
      x,
      targetX: x,
      y: 100 + i * 50,
      direction: 'down',
    })

    // Attach web element for updating height
    ;(spider as any).webEl = web
  }

  function animate() {
    for (const s of spiders) {
      const targetY = s.direction === 'down'
        ? Math.random() * (window.innerHeight * 0.6) + 100
        : 50

      s.el.style.top = `${targetY}px`
      ;(s.el as any).webEl.style.height = `${targetY}px`

      s.direction = s.direction === 'down' ? 'up' : 'down'
    }
    animationId = window.setTimeout(animate, 3500) as any
  }

  setTimeout(animate, 500)
})

onBeforeUnmount(() => {
  if (animationId) clearTimeout(animationId)
  spiders.forEach((s) => {
    s.el.remove()
    ;(s.el as any).webEl?.remove()
  })
  spiders = []
})
</script>

<template>
  <div
    ref="container"
    class="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
  />
</template>