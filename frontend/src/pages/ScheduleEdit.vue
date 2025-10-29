<template>
  <n-card 
    title="Editar Agendamento de Vacina"
    class="edit-schedule-card"
    :bordered="true"
  >
    <transition name="fade" mode="out-in">
      <div v-if="agendamento.id" key="content">
        <n-form :model="form" :rules="rules" ref="formRef" class="schedule-form">
          
          <div class="form-section">
            <h3 class="section-title">Informações do Agendamento</h3>
            
            <n-form-item label="Pet" path="pet_id" class="form-item">
              <n-select
                v-model:value="form.pet_id"
                :options="petsOptions"
                placeholder="Selecione o pet"
                size="large"
                :disabled="true"
              />
            </n-form-item>

            <n-form-item label="Vacina" path="vacina_id" class="form-item">
              <n-select
                v-model:value="form.vacina_id"
                :options="vacinasOptions"
                placeholder="Selecione a vacina"
                size="large"
                :disabled="true"
              />
            </n-form-item>

            <n-form-item label="Data do Agendamento" path="data_agendada" class="form-item">
              <n-date-picker
                v-model:value="form.data_agendada"
                type="date"
                placeholder="Selecione a data"
                :disabled-date="disabledPastDate"
                format="dd/MM/yyyy"
                value-format="timestamp"
                size="large"
                style="width: 100%"
                clearable
              />
            </n-form-item>

            <n-form-item label="Observações" path="observacoes" class="form-item">
              <n-input
                v-model:value="form.observacoes"
                type="textarea"
                placeholder="Digite observações sobre o agendamento"
                :rows="3"
                size="large"
              />
            </n-form-item>
          </div>

          <!-- Botões de Ação -->
          <div class="action-buttons">
            <n-button 
              type="primary" 
              @click="saveAgendamento" 
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInst, FormRules } from 'naive-ui'
import axios, { AxiosHeaders } from 'axios'
import { useMessage } from 'naive-ui'

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

interface Agendamento {
  id: number
  pet_id: number
  vacina_id: number
  data_agendada: string
  status: string
  observacoes?: string
  pet?: { id: number; name: string }
  vacina?: { id: number; nome: string }
}

interface Pet {
  id: number
  name: string
}

interface Vacina {
  id: number
  nome: string
}

const agendamento = ref<Agendamento>({
  id: 0,
  pet_id: 0,
  vacina_id: 0,
  data_agendada: '',
  status: '',
  observacoes: ''
})

const form = ref({
  pet_id: 0,
  vacina_id: 0,
  data_agendada: null as number | null,
  observacoes: ''
})

const petsOptions = ref<{ label: string; value: number }[]>([])
const vacinasOptions = ref<{ label: string; value: number }[]>([])

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

function disabledPastDate(current: number): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return current < today.getTime()
}

const rules: FormRules = {
  data_agendada: [
    { 
      required: true, 
      message: 'Data do agendamento é obrigatória', 
      trigger: ['blur', 'change'] 
    }
  ]
}

// Agendamento
async function fetchAgendamento() {
  const agendamentoId = Number(route.params.id)
  if (!agendamentoId) {
    message.error('ID do agendamento inválido.')
    router.push('/pets')
    return
  }

  try {
    const { data } = await api.get(`/agendamento-de-vacinas/${agendamentoId}`)
    const agendamentoData = data.data || data

    agendamento.value = agendamentoData
    
    // Converter a data para timestamp 
    const dataOriginal = new Date(agendamentoData.data_agendada)
    const dataSemHora = new Date(dataOriginal.getFullYear(), dataOriginal.getMonth(), dataOriginal.getDate())
    const timestamp = dataSemHora.getTime()
    
    form.value = {
      pet_id: agendamentoData.pet?.id || agendamentoData.pet_id,
      vacina_id: agendamentoData.vacina?.id || agendamentoData.vacina_id,
      data_agendada: timestamp,
      observacoes: agendamentoData.observacoes || ''
    }

    console.log('Data original:', agendamentoData.data_agendada)
    console.log('Data convertida:', form.value.data_agendada)
    console.log('Data formatada:', new Date(form.value.data_agendada!).toLocaleDateString('pt-BR'))

    await Promise.all([
      fetchPets(),
      fetchVacinas()
    ])

  } catch (err) {
    console.error(err)
    message.error('Erro ao carregar dados do agendamento.')
    router.push('/pets')
  }
}

// lista de pets
async function fetchPets() {
  try {
    const { data } = await api.get('/pets')
    const pets = data.data || data
    
    petsOptions.value = pets.map((pet: Pet) => ({
      label: pet.name,
      value: pet.id
    }))
  } catch (err) {
    console.error('Erro ao carregar pets:', err)
  }
}

// lista de vacinas
async function fetchVacinas() {
  try {
    const { data } = await api.get('/vacinas')
    const vacinas = data.data || data
    
    vacinasOptions.value = vacinas.map((vacina: Vacina) => ({
      label: vacina.nome,
      value: vacina.id
    }))
  } catch (err) {
    console.error('Erro ao carregar vacinas:', err)
  }
}

// Atualizar agendamento
async function saveAgendamento() {
  if (!formRef.value) return
  
  try {
    // Validação manual simples
    if (!form.value.data_agendada) {
      message.error('Data do agendamento é obrigatória')
      return
    }

    saving.value = true

    // Converter timestamp para string de data (YYYY-MM-DD)
    const dataSelecionada = new Date(form.value.data_agendada)
    const dataFormatada = dataSelecionada.toISOString().split('T')[0]

    console.log('Enviando data:', dataFormatada)

    await api.put(`/agendamento-de-vacinas/${agendamento.value.id}`, {
      data_agendada: dataFormatada,
      observacoes: form.value.observacoes
    })

    message.success('Agendamento atualizado com sucesso!')
    router.push('/pets')
  } catch (err: any) {
    console.error('Erro ao salvar agendamento:', err.response?.data || err)
    message.error(err.response?.data?.message || 'Erro ao salvar agendamento.')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/pets')
}

onMounted(() => {
  fetchAgendamento()
})
</script>

<style scoped>
.edit-schedule-card {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  color: #333;
  margin-bottom: 24px;
  font-size: 20px;
}

.form-item {
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.action-btn {
  min-width: 150px;
}

.loading-container {
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: 100%;
  }
}
</style>