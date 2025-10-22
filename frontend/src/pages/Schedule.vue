<template>
  <div class="page-container">
    <n-card 
      title="Agendar Vacinação"
      class="schedule-card"
      :bordered="true"
    >
      <!-- Transição suave -->
      <transition name="fade" mode="out-in">
        <div v-if="selectedPet" key="content">
          <!-- Cabeçalho do Pet -->
          <div class="pet-header">
            <div class="pet-info">
              <h2 class="pet-name">{{ selectedPet.name }}</h2>
              <p class="pet-species">{{ selectedPet.species }}</p>
            </div>
          </div>

          <n-divider class="custom-divider" />

          <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="large" class="schedule-form">
            <!-- Data do agendamento -->
            <n-form-item label="Data do Agendamento" path="scheduleDate" class="form-item">
              <n-date-picker
                v-model:value="form.scheduleDate"
                type="date"
                placeholder="Escolha a data"
                :disabled-date="disablePastDates"
                style="width: 100%"
                format="dd/MM/yyyy"
                size="large"
              />
            </n-form-item>

            <!-- Seletor de vacina -->
            <n-form-item label="Vacina" path="selectedVaccine" class="form-item">
              <n-select
                v-model:value="form.selectedVaccine"
                :options="allVaccinesOptions"
                placeholder="Selecione a vacina"
                style="width: 100%"
                size="large"
              />
            </n-form-item>

            <!-- Vacinas Atrasadas -->
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

            <!-- Botões de Ação -->
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

        <!-- Loading state -->
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
import { useMessage, NTag } from 'naive-ui'

const message = useMessage()
const route = useRoute()
const router = useRouter()
const petIdFromRoute = Number(route.params.id) || null
const selectedPetId = ref<number | null>(petIdFromRoute)
const formRef = ref<FormInst | null>(null)
const scheduling = ref(false)

// Formulário
const form = ref({
  selectedVaccine: null as number | null,
  scheduleDate: null as number | null
})

// Regras
const rules = {
  selectedVaccine: [{ required: true, message: 'Selecione uma vacina', trigger: 'change' }],
  scheduleDate: [{ required: true, message: 'Escolha a data do agendamento', trigger: 'change' }]
}

// Pet e vacinas
const selectedPet = ref<any>(null)
const overdueVaccines = ref<any[]>([])
const allVaccinesOptions = ref<{label: string, value: number}[]>([])

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

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

// Buscar dados do backend
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token || !selectedPetId.value) {
    message.error('Token não encontrado ou ID do pet inválido')
    router.push('/pets')
    return
  }

  try {
    // Pet
    const resPet = await axios.get(`http://127.0.0.1:8000/api/pets/${selectedPetId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    selectedPet.value = resPet.data

    // Vacinas atrasadas
    if (selectedPet.value.vacinas_aplicadas && Array.isArray(selectedPet.value.vacinas_aplicadas)) {
      overdueVaccines.value = selectedPet.value.vacinas_aplicadas
        .filter((v: any) => isVaccineLate(v.data_aplicacao))
        .map((v: any) => ({
          id: v.id,
          name: v.vacina.nome,
          date: v.data_aplicacao
        }))
    }

    // Todas vacinas
    const resVacinas = await axios.get('http://127.0.0.1:8000/api/vacinas', {
      headers: { Authorization: `Bearer ${token}` }
    })

    allVaccinesOptions.value = resVacinas.data.items.map((v: any) => ({
      label: v.nome,
      value: v.id
    }))

  } catch (err) {
    console.error('Erro ao carregar dados do pet ou vacinas:', err)
    message.error('Erro ao carregar dados do pet')
    router.push('/pets')
  }
})

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

    //  Garantindo formato "YYYY-MM-DD" 
    const dataAgendadaFormatted = form.value.scheduleDate
      ? new Date(form.value.scheduleDate).toISOString().split('T')[0]
      : null

    const payload = {
      pet_id: selectedPetId.value,
      vacina_id: form.value.selectedVaccine,
      data_agendada: dataAgendadaFormatted,
      observacoes: null
    }

    await axios.post(
      'http://127.0.0.1:8000/api/agendamento-de-vacinas',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    message.success('Vacinação agendada com sucesso!')
    
    // Limpar formulário
    form.value.selectedVaccine = null
    form.value.scheduleDate = null

    router.push('/pets')

  } catch (err: any) {
    console.error('Erro ao agendar vacina:', err.response?.data || err)
    message.error(err.response?.data?.message || 'Erro ao agendar vacina')
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