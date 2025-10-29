<template>
  <div class="page-container">
    <n-card 
      class="dashboard-card"
      :bordered="true"
    >
      <!-- Transição suave -->
      <transition name="fade" mode="out-in">
        <!-- Esqueleto de carregamento -->
        <div v-if="loading" key="loading" class="loading-content">
          <div class="dashboard-header">
            <n-skeleton height="32px" width="300px" />
            <n-skeleton height="16px" width="200px" style="margin-top: 8px;" />
          </div>

          <n-grid cols="3" x-gap="16" y-gap="16" responsive="screen" style="margin-top: 24px;">
            <n-gi v-for="i in 3" :key="i" span="3 s:1 m:1 l:1">
              <n-card>
                <n-skeleton text style="height: 24px; width: 60%;" />
                <n-skeleton text style="margin-top: 12px; height: 32px; width: 80%;" />
              </n-card>
            </n-gi>
          </n-grid>

          <n-card style="margin-top: 24px;">
            <n-skeleton height="24px" width="200px" style="margin-bottom: 16px;" />
            <n-skeleton text :repeat="4" style="margin-bottom: 8px;" />
          </n-card>
        </div>

        <!-- Conteúdo final -->
        <div v-else key="content" class="dashboard-content">
          <!-- Cabeçalho -->
          <div class="dashboard-header">
            <h1 class="dashboard-title">Bem-vindo ao Projeto Vacinação</h1>
            <p class="dashboard-subtitle">Acompanhe as estatísticas e vacinas dos seus pets</p>
          </div>

          <!-- Alerta de Vacinas Atrasadas -->
          <n-alert
            v-if="overdueVaccines > 0"
            type="warning"
            show-icon
            class="alert-section"
            title="Atenção: Vacinas Atrasadas"
          >
            Existe(m) {{ overdueVaccines }} vacina(s) atrasada(s) que precisa(m) de atenção.
          </n-alert>

          <!-- Estatísticas -->
          <n-grid cols="3" x-gap="16" y-gap="16" responsive="screen" class="stats-grid">
            <n-gi span="3 s:1 m:1 l:1">
              <n-card class="stat-card" :bordered="true">
                <div class="stat-content">
                  <div class="stat-info">
                    <n-statistic label="Total de Pets" :value="totalPets" />
                    <p class="stat-description">Pets cadastrados no sistema</p>
                  </div>
                </div>
              </n-card>
            </n-gi>

            <n-gi span="3 s:1 m:1 l:1">
              <n-card class="stat-card" :bordered="true">
                <div class="stat-content">
                  <div class="stat-info">
                    <n-statistic label="Total de Vacinas" :value="totalVaccines" />
                    <p class="stat-description">Vacinas disponíveis</p>
                  </div>
                </div>
              </n-card>
            </n-gi>

            <n-gi span="3 s:1 m:1 l:1">
              <n-card class="stat-card" :bordered="true">
                <div class="stat-content">
                  <div class="stat-info">
                    <n-statistic label="Vacinas Atrasadas" :value="overdueVaccines" />
                    <p class="stat-description">Precisam de atenção</p>
                  </div>
                </div>
              </n-card>
            </n-gi>
          </n-grid>

          <!-- Lista de Pets com Vacinas Atrasadas -->
          <n-card 
            title="Pets com Vacinas Atrasadas" 
            class="overdue-section"
            :bordered="true"
            v-if="overduePets.length > 0"
          >
            <n-list bordered class="overdue-list">
              <n-list-item v-for="pet in overduePets" :key="pet.id" class="overdue-item">
                <div class="pet-info">
                  <strong class="pet-name">{{ pet.name }}</strong>
                  <span class="vaccine-info">{{ pet.vaccine }}</span>
                  <span class="vaccine-date">{{ formatDate(pet.date) }}</span>
                  <span class="days-late">({{ pet.daysLate }} dias atrasada)</span>
                </div>
                <n-button 
                  size="small" 
                  @click="goToPetDetails(pet.id)"
                  class="view-btn"
                >
                  Ver Detalhes
                </n-button>
              </n-list-item>
            </n-list>
            
            <n-button
              type="primary"
              tertiary
              block
              class="view-all-btn"
              @click="goToPetsPage"
            >
              Ver Todos os Pets
            </n-button>
          </n-card>

          <!-- Estado sem vacinas atrasadas -->
          <n-card 
            v-else
            class="no-overdue-section"
            :bordered="true"
          >
            <n-empty description="Nenhuma vacina atrasada encontrada" size="large">
              <template #extra>
                <n-button type="primary" @click="goToPetsPage">
                  Ver Todos os Pets
                </n-button>
              </template>
            </n-empty>
          </n-card>
        </div>
      </transition>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import axios, { AxiosHeaders } from "axios"
import { useMessage } from "naive-ui"

const message = useMessage()
const router = useRouter()
const totalPets = ref(0)
const totalVaccines = ref(0)
const overdueVaccines = ref(0)
const overduePets = ref<OverduePet[]>([])
const loading = ref(true)

