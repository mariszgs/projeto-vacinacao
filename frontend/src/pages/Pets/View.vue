<template>
  <n-card 
    title="Detalhes do Pet"
    class="pet-detail-card"
    :bordered="true"
  >
    <!-- Transição suave -->
    <transition name="fade" mode="out-in">
      <div v-if="pet" key="content">
        <!-- Informações do Pet -->
        <div class="pet-header">
          
          <div class="pet-info">
            <h2 class="pet-name">{{ pet.name }}</h2>
            <p class="pet-species">{{ pet.species }}</p>
          </div>
        </div>

        <n-divider class="custom-divider" />

        <!-- Informações básicas -->
        <div class="basic-info">
          <div class="info-item">
            <span class="info-label">Nome</span>
            <span class="info-value">{{ pet.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Espécie</span>
            <span class="info-value">{{ pet.species }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Data de Nascimento</span>
            <span class="info-value">{{ formatDateBR(pet.birthdate) }}</span>
          </div>
        </div>

        <!-- Vacinas Aplicadas -->
        <div class="vaccines-section">
          <h3 class="section-title">Vacinas Aplicadas</h3>
          <div class="vaccines-list" v-if="vacinasAplicadas.length">
            <n-card
              v-for="vacina in vacinasAplicadas"
              :key="vacina.id"
              class="vaccine-card"
            >
              <div class="vaccine-content">
                <div class="vaccine-info">
                  <span class="vaccine-name">{{ vacina.vacina.nome }}</span>
                  <span class="vaccine-date">{{ formatDateBR(vacina.data_aplicacao) }}</span>
                </div>
                <n-tag 
                  :type="isVacinaAtrasada(vacina) ? 'error' : 'success'"
                  size="small"
                  class="status-tag"
                >
                  {{ isVacinaAtrasada(vacina) ? 'Atrasada' : 'Em Dia' }}
                </n-tag>
              </div>
              <div v-if="vacina.data_proxima_dose" class="next-dose">
                <span class="next-dose-label">Próxima dose:</span>
                <span class="next-dose-date">{{ formatDateBR(vacina.data_proxima_dose) }}</span>
              </div>
            </n-card>
          </div>
          <n-empty v-else description="Nenhuma vacina aplicada" class="empty-state">
            <template #extra>
              <n-button size="small" @click="goToSchedule(pet.id)">
                Agendar Vacinação
              </n-button>
            </template>
          </n-empty>
        </div>

        <!-- Vacinas Agendadas -->
        <div class="vaccines-section">
          <h3 class="section-title">Vacinas Agendadas</h3>
          <div class="vaccines-list" v-if="paginatedVacinasAgendadas.length">
            <n-card
              v-for="vacina in paginatedVacinasAgendadas"
              :key="vacina.id"
              class="vaccine-card"
            >
              <div class="vaccine-content">
                <div class="vaccine-info">
                  <span class="vaccine-name">{{ vacina.vacina.nome }}</span>
                  <span class="vaccine-date">{{ formatDateBR(vacina.data_agendada) }}</span>
                </div>
                <n-tag type="info" size="small" class="status-tag">
                  Agendada
                </n-tag>
              </div>
            </n-card>
          </div>
          <n-empty v-else description="Nenhuma vacina agendada" class="empty-state">
            <template #extra>
              <n-button size="small" @click="goToSchedule(pet.id)">
                Agendar Vacinação
              </n-button>
            </template>
          </n-empty>

          <!-- Paginação -->
          <div v-if="totalPages > 1" class="pagination">
            <n-button
              size="small"
              :disabled="currentPage === 1"
              @click="currentPage--"
              class="page-btn"
            >
              Anterior
            </n-button>
            <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
            <n-button
              size="small"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              class="page-btn"
            >
              Próxima
            </n-button>
          </div>
        </div>

        <!-- Botões de ação -->
        <div class="action-buttons">
          <n-button @click="goToEdit(pet.id)" type="primary" class="action-btn">
            Editar Pet
          </n-button>
          <n-button @click="goToSchedule(pet.id)" type="primary" class="action-btn">
            Agendar Vacinação
          </n-button>
          <n-button @click="goBack" class="action-btn">
            Voltar
          </n-button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else key="loading" class="loading-container">
        <n-skeleton height="32px" width="200px" style="margin-bottom: 20px;" />
        <n-skeleton height="20px" :repeat="3" style="margin-bottom: 8px;" />
      </div>
    </transition>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useMessage, NTag, NEmpty } from 'naive-ui'

const message = useMessage()
const route = useRoute()
const router = useRouter()

interface Vacina {
  id: number
  nome: string
}

interface VacinaAplicada {
  id: number
  vacina: Vacina
  data_aplicacao: string
  data_proxima_dose?: string | null
}

interface VacinaAgendada {
  id: number
  vacina: Vacina
  data_agendada: string
}

interface Pet {
  id: number
  name: string
  species: string
  birthdate: string
  vacinas_aplicadas: VacinaAplicada[]
  vacinas_agendadas?: VacinaAgendada[]
}

const pet = ref<Pet | null>(null)
const vacinasAplicadas = ref<VacinaAplicada[]>([])
const vacinasAgendadas = ref<VacinaAgendada[]>([])
const loading = ref(true)

const currentPage = ref(1)
const perPage = ref(5)

// Paginação local
const totalPages = computed(() => Math.ceil(vacinasAgendadas.value.length / perPage.value))
const paginatedVacinasAgendadas = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return vacinasAgendadas.value.slice(start, start + perPage.value)
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Buscar dados do pet
async function fetchPet() {
  try {
    const petId = Number(route.params.id)
    const token = localStorage.getItem('token') || ''
    const response = await axios.get(`http://127.0.0.1:8000/api/pets/${petId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = response.data

    pet.value = {
      ...data,
      vacinas_aplicadas: data.vacinas_aplicadas || [],
      vacinas_agendadas: data.vacinas_agendadas || data.agendamentos || []
    }

    vacinasAplicadas.value = pet.value?.vacinas_aplicadas ?? []
    vacinasAgendadas.value = pet.value?.vacinas_agendadas ?? []

    // Resetar página se necessário
    currentPage.value = 1

  } catch (error) {
    console.error('Erro ao buscar pet:', error)
    message.error('Erro ao carregar dados do pet.')
  } finally {
    setTimeout(() => (loading.value = false), 300)
  }
}

// Verifica se a vacina está atrasada
function isVacinaAtrasada(vacina: VacinaAplicada): boolean {
  if (!vacina.data_aplicacao) return false

  const dataAplicacao = new Date(vacina.data_aplicacao).setHours(0, 0, 0, 0)
  const umAnoAtras = new Date()
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)
  umAnoAtras.setHours(0, 0, 0, 0)

  return dataAplicacao <= umAnoAtras.getTime()
}

// Formatar data
function formatDateBR(dateStr: string): string {
  if (!dateStr) return 'Não informada'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

function goBack() {
  router.back()
}

function goToEdit(petId: number) {
  router.push(`/pets/edit/${petId}`)
}

function goToSchedule(petId: number) {
  router.push(`/schedule/${petId}`)
}

onMounted(fetchPet)
</script>

<style scoped>
/* Container da página - APENAS ESPAÇAMENTO */
.page-container {
  padding: 20px;
  box-sizing: border-box;
}

/* Container principal - APENAS O CONTEÚDO */
.pet-detail-card {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
  /* Sem height fixo - altura automática pelo conteúdo */
}

.loading-container {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Cabeçalho do pet */
.pet-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.pet-info {
  flex: 1;
}

.pet-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.pet-species {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.custom-divider {
  margin: 20px 0;
}

/* Informações básicas */
.basic-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

/* Seções de vacinas */
.vaccines-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.vaccines-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vaccine-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.vaccine-content {
  display: flex;
  justify-content: between;
  align-items: center;
  gap: 12px;
}

.vaccine-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vaccine-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.vaccine-date {
  color: #6b7280;
  font-size: 12px;
}

.status-tag {
  flex-shrink: 0;
}

.next-dose {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.next-dose-label {
  font-size: 12px;
  color: #6b7280;
}

.next-dose-date {
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
}

.empty-state {
  margin: 20px 0;
}

/* Paginação */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding: 16px 0;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.page-btn {
  min-width: 80px;
}

/* Botões de ação */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  min-width: 120px;
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
  
  .pet-detail-card {
    border-radius: 8px;
  }
  
  .pet-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .basic-info {
    gap: 12px;
  }
  
  .info-label {
    font-size: 11px;
  }
  
  .info-value {
    font-size: 13px;
  }
  
  .vaccine-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .status-tag {
    align-self: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .page-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 8px;
  }
  
  .pet-detail-card {
    border-radius: 6px;
  }
  
  .pet-name {
    font-size: 20px;
  }
  
  .info-label {
    font-size: 10px;
  }
  
  .info-value {
    font-size: 12px;
  }
  
  .section-title {
    font-size: 16px;
  }
}

/* Para telas muito pequenas */
@media (max-width: 320px) {
  .page-container {
    padding: 4px;
  }
  
  .pet-name {
    font-size: 18px;
  }
}
</style>