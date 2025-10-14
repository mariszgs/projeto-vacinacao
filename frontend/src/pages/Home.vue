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
    <n-grid cols="3" x-gap="12" y-gap="12" responsive="screen" style="margin-top: 16px;">
      <n-gi span="3 s:1 m:1 l:1">
        <n-card title="Total de Pets" bordered>
          <n-statistic :value="totalPets" />
        </n-card>
      </n-gi>

      <n-gi span="3 s:1 m:1 l:1">
        <n-card title="Total de Vacinas" bordered>
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
          <strong>{{ pet.name }}</strong>
        </n-list-item>
      </n-list>
      <n-button type="primary" tertiary block style="margin-top: 12px;" @click="goToPetsPage">
        Ver todos os pets
      </n-button>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import axios, { AxiosHeaders } from "axios"

// Tipagens
interface Vacina {
  data_aplicacao: string
  data_agendada?: string
  vacina: { nome: string }
}

interface Pet {
  id: number
  name: string
  vacinas_aplicadas?: Vacina[]
}

interface OverduePet {
  id: number
  name: string
  vaccine: string
  date: string
}

const router = useRouter()

// Estatísticas
const totalPets = ref<number>(0)
const totalVaccines = ref<number>(0)
const overdueVaccines = ref<number>(0)
const overduePets = ref<OverduePet[]>([])

// Configuração do axios com token
const api = axios.create({ baseURL: "http://localhost:8000/api" })
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders()
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

// Função para buscar dados do dashboard
async function fetchDashboardData() {
  try {
    // 1️⃣ Buscar todos os pets
    const petsRes = await api.get("/pets")
    const pets: Pet[] = Array.isArray(petsRes.data.items) ? petsRes.data.items : []
    totalPets.value = pets.length

    // 2️⃣ Buscar vacinas de cada pet individualmente
    const allVaccines: Vacina[] = []
    const overdueList: OverduePet[] = []

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    oneYearAgo.setHours(0, 0, 0, 0)

    for (const pet of pets) {
      try {
        const detailRes = await api.get(`/pets/${pet.id}`)
        const petData = detailRes.data
        const vacinas = petData.vacinas_aplicadas || []

        allVaccines.push(...vacinas)

        // Verifica vacinas atrasadas (data_aplicacao OU data_agendada)
        for (const vac of vacinas) {
          const dataVacina = new Date(vac.data_agendada || vac.data_aplicacao)
          dataVacina.setHours(0, 0, 0, 0)

          if (dataVacina <= oneYearAgo) {
            overdueList.push({
              id: pet.id,
              name: pet.name,
              vaccine: vac.vacina?.nome || "Vacina desconhecida",
              date: vac.data_agendada || vac.data_aplicacao
            })
          }
        }
      } catch (err) {
        console.warn(`Erro ao buscar vacinas do pet ${pet.id}:`, err)
      }
    }

    // 3️⃣ Totais
    totalVaccines.value = allVaccines.length
    overdueVaccines.value = overdueList.length
    overduePets.value = overdueList
  } catch (err) {
    console.error("Erro ao carregar dashboard:", err)
  }
}

function goToPetsPage() {
  router.push("/pets")
}

onMounted(fetchDashboardData)
</script>
