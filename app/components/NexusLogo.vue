<template>
  <div
    class="relative flex items-center justify-center transition-transform duration-300 hover:scale-105"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="w-full h-full drop-shadow-[0_0_8px_rgba(99,102,241,0.2)] dark:drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]"
    >
      <defs>
        <!-- Primary gradient for the left/middle link -->
        <linearGradient id="nexusGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
        <!-- Secondary gradient for the right/middle link -->
        <linearGradient id="nexusGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ec4899" />
          <stop offset="50%" stop-color="#d946ef" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
        <!-- Glowing gradient for nodes -->
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Connection/Network background grid pattern (subtle) -->
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="currentColor"
        class="text-slate-100 dark:text-slate-800"
        stroke-width="1"
        stroke-dasharray="3 3"
        opacity="0.3"
      />
      <circle
        cx="50"
        cy="50"
        r="26"
        stroke="currentColor"
        class="text-slate-100 dark:text-slate-800"
        stroke-width="1"
        stroke-dasharray="2 2"
        opacity="0.3"
      />

      <!-- Interconnected paths forming stylized N and X -->
      <!-- Left pillar of N -->
      <path
        d="M28 25 C28 25, 28 75, 28 75"
        stroke="url(#nexusGradLeft)"
        stroke-width="10"
        stroke-linecap="round"
        class="path-draw"
      />
      <!-- Diagonal connecting bridge -->
      <path
        d="M28 25 Q50 50, 72 75"
        stroke="url(#nexusGradLeft)"
        stroke-width="10"
        stroke-linecap="round"
        class="path-draw"
        style="animation-delay: 0.2s"
      />
      <!-- Right pillar of N/X cross line -->
      <path
        d="M72 25 Q50 50, 28 75"
        stroke="url(#nexusGradRight)"
        stroke-width="10"
        stroke-linecap="round"
        class="path-draw"
        style="animation-delay: 0.4s"
      />
      <!-- Right pillar straight up -->
      <path
        d="M72 75 V25"
        stroke="url(#nexusGradRight)"
        stroke-width="10"
        stroke-linecap="round"
        class="path-draw"
        style="animation-delay: 0.6s"
      />

      <!-- Node intersections (glowing connection dots) -->
      <!-- Top Left Node -->
      <circle cx="28" cy="25" r="5" fill="#ffffff" class="pulse-node" />
      <circle cx="28" cy="25" r="8" fill="url(#nodeGlow)" opacity="0.6" />

      <!-- Center Conjunction -->
      <circle
        cx="50"
        cy="50"
        r="6"
        fill="#8b5cf6"
        class="pulse-node"
        style="animation-delay: 0.5s"
      />
      <circle cx="50" cy="50" r="10" fill="url(#nodeGlow)" opacity="0.8" />

      <!-- Bottom Right Node -->
      <circle
        cx="72"
        cy="75"
        r="5"
        fill="#ffffff"
        class="pulse-node"
        style="animation-delay: 0.8s"
      />
      <circle cx="72" cy="75" r="8" fill="url(#nodeGlow)" opacity="0.6" />

      <!-- Top Right Node -->
      <circle
        cx="72"
        cy="25"
        r="5"
        fill="#ffffff"
        class="pulse-node"
        style="animation-delay: 0.3s"
      />
      <circle cx="72" cy="25" r="8" fill="url(#nodeGlow)" opacity="0.6" />

      <!-- Bottom Left Node -->
      <circle
        cx="28"
        cy="75"
        r="5"
        fill="#ffffff"
        class="pulse-node"
        style="animation-delay: 0.7s"
      />
      <circle cx="28" cy="75" r="8" fill="url(#nodeGlow)" opacity="0.6" />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: number;
}

withDefaults(defineProps<Props>(), {
  size: 40,
});
</script>

<style scoped>
@keyframes pathDraw {
  from {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
  }
  to {
    stroke-dasharray: 200;
    stroke-dashoffset: 0;
  }
}

@keyframes pulseNode {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
    filter: drop-shadow(0 0 4px #8b5cf6);
  }
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
}

.path-draw {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: pathDraw 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.pulse-node {
  transform-origin: center;
  animation: pulseNode 3s infinite ease-in-out;
}
</style>
