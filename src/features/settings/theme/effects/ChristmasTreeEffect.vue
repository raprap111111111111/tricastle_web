<script setup lang="ts">
// Just decorative — no logic needed
</script>

<template>
  <div class="christmas-tree-container">
    <!-- Twinkling lights on tree -->
    <div class="tree">
      <!-- Star on top -->
      <div class="star">⭐</div>

      <!-- Tree layers (top to bottom) -->
      <div class="tree-layer layer-1">
        <div class="lights">
          <span class="light red"></span>
          <span class="light yellow"></span>
          <span class="light blue"></span>
        </div>
      </div>

      <div class="tree-layer layer-2">
        <div class="lights">
          <span class="light green"></span>
          <span class="light red"></span>
          <span class="light yellow"></span>
          <span class="light blue"></span>
        </div>
      </div>

      <div class="tree-layer layer-3">
        <div class="lights">
          <span class="light yellow"></span>
          <span class="light blue"></span>
          <span class="light green"></span>
          <span class="light red"></span>
          <span class="light yellow"></span>
        </div>
      </div>

      <!-- Tree trunk -->
      <div class="trunk"></div>

      <!-- Presents under tree -->
      <div class="presents">
        <span class="present p1">🎁</span>
        <span class="present p2">🎀</span>
        <span class="present p3">🎁</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.christmas-tree-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9998;
  pointer-events: none;
  width: 140px;
  height: 200px;
  animation: gentleSway 4s ease-in-out infinite;
}

@keyframes gentleSway {
  0%, 100% { transform: rotate(-2deg); }
  50%      { transform: rotate(2deg); }
}

.tree {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Star */
.star {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
  animation: starGlow 2s ease-in-out infinite;
  z-index: 10;
}

@keyframes starGlow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
    transform: translateX(-50%) scale(1);
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(255, 215, 0, 1));
    transform: translateX(-50%) scale(1.1);
  }
}

/* Tree layers — CSS triangles */
.tree-layer {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-color: transparent transparent #0F5132 transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.layer-1 {
  top: 15px;
  border-width: 0 30px 45px 30px;
  z-index: 3;
}

.layer-2 {
  top: 45px;
  border-width: 0 45px 60px 45px;
  z-index: 2;
}

.layer-3 {
  top: 85px;
  border-width: 0 60px 75px 60px;
  z-index: 1;
}

/* Colored lights */
.lights {
  position: absolute;
  top: 100%;
  left: -50%;
  transform: translateX(50%);
  display: flex;
  gap: 8px;
  margin-top: -25px;
}

.light {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  animation: twinkle 1.5s ease-in-out infinite;
}

.light.red    { background: #EF4444; box-shadow: 0 0 8px #EF4444; animation-delay: 0s; }
.light.yellow { background: #FCD34D; box-shadow: 0 0 8px #FCD34D; animation-delay: 0.3s; }
.light.blue   { background: #3B82F6; box-shadow: 0 0 8px #3B82F6; animation-delay: 0.6s; }
.light.green  { background: #10B981; box-shadow: 0 0 8px #10B981; animation-delay: 0.9s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50%      { opacity: 1;   transform: scale(1.2); }
}

/* Trunk */
.trunk {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 25px;
  background: linear-gradient(180deg, #78350F 0%, #451A03 100%);
  border-radius: 3px;
  z-index: 0;
}

/* Presents */
.presents {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  font-size: 20px;
}

.present {
  animation: presentBounce 3s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.p1 { animation-delay: 0s; }
.p2 { animation-delay: 0.5s; font-size: 18px; }
.p3 { animation-delay: 1s; }

@keyframes presentBounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}

/* Hide on small screens */
@media (max-width: 640px) {
  .christmas-tree-container {
    width: 100px;
    height: 150px;
  }
}
</style>