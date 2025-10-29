<template>
  <div class="page-container">
    <n-card 
      title="Agendar Vacinação"
      class="schedule-card"
      :bordered="true"
    >
      <transition name="fade" mode="out-in">
        <div v-if="selectedPet" key="content">
          <div class="pet-header">
            <div class="pet-info">
              <h2 class="pet-name">{{ selectedPet.name }}</h2>
              <p class="pet-species">{{ selectedPet.species }}</p>
            </div>
          </div>

          <n-divider class="custom-divider" />

          <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="large" class="schedule-form">
            <n-form-item label="Data do Agendamento" path="data_agendada" class="form-item">
              <n-date-picker
                v-model:value="form.data_agendada"
                type="date"
                placeholder="Escolha a data"
                :disabled-date="disablePastDates"
                style="width: 100%"
                format="dd/MM/yyyy"
                size="large"
              />
            </n-form-item>

            <n-form-item label="Vacina" path="vacina_id" class="form-item">
              <n-select
                v-model:value="form.vacina_id"
                :options="allVaccinesOptions"
                placeholder="Selecione a vacina"
                style="width: 100%"
                size="large"
                :loading="loadingVaccines"
              />
            </n-form-item>

            <div v-if="overdueVaccines.length" class="overdue-section">
              <h3 class="section-title">Vacinas Atrasadas</h3>
              <div class="vaccines-list">
                <n-card
                  v-for="vacina in overdueVaccines"
                  :key="vacina.id"
                  class="vaccine-card overdue"
                >
                  <div class="vaccine-content">
                    <div class="vaccine-info">
                      <span class="vaccine-name">{{ vacina.name }}</span>
                      <span class="vaccine-date">{{ formatDateBR(vacina.date) }}</span>
                    </div>
                    <n-tag type="error" size="small" class="status-tag">
                      Atrasada
                    </n-tag>
                  </div>
                </n-card>
              </div>
            </div>

            <n-form-item label="Observações (Opcional)" path="observacoes" class="form-item">
              <n-input
                v-model:value="form.observacoes"
                type="textarea"
                placeholder="Adicione observações sobre o agendamento"
                :rows="3"
                size="large"
              />
            </n-form-item>

            <div class="action-buttons">
              <n-button 
                type="primary" 
                @click="scheduleVaccination" 
                size="large"
                class="action-btn"
                :loading="scheduling"
              >
                Confirmar Agendamento
              </n-button>
              <n-button 
                @click="goBack" 
                size="large"
                class="action-btn"
                :disabled="scheduling"
              >
                Cancelar
              </n-button>
            </div>
          </n-form>
        </div>

        <div v-else key="loading" class="loading-container">
          <n-skeleton height="32px" width="200px" style="margin-bottom: 20px;" />
          <n-skeleton height="20px" :repeat="3" style="margin-bottom: 8px;" />
        </div>
      </transition>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInst } from 'naive-ui'
import axios from 'axios'
import { useMessage } from 'naive-ui'

const message = useMessage()
const route = useRoute()
const router = useRouter()
const petIdFromRoute = Number(route.params.id) || null
const selectedPetId = ref<number | null>(petIdFromRoute)
const formRef = ref<FormInst | null>(null)
const scheduling = ref(false)
const loadingVaccines = ref(false)

// Formulário
const form = ref({
  vacina_id: null as number | null,
  data_agendada: null as number | null,
  observacoes: null as string | null
})

// Regras de validação
const rules = {
  vacina_id: [
    {
      required: true,
      validator: (_rule: any, value: number | null) => {
        if (!value) return new Error('Selecione uma vacina')
        return true
      },
      trigger: ['change', 'blur']
    }
  ],
  data_agendada: [
    {
      required: true,
      validator: (_rule: any, value: number | null) => {
        if (!value) return new Error('Escolha a data do agendamento')
        
        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (selectedDate <= today) {
          return new Error('A data do agendamento deve ser futura')
        }
        
        return true
      },
      trigger: ['change', 'blur']
    }
  ]
}

// Pet e vacinas
const selectedPet = ref<any>(null)
const overdueVaccines = ref<any[]>([])
const allVaccinesOptions = ref<{label: string, value: number}[]>([])

