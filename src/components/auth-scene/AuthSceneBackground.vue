<!-- src/components/auth-scene/AuthSceneBackground.vue -->
<template>
  <div class="auth-scene" aria-hidden="true">
    
    <!-- Background subtle shapes -->
    <div class="bg-blob blob-1" />
    <div class="bg-blob blob-2" />

    <!-- Huge global flight arc -->
    <svg class="route-line" viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <path
        d="M -100,500 Q 500,200 1100,600"
        fill="none"
        stroke="rgba(123, 163, 201, 0.3)"
        stroke-width="3"
        stroke-dasharray="10 15"
        class="dash-anim"
      />
    </svg>

    <AuthAirplane />
    <AuthGlobe />
    
  </div>
</template>

<script setup lang="ts">
import AuthAirplane from './AuthAirplane.vue'
import AuthGlobe from './AuthGlobe.vue'
</script>

<style scoped>
.auth-scene {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, #ffffff 0%, #f7f3ee 100%);
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  z-index: 0;
}
.blob-1 {
  width: 50vw; height: 50vw;
  background: #ffe3d1;
  top: -20%; left: -10%;
}
.blob-2 {
  width: 40vw; height: 40vw;
  background: #e3f0fa;
  bottom: -10%; right: -5%;
}

.route-line {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1;
}

.dash-anim {
  animation: dashMove 30s linear infinite;
}

@keyframes dashMove {
  from { stroke-dashoffset: 1000; }
  to { stroke-dashoffset: 0; }
}
</style>