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
                  <span class="vaccine-name">{{ vac.vacina_nome }}</span>
                  <span class="vaccine-date">{{ formatarData(vac.data_aplicacao) }}</span>
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
          <span class="vaccine-name">{{ vac.vacina?.nome || 'Vacina' }}</span>
          <span class="vaccine-date">{{ formatarData(vac.data_agendada) }}</span>
          <div v-if="vac.observacoes" class="vaccine-observations">
            <n-text depth="3" class="observations-text">
              {{ vac.observacoes }}
            </n-text>
          </div>
        </div>
        <div class="vaccine-actions">
          <n-button 
            type="primary" 
            size="small" 
            @click="editVaccine(vac.id)"
            class="edit-btn"
          >
            Editar
          </n-button>
          <n-button 
            type="error" 
            size="small" 
            @click="cancelVaccine(vac.id)"
            class="cancel-btn"
          >
            Cancelar
          </n-button>
        </div>
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
                    <span class="vaccine-name">{{ vac.vacina_nome }}</span>
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
import { useMessage } from 'naive-ui'

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

interface VacinaAplicada {
  id: number
  vacina_id: number
  vacina_nome: string
  data_aplicacao: string
  data_proxima_dose: string | null
}

interface VacinaAgendada {
  id: number
  pet: { id: number }
  vacina: { id: number; nome: string }
  data_agendada: string
  status: string
  observacoes?: string
}

interface Pet {
  id: number
  name: string
  species: string
  birthdate: number | null
}

const pet = ref<Pet>({
  id: 0,
  name: '',
  species: '',
  birthdate: null
})

const vacinasAplicadas = ref<VacinaAplicada[]>([])
const vacinasAgendadas = ref<VacinaAgendada[]>([])
const vacinasAtrasadas = ref<VacinaAplicada[]>([])
const vacinasRecentes = ref<VacinaAplicada[]>([])

const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' }
]

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

function formatarData(date: string): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

function disabledDate(current: Date): boolean {
  return current && current > new Date()
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

// Pet
async function fetchPet() {
  const petId = Number(route.params.id)
  if (!petId) {
    message.error('ID do pet inválido.')
    router.push('/pets')
    return
  }

  try {
    const { data } = await api.get(`/pets/${petId}`)
    const petData = data.data || data

    pet.value = {
      id: petData.id,
      name: petData.name,
      species: petData.species,
      birthdate: petData.birthdate ? new Date(petData.birthdate).getTime() : null
    }

    // Carrega as vacinas aplicadas e agendadas
    await Promise.all([
      fetchVacinasAplicadas(petId),
      fetchVacinasAgendadas(petId)
    ])

  } catch (err) {
    console.error(err)
    message.error('Erro ao carregar dados do pet.')
    router.push('/pets')
  }
}

async function fetchVacinasAplicadas(petId: number) {
  try {
    const { data } = await api.get(`/pets/${petId}/vacinas`)
    console.log('Vacinas aplicadas:', data)
    vacinasAplicadas.value = data.data || data
    
    separarVacinasAplicadas()
  } catch (err) {
    console.error('Erro ao carregar vacinas aplicadas:', err)
  }
}

async function fetchVacinasAgendadas(petId: number) {
  try {
    const { data } = await api.get('/agendamento-de-vacinas')
    console.log('Todos os agendamentos:', data)
    
    // Filtrar os agendamentos pelo pet_id
    const todosAgendamentos = data.data || data
    const agendamentosDoPet = todosAgendamentos.filter((ag: VacinaAgendada) => 
      ag.pet?.id === petId
    )
    
    console.log('Agendamentos do pet:', agendamentosDoPet)
    
    // Agendamentos pendentes (não cancelados e não realizados)
    vacinasAgendadas.value = agendamentosDoPet.filter((ag: VacinaAgendada) => 
      ag.status !== 'cancelado' && ag.status !== 'realizado'
    )
    
    console.log('Vacinas agendadas filtradas:', vacinasAgendadas.value)
    
  } catch (err) {
    console.error('Erro ao carregar vacinas agendadas:', err)
  }
}

function separarVacinasAplicadas() {
  const hoje = new Date()
  const umAnoAtras = new Date()
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)

  vacinasRecentes.value = []
  vacinasAtrasadas.value = []
  
  vacinasAplicadas.value.forEach(vacina => {
    const dataAplicacao = new Date(vacina.data_aplicacao)
    
    if (dataAplicacao >= umAnoAtras) {
      // Vacina aplicada nos últimos 12 meses = RECENTE
      vacinasRecentes.value.push(vacina)
    } else {
      // Vacina aplicada há mais de 1 ano = ATRASADA
      vacinasAtrasadas.value.push(vacina)
    }
  })
}

