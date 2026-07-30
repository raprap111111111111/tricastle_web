<template>
  <div class="bg-white p-8 rounded-2xl shadow-medium border border-appleCore-100">
    <h2 class="text-2xl font-serif font-semibold text-blueberry-800 mb-1">Forgot Password</h2>
    <p class="text-blueberry-500 mb-6">We'll send you a reset link</p>
    <p class="text-blueberry-500 text-sm">Password recovery coming soon.</p>
    <p class="text-center text-sm text-blueberry-500 mt-6">
      Remember your password?
      <RouterLink to="/auth/login" class="text-apricot-500 font-medium">Sign In</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>