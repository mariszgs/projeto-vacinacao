<template>
  <n-card 
    title="Editar Pet"
    class="edit-pet-card"
    :bordered="true"
  >
    <!-- Transição suave -->
    <transition name="fade" mode="out-in">
      <div v-if="pet.id" key="content">
        <n-form :model="pet" :rules="rules" ref="formRef" class="pet-form">
          <!-- Cabeçalho do Pet -->
          <div class="pet-header">
            <div class="pet-title">
              <h2>Editar {{ pet.name }}</h2>
              <p>Atualize as informações do seu pet</p>
            </div>
          </div>

          <n-divider class="custom-divider" />

          <!-- Informações Básicas -->
          <div class="form-section">
            <h3 class="section-title">Informações Básicas</h3>
            <div class="form-grid">
              <n-form-item label="Nome" path="name" class="form-item">
                <n-input 
                  v-model:value="pet.name" 
                  placeholder="Digite o nome do pet"
                  size="large"
                />
              </n-form-item>

              <n-form-item label="Espécie" path="species" class="form-item">
                <n-select
                  v-model:value="pet.species"
                  :options="speciesOptions"
                  placeholder="Selecione a espécie"
                  size="large"
                />
              </n-form-item>

              <n-form-item label="Data de Nascimento" path="birthdate" class="form-item">
                <n-date-picker
                  v-model:value="pet.birthdate"
                  type="date"
                  placeholder="Selecione a data de nascimento"
                  :disabled-date="disabledDate"
                  format="dd/MM/yyyy"
                  value-format="timestamp"
                  size="large"
                  style="width: 100%"
                />
              </n-form-item>
            </div>
          </div>

          <!-- Vacinas Aplicadas Recentes -->
          <div class="form-section">
            <h3 class="section-title">Vacinas Aplicadas Recentemente</h3>
            <div class="vaccines-grid" v-if="vacinasRecentes.length">
              <n-card
                v-for="vac in vacinasRecentes"
                :key="vac.id"
                class="vaccine-card"
              >
                <div class="vaccine-content">
                  <span class="vaccine-name">{{ vac.name }}</span>
                  <span class="vaccine-date">{{ formatarData(new Date(vac.date || 0).toISOString()) }}</span>
                </div>
              </n-card>
            </div>
            <n-empty v-else description="Nenhuma vacina recente" class="empty-state">
              <template #extra>
                <n-button size="small" @click="goToSchedule(pet.id)">
                  Agendar Vacinação
                </n-button>
              </template>
            </n-empty>
          </div>

          <!-- Vacinas Agendadas -->
          <div class="form-section">
            <h3 class="section-title">Vacinas Agendadas</h3>
            <div class="vaccines-list" v-if="paginatedVacinasAgendadas.length">
              <n-card
                v-for="vac in paginatedVacinasAgendadas"
                :key="vac.id"
                class="vaccine-card scheduled"
              >
                <div class="vaccine-content">
                  <div class="vaccine-info">
                    <span class="vaccine-name">{{ vac.vacina.nome }}</span>
                    <span class="vaccine-date">{{ formatarData(vac.data_agendada || vac.data_aplicacao) }}</span>
                  </div>
                  <n-button 
                    type="error" 
                    size="small" 
                    @click="cancelVaccine(vac.id)"
                    class="cancel-btn"
                  >
                    Cancelar
                  </n-button>
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

          <!-- Vacinas Atrasadas -->
          <div class="form-section">
            <h3 class="section-title">Vacinas Atrasadas</h3>
            <div class="vaccines-list" v-if="vacinasAtrasadas.length">
              <n-card
                v-for="vac in vacinasAtrasadas"
                :key="vac.id"
                class="vaccine-card overdue"
              >
                <div class="vaccine-content">
                  <div class="vaccine-info">
                    <span class="vaccine-name">{{ vac.vacina.nome }}</span>
                    <span class="vaccine-date">{{ formatarData(vac.data_aplicacao) }}</span>
                  </div>
                  <n-tag type="error" size="small" class="status-tag">
                    Atrasada
                  </n-tag>
                </div>
              </n-card>
            </div>
            <n-empty v-else description="Nenhuma vacina atrasada" class="empty-state" />
          </div>

          <!-- Botões de Ação -->
          <div class="action-buttons">
            <n-button 
              type="primary" 
              @click="savePet" 
              size="large"
              class="action-btn"
              :loading="saving"
            >
              Salvar Alterações
            </n-button>
            <n-button 
              @click="goBack" 
              size="large"
              class="action-btn"
              :disabled="saving"
            >
              Cancelar
            </n-button>
              
          </div>
        </n-form>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInst, FormRules } from 'naive-ui'
