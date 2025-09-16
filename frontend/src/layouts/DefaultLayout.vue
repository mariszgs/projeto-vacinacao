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
import { HomeOutline, PawOutline, LogOutOutline } from '@vicons/ionicons5';

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
  },
  {
    label: 'Sair',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) })
  }
];

function handleSelect(key: string) {
  if (key === 'home') router.push('/home');
  else if (key === 'pets') router.push('/pets');
  else if (key === 'logout') {
    // Aqui você pode adicionar qualquer lógica de logout, ex: limpar token, estado, etc
    router.push('/'); // redireciona para login
  }
}
</script>
