<!-- src/components/auth-scene/AuthGlobe.vue -->
<template>
  <div 
    ref="globeRef"
    class="auth-globe"
    :style="containerStyle"
  >
    <div class="globe-wrapper" :style="tiltStyle">
      
      <!-- Realistic ground shadow -->
      <div class="globe-shadow" />

      <!-- 3D Textured Sphere -->
      <div class="globe-3d-container">
        <!-- Earth Surface Map -->
        <div class="earth-surface" />
        
        <!-- Earth Clouds Map (Spins slightly faster for realism) -->
        <div class="earth-clouds" />
        
        <!-- Atmospheric Lighting & 3D Volume -->
        <div class="earth-atmosphere" />
      </div>

      <!-- Location Pins -->
      <div class="pin pin-ph"><span>PH</span></div>
      <div class="pin pin-jp"><span>JP</span></div>
      
    </div>
    <span class="globe-label">Global Network</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const globeRef = ref<HTMLElement | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
const isHovering = ref(false)

function onPointerMove(e: PointerEvent) {
  if (!globeRef.value) return
  const rect = globeRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const distX = e.clientX - centerX
  const distY = e.clientY - centerY
  
  const distance = Math.sqrt(distX * distX + distY * distY)
  
  if (distance < 400) {
    isHovering.value = true
    mouseX.value = Math.max(-1, Math.min(1, distX / 200))
    mouseY.value = Math.max(-1, Math.min(1, distY / 200))
  } else {
    isHovering.value = false
    mouseX.value = 0
    mouseY.value = 0
  }
}

onMounted(() => window.addEventListener('pointermove', onPointerMove, { passive: true }))
onUnmounted(() => window.removeEventListener('pointermove', onPointerMove))

const containerStyle = computed(() => ({
  right: '8%',
  top: '30%',
}))

const tiltStyle = computed(() => {
  const rotX = isHovering.value ? mouseY.value * -25 : 0
  const rotY = isHovering.value ? mouseX.value * 25 : 0
  return {
    transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
    transition: isHovering.value ? 'transform 0.15s ease-out' : 'transform 1.5s ease-in-out'
  }
})
</script>

<style scoped>
.auth-globe {
  position: absolute;
  z-index: 3;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.globe-wrapper {
  position: relative;
  width: 280px;
  height: 280px;
  transform-style: preserve-3d;
}

/* 3D Container */
.globe-3d-container {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
}

/* Real Earth Satellite Texture */
.earth-surface {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-image: url('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  background-size: 200% 100%;
  animation: spinEarth 30s linear infinite;
}

/* Real Cloud Texture Layer */
.earth-clouds {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-image: url('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');
  background-size: 200% 100%;
  opacity: 0.7;
  mix-blend-mode: screen;
  animation: spinEarth 24s linear infinite; /* Clouds spin faster */
}

/* Deep 3D Lighting & Shadows */
.earth-atmosphere {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 
    inset -40px -20px 60px rgba(0, 0, 0, 0.9), /* Dark side of earth */
    inset 15px 15px 40px rgba(255, 255, 255, 0.4), /* Sun reflection */
    inset 0 0 20px rgba(100, 150, 255, 0.2); /* Atmospheric rim */
  pointer-events: none;
}

/* Hovering Drop Shadow (Like your reference image) */
.globe-shadow {
  position: absolute;
  bottom: -40px;
  left: 15%;
  width: 70%;
  height: 30px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  filter: blur(12px);
  transform: rotateX(75deg);
}

.pin {
  position: absolute;
  background: white;
  color: #1e3c5a;
  font-size: 10px;
  font-weight: 800;
  padding: 5px 10px;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
}
.pin::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 50%;
  transform: translateX(-50%);
  border-width: 4px 4px 0;
  border-style: solid;
  border-color: white transparent transparent transparent;
}
.pin-ph { top: 30%; left: 5%; animation: float 3s ease-in-out infinite; }
.pin-jp { top: 15%; right: 10%; color: #C47A45; animation: float 3s ease-in-out infinite 1s; }

.globe-label {
  position: absolute;
  bottom: -60px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #7BA3C9;
  text-transform: uppercase;
}

@keyframes spinEarth {
  0% { background-position: 200% 0; }
  100% { background-position: 0% 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@media (max-width: 1024px) {
  .auth-globe { display: none; }
}
</style>