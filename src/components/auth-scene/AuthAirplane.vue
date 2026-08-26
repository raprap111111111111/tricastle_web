<!-- src/components/auth-scene/AuthAirplane.vue -->
<template>
  <div class="auth-airplane" :style="planeStyle" aria-hidden="true">
    
    <!-- Sunset Lens Flare -->
    <div class="sun-flare" />

    <!-- Jet Engine Cloud Contrails -->
    <div class="contrail contrail-top" />
    <div class="contrail contrail-bottom" />

    <!-- Realistic Photographic Airplane from public/airplane.png -->
    <img 
      src="/airplane.png" 
      alt="Tricastle Aviation Airplane" 
      class="plane-image"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'

const t = ref(0)
let raf = 0

onMounted(() => {
  const tick = () => {
    t.value += 0.002 // Slow, realistic flight speed
    raf = requestAnimationFrame(tick)
  }
  tick()
})

onUnmounted(() => cancelAnimationFrame(raf))

const planeStyle = computed(() => {
  const pathX = 8 + Math.sin(t.value) * 8
  const pathY = 15 + Math.cos(t.value * 1.5) * 4
  const tilt = Math.cos(t.value) * 3

  return {
    transform: `translate3d(${pathX}vw, ${pathY}vh, 0) rotate(${tilt}deg)`,
  }
})
</script>

<style scoped>
.auth-airplane {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
  will-change: transform;
}

/* The Realistic Plane Image */
.plane-image {
  width: 380px; /* Big scale to see the details */
  height: auto;
  filter: drop-shadow(0 40px 30px rgba(0, 0, 0, 0.25)); /* High altitude shadow */
  animation: planeBob 6s ease-in-out infinite;
  position: relative;
  z-index: 2;
  display: block;
}

/* Sunset Lens Flare Effect */
.sun-flare {
  position: absolute;
  top: -40px;
  right: -20px;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(255, 200, 100, 0.4) 0%, transparent 60%);
  filter: blur(20px);
  mix-blend-mode: screen;
  z-index: 3;
  animation: flarePulse 4s ease-in-out infinite alternate;
}

/* Realistic Jet Contrails */
.contrail {
  position: absolute;
  right: 260px;
  height: 12px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9));
  border-radius: 999px;
  filter: blur(4px);
  animation: contrailFlow 2s linear infinite;
  z-index: 1;
}

.contrail-top {
  top: 48%;
  width: 200px;
}

.contrail-bottom {
  top: 60%;
  width: 220px;
  opacity: 0.8;
}

.plane-label {
  position: absolute;
  left: 50%;
  bottom: -40px;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #1e3c5a;
  white-space: nowrap;
}

@keyframes planeBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes contrailFlow {
  0% { transform: translateX(0) scaleY(1); opacity: 0.5; }
  50% { opacity: 0.9; }
  100% { transform: translateX(-40px) scaleY(1.5); opacity: 0; }
}

@keyframes flarePulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.2); opacity: 1; }
}

@media (max-width: 1024px) {
  .auth-airplane { display: none; }
}
</style>