// Paginação
const currentPage = ref(1)
const perPage = ref(5)
const totalPages = computed(() => Math.ceil(vacinasAgendadas.value.length / perPage.value))
const paginatedVacinasAgendadas = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return vacinasAgendadas.value.slice(start, start + perPage.value)
})
watch(vacinasAgendadas, () => { currentPage.value = 1 })

// Atualizar pet
async function savePet() {
  if (!formRef.value) return
  saving.value = true

  try {
    await formRef.value.validate()

    const birthdate = pet.value.birthdate
      ? new Date(pet.value.birthdate).toISOString().split('T')[0]
      : null

    await api.put(`/pets/${pet.value.id}`, {
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

// Editar agendamento
function editVaccine(agendamentoId: number) {
  router.push(`/schedule/edit/${agendamentoId}`)
}

// Cancelar agendamento
async function cancelVaccine(agendamentoId: number) {
  try {
    await api.delete(`/agendamento-de-vacinas/${agendamentoId}`)
    vacinasAgendadas.value = vacinasAgendadas.value.filter(v => v.id !== agendamentoId)
    message.success('Agendamento cancelado com sucesso!')
  } catch (err) {
    console.error('Erro ao cancelar agendamento:', err)
    message.error('Não foi possível cancelar o agendamento.')
  }
}

function goBack() {
  router.push('/pets')
}

function goToSchedule(petId: number) {
  router.push(`/schedule/${petId}`)
}

onMounted(() => {
  fetchPet()
})
</script>

<style scoped>
/* Container da página - ESPAÇAMENTO */
.page-container {
  padding: 20px;
  box-sizing: border-box;
}

/* Container principal - CONTEÚDO */
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
  transition: all 0.2s ease;
}

.vaccine-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
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
  padding: 12px;
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

/* Ações das vacinas agendadas */
.vaccine-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.edit-btn {
  background-color: #28a745;
  border-color: #28a745;
}

.edit-btn:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.cancel-btn {
  background-color: #dc3545;
  border-color: #dc3545;
}

.cancel-btn:hover {
  background-color: #c82333;
  border-color: #bd2130;
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
    gap: 12px;
  }
  
  .vaccine-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .vaccine-actions .n-button {
    flex: 1;
    min-width: 0;
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
  
  .vaccine-content {
    padding: 10px;
  }
  
  .vaccine-actions {
    flex-direction: column;
    width: 100%;
    gap: 6px;
  }
  
  .vaccine-actions .n-button {
    width: 100%;
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
  
  .vaccine-content {
    padding: 8px;
  }
  
  .vaccine-name {
    font-size: 13px;
  }
  
  .vaccine-date {
    font-size: 11px;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-state .n-empty__description {
  color: #6b7280;
  margin-bottom: 16px;
}

.vaccine-card.scheduled .vaccine-name {
  color: #007bff;
}

.vaccine-card.overdue .vaccine-name {
  color: #dc3545;
}

/* Efeitos de hover suaves */
.vaccine-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.vaccine-card:hover {
  border-color: #d1d5db;
}

.vaccine-observations {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #007bff;
}

.observations-text {
  font-size: 12px;
  line-height: 1.4;
  color: #6b7280;
  word-break: break-word;
}

/* Ajuste no vaccine-info para acomodar as observações */
.vaccine-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; /* texto quebra corretamente */
}

/* Ajustes responsivos para observações */
@media (max-width: 768px) {
  .vaccine-observations {
    margin-top: 6px;
    padding: 6px;
  }
  
  .observations-text {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .vaccine-observations {
    margin-top: 4px;
    padding: 4px;
  }
}

</style>