import axios, { AxiosHeaders } from 'axios'
import { useMessage, NTag, NEmpty } from 'naive-ui'

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

interface Vaccine {
  id: number
  name: string
  date: number | null
}

interface VacinaAgendada {
  id: number
  vacina: { nome: string }
  data_aplicacao: string
  data_agendada?: string
}

interface Pet {
  id: number
  name: string
  species: string
  birthdate: number | null
  vaccines: Vaccine[]
}

interface VacinaDisponivel {
  id: number
  nome: string
}

const pet = ref<Pet>({
  id: 0,
  name: '',
  species: '',
  birthdate: null,
  vaccines: []
})

const vacinasAgendadas = ref<VacinaAgendada[]>([])
const vacinasAtrasadas = ref<VacinaAgendada[]>([])
const vacinasRecentes = ref<Vaccine[]>([])

const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' }
]

const vacinasDisponiveis = ref<{ label: string; value: number }[]>([])

const api = axios.create({ baseURL: 'http://localhost:8000/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders()
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

const route = useRoute()
const router = useRouter()

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function parseVaccines(data: any[]): Vaccine[] {
  return data.map(v => ({
    id: v.id,
    name: v.name,
    date: v.date ? new Date(v.date).getTime() : null
  }))
}

const rules: FormRules = {
  name: [{ required: true, message: 'Nome é obrigatório', trigger: 'blur' }],
  species: [{ required: true, message: 'Espécie é obrigatória', trigger: 'change' }],
  birthdate: [
    {
      required: true,
      validator: (rule, value) => {
        if (!value || value <= 0) return new Error('Data de nascimento é obrigatória')
        return true
      },
      trigger: 'change'
    }
  ]
}

function disabledDate(current: Date): boolean { return current && current > new Date() }

async function fetchPet() {
  const petId = Number(route.params.id)
  if (!petId) { message.error('ID do pet inválido.'); router.push('/pets'); return }

  try {
    const { data } = await api.get(`http://localhost:8000/api/pets/${petId}`)
    pet.value = {
      id: data.id,
      name: data.name,
      species: data.species,
      birthdate: data.birthdate || null,
      vaccines: parseVaccines(data.vaccines || [])
    }
    separarVacinas(data.vacinas_aplicadas || [], data.vacinas_agendadas || [])
  } catch (err) {
    console.error(err)
    message.error('Erro ao carregar dados do pet.')
    router.push('/pets')
  }
}

async function fetchVacinas() {
  try {
    const { data } = await api.get('http://localhost:8000/api/vacinas')
    const items = Array.isArray(data.items) ? data.items : []
    vacinasDisponiveis.value = items.map((v: VacinaDisponivel) => ({ label: v.nome, value: v.id }))
  } catch (err) {
    console.error('Erro ao carregar vacinas:', err)
    message.error('Erro ao carregar vacinas disponíveis.')
  }
}

function separarVacinas(vacinasAplicadas: any[], vacinasAgendar: any[]) {
  const hoje = new Date().setHours(0, 0, 0, 0)
  const umAnoAtras = new Date()
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)
  umAnoAtras.setHours(0, 0, 0, 0)

  vacinasRecentes.value = []
  vacinasAtrasadas.value = []
  vacinasAgendadas.value = []

  vacinasAplicadas.forEach(v => {
    const dataAplicacao = new Date(v.data_aplicacao).setHours(0, 0, 0, 0)
    if (dataAplicacao >= hoje) {
      vacinasAgendadas.value.push({ id: v.id, vacina: v.vacina, data_aplicacao: v.data_aplicacao, data_agendada: v.data_aplicacao })
    } else if (dataAplicacao < hoje && dataAplicacao >= umAnoAtras.getTime()) {
      vacinasRecentes.value.push({ id: v.id, name: v.vacina.nome, date: dataAplicacao })
    } else {
      vacinasAtrasadas.value.push({ id: v.id, vacina: v.vacina, data_aplicacao: v.data_aplicacao })
    }
  })

  vacinasAgendar.forEach(v => {
    vacinasAgendadas.value.push({
      id: v.id,
      vacina: v.vacina,
      data_aplicacao: v.data_aplicacao || v.data_agendada,
      data_agendada: v.data_agendada || v.data_aplicacao
    })
  })
}

// PAGINAÇÃO DE VACINAS AGENDADAS
const currentPage = ref(1)
const perPage = ref(5)
const totalPages = computed(() => Math.ceil(vacinasAgendadas.value.length / perPage.value))
const paginatedVacinasAgendadas = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return vacinasAgendadas.value.slice(start, start + perPage.value)
})
watch(vacinasAgendadas, () => { currentPage.value = 1 })

