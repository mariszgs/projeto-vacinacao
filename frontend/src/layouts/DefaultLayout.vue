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
import { HomeOutline, PawOutline, LogOutOutline, PersonCircleOutline, MedicalOutline } from '@vicons/ionicons5';  // Ícone de vacinas

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
    label: 'Perfil',
    key: 'profile',
    icon: () => h(NIcon, null, { default: () => h(PersonCircleOutline) }) // Ícone de perfil
  },
  {
    label: 'Vacinas',  // Nova opção "Vacinas"
    key: 'vaccines',
    icon: () => h(NIcon, null, { default: () => h(MedicalOutline) }) // Ícone de vacinas
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
  else if (key === 'profile') router.push('/profile'); // Redireciona para a página de perfil
  else if (key === 'vaccines') router.push('/vaccines');  // Redireciona para a página de vacinas
  else if (key === 'logout') {
    // Aqui você pode adicionar qualquer lógica de logout, ex: limpar token, estado, etc
    router.push('/'); // redireciona para login
  }
}
</script>