// Formatar data para exibir
function formatDateBR(dateStr: string): string {
  if (!dateStr) return 'Data não informada'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

// Verificar vacina atrasada (>365 dias)
function isVaccineLate(vacDate: string): boolean {
  const dateVaccine = new Date(vacDate)
  const now = new Date()
  dateVaccine.setHours(0,0,0,0)
  now.setHours(0,0,0,0)
  const diffDays = (now.getTime() - dateVaccine.getTime()) / (1000*3600*24)
  return diffDays > 365
}

// Bloquear datas passadas
function disablePastDates(date: number) {
  const today = new Date()
  today.setHours(0,0,0,0)
  return date < today.getTime()
}

// Buscar dados do back
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token || !selectedPetId.value) {
    message.error('Token não encontrado ou ID do pet inválido')
    router.push('/pets')
    return
  }

  try {
    // Buscar dados do pet
    const resPet = await axios.get(`http://127.0.0.1:8000/api/pets/${selectedPetId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    selectedPet.value = resPet.data

    // Buscar vacinas atrasadas do pet
    if (selectedPet.value.vacinas_aplicadas && Array.isArray(selectedPet.value.vacinas_aplicadas)) {
      overdueVaccines.value = selectedPet.value.vacinas_aplicadas
        .filter((v: any) => v.data_aplicacao && isVaccineLate(v.data_aplicacao))
        .map((v: any) => ({
          id: v.id,
          name: v.vacina?.nome || 'Vacina não encontrada',
          date: v.data_aplicacao
        }))
    }

    // Buscar todas as vacinas disponíveis
    await loadAllVaccines(token)

  } catch (err: any) {
    console.error('Erro ao carregar dados do pet ou vacinas:', err)
    
    if (err.response?.status === 401) {
      message.error('Sessão expirada. Faça login novamente.')
      router.push('/login')
    } else {
      message.error('Erro ao carregar dados do pet')
      router.push('/pets')
    }
  }
})

// Carregar todas as vacinas
async function loadAllVaccines(token: string) {
  loadingVaccines.value = true
  try {
    const resVacinas = await axios.get('http://127.0.0.1:8000/api/vacinas', {
      headers: { Authorization: `Bearer ${token}` }
    })

    let vaccinesData = resVacinas.data
    
    if (resVacinas.data.data) {
      vaccinesData = resVacinas.data.data
    }
    else if (resVacinas.data.items) {
      vaccinesData = resVacinas.data.items
    }
    else if (Array.isArray(resVacinas.data)) {
      vaccinesData = resVacinas.data
    }

    allVaccinesOptions.value = vaccinesData.map((v: any) => ({
      label: v.nome,
      value: v.id
    }))

    console.log('Vacinas carregadas:', allVaccinesOptions.value)

  } catch (err) {
    console.error('Erro ao carregar vacinas:', err)
    message.error('Erro ao carregar lista de vacinas')
  } finally {
    loadingVaccines.value = false
  }
}

// Agendar vacina
async function scheduleVaccination() {
  if (!selectedPetId.value || !formRef.value) return

  scheduling.value = true
  try {
    await formRef.value.validate()

    const token = localStorage.getItem('token')
    if (!token) {
      message.error('Você precisa estar logado!')
      return
    }

    // Formatar a data (YYYY-MM-DD)
    const dataAgendadaFormatted = form.value.data_agendada
      ? new Date(form.value.data_agendada).toISOString().split('T')[0]
      : null

    const payload = {
      pet_id: selectedPetId.value,
      vacina_id: form.value.vacina_id,
      data_agendada: dataAgendadaFormatted,
      observacoes: form.value.observacoes || null
    }

    console.log('Enviando payload:', payload)

    const res = await axios.post(
      'http://127.0.0.1:8000/api/agendamento-de-vacinas',
      payload,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    )

    message.success('Vacinação agendada com sucesso!')
    router.push('/pets')

  } catch (err: any) {
    console.error('Erro ao agendar vacina:', err)
    
    if (Array.isArray(err)) {
      message.error('Preencha todos os campos obrigatórios corretamente.')
    } else if (err.response) {
      const errorMessage = err.response.data.message || 
                          err.response.data.error || 
                          'Erro no servidor ao agendar vacina.'
      message.error(errorMessage)
    } else if (err.request) {
      message.error('Erro de conexão. Verifique sua internet.')
    } else {
      message.error('Erro inesperado ao agendar vacina.')
    }
  } finally {
    scheduling.value = false
  }
}

function goBack() {
  router.push('/pets')
}
</script>


<style scoped>
/* Container da página para centralização */
.page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

/* Container principal CENTRALIZADO */
.schedule-card {
  width: 100%;
  max-width: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
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

/* Formulário */
.schedule-form {
  width: 100%;
}

.form-item {
  margin-bottom: 24px;
}

/* Vacinas Atrasadas */
.overdue-section {
  margin: 24px 0;
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

.status-tag {
  flex-shrink: 0;
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
  min-width: 180px;
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
    align-items: flex-start;
  }
  
  .schedule-card {
    margin: 0;
    border-radius: 8px;
    max-width: none;
  }
  
  .pet-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
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
  
  .schedule-card {
    border-radius: 6px;
  }
  
  .pet-name {
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
  
  .pet-name {
    font-size: 18px;
  }
}
</style>