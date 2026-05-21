<template>
  <div class="login-page">
    <LoginForm />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false, // Use no layout for login page
});
</script>

<style scoped>
.login-page {
  width: 100%;
  min-height: 100vh;
}
</style>
