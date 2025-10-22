<template>
  <n-layout has-sider>
    <!-- Sidebar (visível só no desktop) -->
    <n-layout-sider
      v-if="!isMobile"
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
        class="sidebar-menu"
      />
    </n-layout-sider>

    <!-- Drawer (para mobile) -->
    <n-drawer 
      v-model:show="showDrawer" 
      placement="left" 
      :width="280"
      class="mobile-drawer"
    >
      <n-drawer-content title="Menu" :native-scrollbar="false">
        <n-menu 
          :options="menuOptions" 
          @update:value="handleSelect"
          class="mobile-menu"
        />
      </n-drawer-content>
    </n-drawer>

    <!-- Conteúdo principal -->
    <n-layout>
      <n-layout-header bordered class="header">
        <!-- Botão hamburguer no mobile -->
        <div class="header-left">
          <n-button
            v-if="isMobile"
            text
            @click="showDrawer = true"
            class="menu-button"
            aria-label="Abrir menu"
          >
            <n-icon size="28">
              <menu-outline />
            </n-icon>
          </n-button>
          
        </div>

        <!-- Espaço para outros elementos do header -->
        <div class="header-right">
          <!-- Adicione outros elementos do header aqui -->
        </div>
      </n-layout-header>

      <n-layout-content class="content">
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
  MedicalOutline,
  MenuOutline
} from '@vicons/ionicons5'

const router = useRouter()
const isCollapsed = ref(false)
const showDrawer = ref(false)

// Detecta se é mobile com breakpoint mais realista
const screenWidth = ref(window.innerWidth)
const isMobile = computed(() => screenWidth.value < 1024) // Tablet também como mobile

function handleResize() {
  screenWidth.value = window.innerWidth
  if (!isMobile.value) {
    showDrawer.value = false // fecha o drawer ao mudar pra desktop
  }
}

// Fechar drawer ao navegar (melhor UX)
function handleSelect(key: string) {
  if (isMobile.value) {
    showDrawer.value = false
  }
  
  // Pequeno delay para melhor feedback visual
  setTimeout(() => {
    if (key === 'home') router.push('/home')
    else if (key === 'pets') router.push('/pets')
    else if (key === 'profile') router.push('/profile')
    else if (key === 'vaccines') router.push('/vaccines')
    else if (key === 'logout') {
      // Adicionar confirmação para logout
      if (confirm('Deseja realmente sair?')) {
        router.push('/')
      }
    }
  }, 150)
}

// Fechar drawer com ESC key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && showDrawer.value) {
    showDrawer.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
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
</script>

<style scoped>
.header {
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  background: var(--n-color);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-button {
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.menu-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--n-text-color);
}

.content {
  padding: 16px;
  min-height: calc(100vh - 64px);
}

:deep(.sidebar-menu .n-menu-item) {
  padding-left: 16px !important;
  margin: 4px 8px;
}

:deep(.sidebar-menu .n-menu-item-content) {
  justify-content: flex-start !important;
  padding-left: 0 !important;
}

:deep(.sidebar-menu .n-menu-item-content__icon) {
  margin-right: 12px;
  margin-left: 0;
}

:deep(.sidebar-menu .n-menu-item-content__text) {
  margin-left: 0;
}

:deep(.mobile-menu .n-menu-item) {
  padding-left: 20px !important;
  margin: 4px 8px;
}

:deep(.mobile-menu .n-menu-item-content) {
  justify-content: flex-start !important;
  padding-left: 0 !important;
}

:deep(.mobile-menu .n-menu-item-content__icon) {
  margin-right: 16px;
  margin-left: 0;
}

:deep(.mobile-menu .n-menu-item-content__text) {
  margin-left: 0;
  font-size: 16px;
}

/* Melhorias para o drawer mobile */
:deep(.mobile-drawer .n-drawer-content) {
  border-radius: 0 16px 16px 0;
}

:deep(.mobile-drawer .n-drawer-header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--n-divider-color);
}

:deep(.mobile-drawer .n-menu-item) {
  border-radius: 8px;
}

:deep(.mobile-drawer .n-menu-item--selected) {
  background-color: var(--n-color-primary);
  color: white;
}

/* Melhorar toque para mobile */
:deep(.n-menu-item) {
  min-height: 48px;
}

/* Animações suaves */
:deep(.n-drawer) {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Overlay mais escuro para melhor contraste */
:deep(.n-drawer-mask) {
  background-color: rgba(0, 0, 0, 0.5);
}

/* REMOVER ESPAÇAMENTOS EXCESSIVOS DO NAIVE UI */
:deep(.n-menu) {
  padding: 8px 0;
}

:deep(.n-menu-item-content) {
  padding: 0 !important;
}

:deep(.n-menu-item-content__icon) {
  min-width: 24px;
}

@media (max-width: 480px) {
  .header {
    padding: 0 12px;
  }
  
  .content {
    padding: 12px;
  }
  
  :deep(.mobile-drawer) {
    width: 100vw !important;
    max-width: 300px;
  }
  
  :deep(.mobile-menu .n-menu-item) {
    padding-left: 16px !important;
  }
}
</style>