<template>
  <div>
    <h1>Bem-vindo ao Projeto Vacinação</h1>

    <!-- Alerta de Vacinas Atrasadas -->
    <n-alert
      v-if="overdueVaccines > 0"
      type="warning"
      show-icon
      style="margin-top: 16px;"
      title="Existem pets com vacinas atrasadas. Verifique a lista abaixo."
    />

    <!-- Estatísticas rápidas -->
    <n-grid
      cols="3"
      x-gap="12"
      y-gap="12"
      responsive="screen"
      style="margin-top: 16px;"
    >
      <n-gi span="3 s:1 m:1 l:1">
        <n-card title="Total de Pets" bordered>
          <n-statistic :value="totalPets" />
        </n-card>
      </n-gi>

      <n-gi span="3 s:1 m:1 l:1">
        <n-card title="Vacinas Aplicadas" bordered>
          <n-statistic :value="totalVaccines" />
        </n-card>
      </n-gi>

      <n-gi span="3 s:1 m:1 l:1">
        <n-card title="Vacinas Atrasadas" bordered>
          <n-statistic :value="overdueVaccines" />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Lista de pets com vacinas atrasadas -->
    <n-card title="Pets com Vacinas Atrasadas" style="margin-top: 16px;">
      <n-list bordered>
        <n-list-item v-for="pet in overduePets" :key="pet.id">
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span><strong>{{ pet.name }}</strong></span>
            <span style="color: red;">{{ pet.vaccine }} - {{ pet.date }}</span>
          </div>
        </n-list-item>
      </n-list>
      <n-button
        type="primary"
        tertiary
        block
        style="margin-top: 12px;"
        @click="goToPetsPage"
      >
        Ver todos os pets
      </n-button>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

// Dados simulados
const totalPets = ref(120)
const totalVaccines = ref(350)
const overdueVaccines = ref(3)

const overduePets = ref([
  { id: 1, name: "Rex", vaccine: "Antirrábica", date: "05/09/2025" },
  { id: 2, name: "Luna", vaccine: "V8", date: "10/09/2025" },
  { id: 3, name: "Thor", vaccine: "Giárdia", date: "15/09/2025" }
])

const router = useRouter()

const goToPetsPage = () => {
  router.push("/pets")
}
</script>