interface VacinaAplicada {
  id: number
  data_aplicacao: string
  vacina_nome: string
  vacina?: { nome: string }
}

interface Pet {
  id: number
  name: string
  pet_vacinas?: VacinaAplicada[]
}

interface OverduePet {
  id: number
  name: string
  vaccine: string
  date: string
  daysLate: number
}

const api = axios.create({ baseURL: "http://localhost:8000/api" })
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders()
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

function calculateDaysLate(vaccineDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = today.getTime() - vaccineDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays - 365 // Dias além de 1 ano
}

async function fetchDashboardData() {
  loading.value = true
  
  try {
    const petsRes = await api.get("/pets")
    const pets: Pet[] = petsRes.data.data || petsRes.data || []
    totalPets.value = pets.length

    const vaccinesRes = await api.get("/vacinas")
    const vaccines = vaccinesRes.data.data || vaccinesRes.data || []
    totalVaccines.value = vaccines.length

    const overdueList: OverduePet[] = []
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    oneYearAgo.setHours(0, 0, 0, 0)


    // Para cada pet, buscar vacinas aplicadas
    for (const pet of pets) {
      try {

        const detailRes = await api.get(`/pets/${pet.id}`)
        const petData = detailRes.data.data || detailRes.data
        
        let vacinasAplicadas: VacinaAplicada[] = []
        
        try {
          const vacinasRes = await api.get(`/pets/${pet.id}/vacinas`)
          vacinasAplicadas = vacinasRes.data.data || vacinasRes.data || []
        } catch (err) {
          vacinasAplicadas = petData.pet_vacinas || petData.petVacinas || []
        }

        // Verificar vacinas atrasadas (aplicadas há mais de 1 ano)
        for (const vac of vacinasAplicadas) {
          if (vac.data_aplicacao) {
            const dataVacina = new Date(vac.data_aplicacao)
            dataVacina.setHours(0, 0, 0, 0)
            
            if (dataVacina <= oneYearAgo) {
              const vaccineName = vac.vacina_nome || vac.vacina?.nome || "Vacina desconhecida"
              const daysLate = calculateDaysLate(dataVacina)
              
              overdueList.push({
                id: pet.id,
                name: pet.name,
                vaccine: vaccineName,
                date: vac.data_aplicacao,
                daysLate: daysLate
              })
              
            }
          } else {
          
          }
        }
      } catch (err) {
        console.error(`Erro ao processar pet ${pet.id}:`, err)
      }
    }

    overdueVaccines.value = overdueList.length
    overduePets.value = overdueList

    if (overduePets.value.length > 0) {
      overduePets.value.forEach(pet => {
      })
    } else {

    }

  } catch (err) {
    message.error("Erro ao carregar dados do dashboard")
  } finally {
    loading.value = false
  }
}

function goToPetsPage() {
  router.push("/pets")
}

function goToPetDetails(petId: number) {
  router.push(`/pets/${petId}`)
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
/* Container da página */
.page-container {
  padding: 20px;
  box-sizing: border-box;
}

/* Container principal */
.dashboard-card {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

/* Cabeçalho */
.dashboard-header {
  margin-bottom: 24px;
  text-align: center;
}

.dashboard-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.dashboard-subtitle {
  margin: 8px 0 0 0;
  color: #6b7280;
  font-size: 16px;
}

/* Alerta */
.alert-section {
  margin: 16px 0 24px 0;
  border-radius: 8px;
}

/* Grid de estatísticas */
.stats-grid {
  margin: 24px 0;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-info {
  flex: 1;
}

.stat-description {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 12px;
}

/* Seção de vacinas atrasadas */
.overdue-section {
  margin-top: 24px;
  border-radius: 12px;
}

.overdue-list {
  border-radius: 8px;
  overflow: hidden;
}

.overdue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.pet-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.pet-name {
  font-size: 16px;
  color: #1f2937;
}

.vaccine-info {
  font-size: 14px;
  color: #6b7280;
}

.vaccine-date {
  font-size: 12px;
  color: #9ca3af;
}

.view-btn {
  flex-shrink: 0;
}

.view-all-btn {
  margin-top: 16px;
  border-radius: 6px;
}

/* Seção sem vacinas atrasadas */
.no-overdue-section {
  margin-top: 24px;
  border-radius: 12px;
  text-align: center;
  padding: 40px 0;
}

/* Loading */
.loading-content {
  padding: 20px 0;
}

/* Transição de fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* RESPONSIVIDADE MOBILE */
@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }
  
  .dashboard-card {
    border-radius: 8px;
  }
  
  .dashboard-title {
    font-size: 24px;
  }
  
  .dashboard-subtitle {
    font-size: 14px;
  }
  
  .stat-content {
    text-align: center;
  }
  
  .overdue-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .view-btn {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 8px;
  }
  
  .dashboard-card {
    border-radius: 6px;
  }
  
  .dashboard-title {
    font-size: 20px;
  }
}

/* Para telas muito pequenas */
@media (max-width: 320px) {
  .page-container {
    padding: 4px;
  }
  
}
</style>