<template>
  <n-layout has-sider>
    <n-layout-sider bordered width="200">
      <n-menu :options="menuOptions" @update:value="handleSelect" />
    </n-layout-sider>
    <n-layout>
      <n-layout-header bordered style="padding: 0 16px;">
        <h2>Projeto Vacinação</h2>
      </n-layout-header>
      <n-layout-content style="padding: 16px;">
        <router-view /> <!-- Aqui entram as páginas -->
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { useRouter } from 'vue-router';
import { NIcon } from 'naive-ui';
import { HomeOutline, PawOutline } from '@vicons/ionicons5';

const router = useRouter();

const menuOptions = [
  {
    label: 'Home',
    key: 'home',
    icon: () => h(NIcon, null, { default: () => h(HomeOutline) })
  },
  {
    label: 'Pets',
    key: 'pets',
    icon: () => h(NIcon, null, { default: () => h(PawOutline) })
  }
];

function handleSelect(key: string) {
  if (key === 'home') router.push('/');
  if (key === 'pets') router.push('/pets');
}
</script>
