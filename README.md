# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).


cd ~/Desktop/tricastle_web && \
rm -rf node_modules package-lock.json && \
npm install && \
npm install pinia pinia-plugin-persistedstate vue-router axios @vueuse/core primevue@^4.3.0 @primevue/themes@^4.3.0 primeicons vee-validate @vee-validate/zod zod && \
npm install -D tailwindcss@3 postcss autoprefixer @types/node