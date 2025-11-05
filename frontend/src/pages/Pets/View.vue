<template>
  <div class="page-container">
    <n-card 
      title="Detalhes do Pet"
      class="pet-detail-card"
      :bordered="true"
    >
      <!-- Transição suave -->
      <transition name="fade" mode="out-in">
        <div v-if="pet && !loading" key="content">
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
              <span class="info-value">{{ pet.species || 'Não informada' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Data de Nascimento</span>
              <span class="info-value">{{ formatDateBR(pet.birthdate) }}</span>
            </div>
          </div>

          <!-- Vacinas Aplicadas -->
          <div class="vaccines-section">
            <div class="section-header">
              <h3 class="section-title">Vacinas Aplicadas</h3>
            </div>
            <div class="vaccines-list" v-if="vacinasComNome.length">
              <n-card
              v-for="petVacina in vacinasComNome"
              :key="petVacina.id"
              class="vaccine-card"
              >
                <div class="vaccine-content">
                  <div class="vaccine-info">
                    <span class="vaccine-name">{{ petVacina.nomeExibicao }}</span>
                    <span class="vaccine-date">{{ formatDateBR(petVacina.data_aplicacao) }}</span>
                  </div>
                  <div class="vaccine-actions">
                    <n-tag 
                      :type="isVacinaAtrasada(petVacina) ? 'error' : 'success'"
                      size="small"
                      class="status-tag"
                    >
                      {{ isVacinaAtrasada(petVacina) ? 'Atrasada' : 'Em Dia' }}
                    </n-tag>
                 
                  </div>
                </div>
                <div v-if="petVacina.data_proxima_dose" class="next-dose">
                  <span class="next-dose-label">Próxima dose:</span>
                  <span class="next-dose-date">{{ formatDateBR(petVacina.data_proxima_dose) }}</span>
                </div>
              </n-card>
            </div>
            <n-empty v-else description="Nenhuma vacina aplicada" class="empty-state">
              <template #extra>
                <n-button size="small" @click="showApplyVaccineModal = true">
                  Aplicar Primeira Vacina
                </n-button>
              </template>
            </n-empty>
          </div>

          <!-- Vacinas Agendadas -->
          <div class="vaccines-section">
            <div class="section-header">
              <h3 class="section-title">Vacinas Agendadas</h3>
            </div>
            <div class="vaccines-list" v-if="filteredAgendamentos.length">
              <n-card
                v-for="agendamento in filteredAgendamentos"
                :key="agendamento.id"
                class="vaccine-card"
              >
                <div class="vaccine-content">
                  <div class="vaccine-info">
                    <span class="vaccine-name">{{ agendamento.vacina?.nome || 'Vacina' }}</span>
                    <span class="vaccine-date">{{ formatDateBR(agendamento.data_agendada) }}</span>
                    <span class="vaccine-status" :class="`status-${agendamento.status}`">
                      {{ getStatusText(agendamento.status) }}
                    </span>
                  </div>
                  <n-tag 
                    :type="getStatusTagType(agendamento.status)"
                    size="small" 
                    class="status-tag"
                  >
                    {{ getStatusText(agendamento.status) }}
                  </n-tag>
                </div>
                <div v-if="agendamento.observacoes" class="observacoes">
                  <span class="observacoes-label">Observações:</span>
                  <span class="observacoes-text">{{ agendamento.observacoes }}</span>
                </div>
              </n-card>
            </div>
            <n-empty v-else description="Nenhuma vacina agendada" class="empty-state">
              <template #extra>
                <n-button size="small" @click="goToSchedule(pet.id)">
                  Fazer Primeiro Agendamento
                </n-button>
              </template>
            </n-empty>
          </div>

          <!-- Botões de ação -->
          <div class="action-buttons">
            <n-button @click="goToEdit(pet.id)" type="primary" class="action-btn">
              Editar Pet
            </n-button>
            <n-button @click="goBack" class="action-btn">
              Voltar
            </n-button>
          </div>
        </div>

        <!-- Loading state -->
        <div v-else-if="loading" key="loading" class="loading-container">
          <n-skeleton height="32px" width="200px" style="margin-bottom: 20px;" />
          <n-skeleton height="20px" :repeat="3" style="margin-bottom: 8px;" />
        </div>

        <!-- Error state -->
        <div v-else key="error" class="empty-state">
          <n-empty description="Pet não encontrado">
            <template #extra>
              <n-button size="small" @click="goBack">
                Voltar
              </n-button>
            </template>
          </n-empty>
        </div>
      </transition>
    </n-card>

    <!-- Modal para aplicar vacina -->
    <n-modal v-model:show="showApplyVaccineModal">
      <n-card
        style="width: 500px"
        title="Aplicar Vacina"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-form
          ref="vaccineFormRef"
          :model="vaccineForm"
          :rules="vaccineRules"
          label-placement="top"
        >
          <n-form-item label="Vacina" path="vacina_id">
            <n-select
              v-model:value="vaccineForm.vacina_id"
              placeholder="Selecione a vacina"
              :options="vacinasOptions"
              :loading="loadingVacinas"
            />
          </n-form-item>
          
          <n-form-item label="Data de Aplicação" path="data_aplicacao">
            <n-date-picker
              v-model:value="vaccineForm.data_aplicacao"
              type="date"
              placeholder="Selecione a data"
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item label="Próxima Dose (Opcional)" path="data_proxima_dose">
            <n-date-picker
              v-model:value="vaccineForm.data_proxima_dose"
              type="date"
              placeholder="Selecione a data da próxima dose"
              style="width: 100%"
            />
          </n-form-item>
        </n-form>

        <template #footer>
          <div style="display: flex; justify-content: flex-end; gap: 8px">
            <n-button @click="showApplyVaccineModal = false">
              Cancelar
            </n-button>
            <n-button 
              type="primary" 
              @click="applyVaccine"
              :loading="applyingVaccine"
            >
              Aplicar Vacina
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios, { AxiosHeaders } from 'axios'
import { useMessage, NTag, NEmpty, type FormInst, type FormRules } from 'naive-ui'

const message = useMessage()
const route = useRoute()
const router = useRouter()

interface Vacina {
  id: number
  nome: string
  descricao?: string
  lote?: string
  validadedata?: string
}

interface PetVacina {
  id: number
  vacina_id: number
  vacina?: Vacina
  data_aplicacao: string
  data_proxima_dose?: string | null
  pet_id: number
  // Campos alternativos que podem vir do backend
  vacina_nome?: string
  nome?: string
}

interface Agendamento {
  id: number
  pet: { id: number }
  vacina: { id: number; nome: string }
  data_agendada: string
  status: 'pendente' | 'concluido' | 'cancelado' | 'realizado'
  observacoes?: string
}

interface Pet {
  id: number
  name: string
  species: string
  breed?: string
  birthdate: string
  user_id: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

const pet = ref<Pet | null>(null)
const loading = ref(true)
const petVacinas = ref<PetVacina[]>([])
const allAgendamentos = ref<Agendamento[]>([]) // Todos os agendamentos
const vacinasList = ref<Vacina[]>([])
const loadingVacinas = ref(false)
const showApplyVaccineModal = ref(false)
const applyingVaccine = ref(false)
const deletingVaccineId = ref<number | null>(null)
const vaccineFormRef = ref<FormInst | null>(null)

// Formulário para aplicar vacina
const vaccineForm = ref({
  vacina_id: null as number | null,
  data_aplicacao: Date.now(),
  data_proxima_dose: null as number | null
})

// Configuração do axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// Interceptor para adicionar token (igual à tela que funciona)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders()
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// Computed para obter o nome da vacina (trata diferentes estruturas)
const vacinasComNome = computed(() => {
  return petVacinas.value.map(petVacina => {
    // Tenta diferentes formas de obter o nome da vacina
    const nomeVacina = 
      petVacina.vacina?.nome || 
      petVacina.vacina_nome || 
      petVacina.nome || 
      'Vacina'
    
    console.log('Processando vacina:', { 
      id: petVacina.id, 
      vacina: petVacina.vacina,
      vacina_nome: petVacina.vacina_nome,
      nome: petVacina.nome,
      nomeFinal: nomeVacina
    })
    
    return {
      ...petVacina,
      nomeExibicao: nomeVacina
    }
  })
})

// Computed para filtrar agendamentos pelo pet_id
const filteredAgendamentos = computed(() => {
  if (!pet.value) return []
  
  const agendamentosDoPet = allAgendamentos.value.filter((ag: Agendamento) => 
    ag.pet?.id === pet.value!.id
  )
  
  console.log('Agendamentos do pet filtrados:', agendamentosDoPet)
  
  return agendamentosDoPet.filter((ag: Agendamento) => 
    ag.status !== 'cancelado' && ag.status !== 'concluido' && ag.status !== 'realizado'
  )
})

// Regras de validação para o formulário de vacina
const vaccineRules: FormRules = {
  vacina_id: [
    { required: true, message: 'Selecione uma vacina', trigger: ['blur', 'change'] }
  ],
  data_aplicacao: [
    { required: true, message: 'Informe a data de aplicação', trigger: ['blur', 'change'] }
  ]
}

// Options para o select de vacinas
const vacinasOptions = computed(() => {
  return vacinasList.value.map(vacina => ({
    label: vacina.nome,
    value: vacina.id,
    description: vacina.descricao
  }))
})

// Buscar dados do pet
async function fetchPet() {
  try {
    loading.value = true
    const petId = Number(route.params.id)
    
    if (!petId) {
      message.error('ID do pet inválido.')
      router.push('/pets')
      return
    }

    // Buscar dados do pet
    const { data } = await api.get(`/pets/${petId}`)
    
    let petData = data.data || data
    console.log('Dados do pet:', petData)
    
    pet.value = petData

    // Buscar vacinas aplicadas ao pet
    await fetchPetVacinas(petId)
    
    // Buscar TODOS os agendamentos
    await fetchAllAgendamentos()

  } catch (error: any) {
    console.error('Erro ao buscar pet:', error)
    
    if (error.response?.status === 404) {
      message.error('Pet não encontrado.')
    } else if (error.response?.status === 401) {
      message.error('Sessão expirada. Faça login novamente.')
    } else {
      message.error('Erro ao carregar dados do pet.')
    }
  } finally {
    loading.value = false
  }
}

// Buscar vacinas aplicadas ao pet
async function fetchPetVacinas(petId: number) {
  try {
    const { data } = await api.get(`/pets/${petId}/vacinas`)
    console.log('Resposta completa das vacinas aplicadas:', data)
    
    const vacinasData = data.data || data || []
    console.log('Estrutura de cada vacina aplicada:')
    vacinasData.forEach((vacina: any, index: number) => {
      console.log(`Vacina ${index + 1}:`, JSON.stringify(vacina, null, 2))
    })
    
    petVacinas.value = vacinasData
    
    // Se as vacinas não vierem com os dados completos, buscar informações adicionais
    await enriquecerDadosVacinas()

  } catch (error) {
    console.error('Erro ao buscar vacinas do pet:', error)
    petVacinas.value = []
  }
}

// Enriquecer dados das vacinas se necessário
async function enriquecerDadosVacinas() {
  const vacinasSemDadosCompletos = petVacinas.value.filter(pv => 
    !pv.vacina?.nome && !pv.vacina_nome && !pv.nome
  )
  
  if (vacinasSemDadosCompletos.length > 0) {
    console.log('Enriquecendo dados de', vacinasSemDadosCompletos.length, 'vacinas')
    
    try {
      // Buscar todas as vacinas disponíveis
      const { data } = await api.get('/vacinas')
      const todasVacinas = data.data || data || []
      
      // Mapear os nomes das vacinas
      petVacinas.value = petVacinas.value.map(pv => {
        if (!pv.vacina?.nome && !pv.vacina_nome && !pv.nome) {
          const vacinaInfo = todasVacinas.find((v: Vacina) => v.id === pv.vacina_id)
          if (vacinaInfo) {
            return {
              ...pv,
              vacina: vacinaInfo
            }
          }
        }
        return pv
      })
    } catch (error) {
      console.error('Erro ao enriquecer dados das vacinas:', error)
    }
  }
}

// Buscar TODOS os agendamentos
async function fetchAllAgendamentos() {
  try {
    const { data } = await api.get('/agendamento-de-vacinas')
    console.log('Todos os agendamentos:', data)
    
    allAgendamentos.value = data.data || data || []
    console.log('Agendamentos filtrados para o pet:', filteredAgendamentos.value)
    
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    allAgendamentos.value = []
  }
}

// Buscar lista de vacinas disponíveis
async function fetchVacinas() {
  try {
    loadingVacinas.value = true
    const response = await api.get('/vacinas')
    vacinasList.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Erro ao buscar vacinas:', error)
    message.error('Erro ao carregar lista de vacinas')
  } finally {
    loadingVacinas.value = false
  }
}

// Aplicar vacina ao pet
async function applyVaccine() {
  try {
    await vaccineFormRef.value?.validate()
    applyingVaccine.value = true

    const payload = {
      vacina_id: vaccineForm.value.vacina_id,
      data_aplicacao: new Date(vaccineForm.value.data_aplicacao).toISOString().split('T')[0],
      data_proxima_dose: vaccineForm.value.data_proxima_dose 
        ? new Date(vaccineForm.value.data_proxima_dose).toISOString().split('T')[0]
        : null
    }

    const response = await api.post(`/pets/${pet.value?.id}/vacinas`, payload)
    
    message.success('Vacina aplicada com sucesso!')
    showApplyVaccineModal.value = false
    resetVaccineForm()
    
    // Recarregar lista de vacinas
    await fetchPetVacinas(pet.value!.id)

  } catch (error: any) {
    console.error('Erro ao aplicar vacina:', error)
    
    if (error.response?.status === 422) {
      const errors = error.response.data.errors
      Object.values(errors).flat().forEach((err: any) => {
        message.error(err)
      })
    } else {
      message.error('Erro ao aplicar vacina.')
    }
  } finally {
    applyingVaccine.value = false
  }
}

// Resetar formulário de vacina
function resetVaccineForm() {
  vaccineForm.value = {
    vacina_id: null,
    data_aplicacao: Date.now(),
    data_proxima_dose: null
  }
}

// Verifica se a vacina está atrasada
function isVacinaAtrasada(petVacina: PetVacina): boolean {
  if (!petVacina.data_aplicacao) return false

  const dataAplicacao = new Date(petVacina.data_aplicacao)
  const hoje = new Date()
  
  const umAnoDepois = new Date(dataAplicacao)
  umAnoDepois.setFullYear(umAnoDepois.getFullYear() + 1)
  
  return hoje > umAnoDepois
}

// Formatar data
function formatDateBR(dateStr: string): string {
  if (!dateStr) return 'Não informada'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return 'Data inválida'
  }
}

// Helper functions para status
function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pendente': 'Pendente',
    'concluido': 'Concluído', 
    'cancelado': 'Cancelado',
    'realizado': 'Realizado'
  }
  return statusMap[status] || status
}

function getStatusTagType(status: string): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const typeMap: { [key: string]: any } = {
    'pendente': 'info',
    'concluido': 'success',
    'realizado': 'success',
    'cancelado': 'error'
  }
  return typeMap[status] || 'default'
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

onMounted(() => {
  fetchPet()
  fetchVacinas()
})
</script>


<style scoped>
/* Container da página - ESPAÇAMENTO */
.page-container {
  padding: 20px;
  box-sizing: border-box;
}

/* Container principal - CONTEÚDO */
.pet-detail-card {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

.loading-container {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  justify-content: space-between;
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

.vaccine-status {
  font-size: 12px;
  font-weight: 500;
}

.status-pendente {
  color: #1890ff;
}

.status-concluído {
  color: #52c41a;
}

.status-cancelado {
  color: #ff4d4f;
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

.observacoes {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.observacoes-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.observacoes-text {
  font-size: 12px;
  color: #1f2937;
  margin-left: 8px;
}

.empty-state {
  margin: 20px 0;
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
</style>