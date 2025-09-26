<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NConfigProvider } from 'naive-ui'
</script>

<template>
  <n-config-provider>
  <n-message-provider>
    <RouterView />
  </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
/* estilos globais leves */
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}
</style>
