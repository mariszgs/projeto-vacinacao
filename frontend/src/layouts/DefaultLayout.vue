<template>
  <n-layout has-sider>
    <!-- Sidebar -->
    <n-layout-sider
      bordered
      :collapsed="isCollapsed"
      :collapsed-width="64"
      width="200"
      :show-trigger="!isMobile"
      collapse-mode="width"
      @collapse="isCollapsed = true"
      @expand="isCollapsed = false"
    >
      <n-menu
        :options="menuOptions"
        :collapsed="isCollapsed"
        @update:value="handleSelect"
      />
    </n-layout-sider>

    <!-- Conteúdo principal -->
    <n-layout>
      <n-layout-header bordered style="padding: 0 16px;">
        <h2 style="font-size: 18px; margin: 12px 0;">Projeto Vacinação</h2>
      </n-layout-header>
      <n-layout-content style="padding: 16px;">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { h, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import {
  HomeOutline,
  PawOutline,
  LogOutOutline,
  PersonCircleOutline,
  MedicalOutline
} from '@vicons/ionicons5'

const router = useRouter()
const isCollapsed = ref(false)

// Detecta se é mobile com reactive
const screenWidth = ref(window.innerWidth)
const isMobile = computed(() => screenWidth.value <= 768)

// Ajusta isCollapsed conforme dispositivo
function handleResize() {
  screenWidth.value = window.innerWidth
  if (isMobile.value) {
    isCollapsed.value = true // sempre colapsado no mobile
  } else {
    isCollapsed.value = false // desktop começa expandido
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // inicializa
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

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
    icon: () => h(NIcon, null, { default: () => h(PersonCircleOutline) })
  },
  {
    label: 'Vacinas',
    key: 'vaccines',
    icon: () => h(NIcon, null, { default: () => h(MedicalOutline) })
  },
  {
    label: 'Sair',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) })
  }
]

function handleSelect(key: string) {
  if (key === 'home') router.push('/home')
  else if (key === 'pets') router.push('/pets')
  else if (key === 'profile') router.push('/profile')
  else if (key === 'vaccines') router.push('/vaccines')
  else if (key === 'logout') router.push('/')
}
</script>