async function savePet() {
  if (!formRef.value) return
  saving.value = true
  
  try {
    await formRef.value.validate()

    const token = localStorage.getItem('token')
    if (!token) {
      message.error('Você precisa estar logado!')
      return
    }

    const birthdate = pet.value.birthdate
      ? new Date(pet.value.birthdate).toISOString().split('T')[0]
      : null

    await api.put(`http://localhost:8000/api/pets/${pet.value.id}`, {
      name: pet.value.name,
      species: pet.value.species,
      birthdate
    })

    message.success('Pet atualizado com sucesso!')
    router.push('/pets')
  } catch (err: any) {
    console.error('Erro ao salvar pet:', err.response?.data || err)
    message.error(err.response?.data?.message || 'Erro ao salvar pet.')
  } finally {
    saving.value = false
  }
}

async function cancelVaccine(vacId: number) {
  try {
    await api.delete(`http://localhost:8000/api/agendamento-de-vacinas/${vacId}`)
    vacinasAgendadas.value = vacinasAgendadas.value.filter(v => v.id !== vacId)
    message.success('Vacina cancelada com sucesso!')
  } catch (err) {
    console.error('Erro ao cancelar vacina:', err)
    message.error('Não foi possível cancelar a vacina.')
  }
}

function goBack() { router.push('/pets') }
function goToSchedule(petId: number) {
  router.push(`/schedule/${petId}`)
}
function formatarData(date: string): string { return new Date(date).toLocaleDateString('pt-BR') }

onMounted(() => {
  fetchPet()
  fetchVacinas()
})
</script>

<style scoped>
/* Container da página - APENAS ESPAÇAMENTO */
.page-container {
  padding: 20px;
  box-sizing: border-box;
}

/* Container principal - APENAS O CONTEÚDO */
.edit-pet-card {
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

.pet-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.pet-title p {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.custom-divider {
  margin: 20px 0;
}

/* Formulário */
.pet-form {
  width: 100%;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-item {
  margin-bottom: 0;
}

/* Vacinas */
.vaccines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
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

.vaccine-card.scheduled {
  border-left: 4px solid #007bff;
}

.vaccine-card.overdue {
  border-left: 4px solid #dc3545;
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

.cancel-btn {
  flex-shrink: 0;
}

.status-tag {
  flex-shrink: 0;
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
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  min-width: 140px;
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
  
  .edit-pet-card {
    border-radius: 8px;
  }
  
  .pet-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .vaccines-grid {
    grid-template-columns: 1fr;
  }
  
  .vaccine-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .cancel-btn, .status-tag {
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
  
  .edit-pet-card {
    border-radius: 6px;
  }
  
  .pet-title h2 {
    font-size: 20px;
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
  
  .pet-title h2 {
    font-size: 18px;
  }
}
</style>