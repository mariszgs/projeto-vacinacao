<template>
  <n-card title="Agendar Vacinação" class="schedule-card">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="medium">
      
      <!-- Nome do pet -->
      <n-form-item label="Pet">
        <span>{{ selectedPet?.name || 'Carregando...' }}</span>
      </n-form-item>

      <!-- Data do agendamento -->
      <n-form-item label="Data do agendamento" path="scheduleDate">
        <n-date-picker
          v-model:value="form.scheduleDate"
          type="date"
          placeholder="Escolha a data"
          :disabled-date="disablePastDates"
          style="width: 100%"
          format="dd/MM/yyyy"
          value-format="yyyy-MM-dd"
        />
      </n-form-item>

      <!-- Seletor de vacina -->
      <n-form-item label="Vacina" path="selectedVaccine">
        <n-select
          v-model:value="form.selectedVaccine"
          :options="allVaccinesOptions"
          placeholder="Selecione a vacina"
          style="width: 100%"
        />
      </n-form-item>

      <!-- Vacinas atrasadas do pet -->
      <div v-if="selectedPet && overdueVaccines.length">
        <h3>Vacinas Atrasadas do pet {{ selectedPet.name }}</h3>
        <ul class="vaccines-list">
          <li v-for="vacina in overdueVaccines" :key="vacina.id" class="vaccine-item">
            <span class="vaccine-name">{{ vacina.name }}</span>
            <span class="vaccine-date">{{ formatDateBR(vacina.date) }}</span>
            <span class="vaccine-status red">Atrasada</span>
          </li>
        </ul>
      </div>

      <!-- Botão -->
      <n-form-item>
        <n-button type="primary" class="confirm-btn" @click="scheduleVaccination">
          Confirmar Agendamento
        </n-button>
      </n-form-item>

    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { FormInst } from 'naive-ui'

const route = useRoute()
const petIdFromRoute = Number(route.params.id) || null
const selectedPetId = ref<number | null>(petIdFromRoute)
const formRef = ref<FormInst | null>(null)

// Formulário
const form = ref({
  selectedVaccine: null as number | null,
  scheduleDate: null as string | null
})

// Regras
const rules = {
  selectedVaccine: [{ required: true, message: 'Selecione uma vacina' }],
  scheduleDate: [{ required: true, message: 'Escolha a data do agendamento' }]
}

// Opções de vacinas
const allVaccinesOptions = ref([
  { label: 'Vacina Antirrábica', value: 1 },
  { label: 'Vacina V8', value: 2 },
  { label: 'Vacina V10', value: 3 },
  { label: 'Vacina Gripe Canina', value: 4 },
  { label: 'Vacina Leptospirose', value: 5 }
])

const selectedPet = ref<any>(null)
const overdueVaccines = ref<any[]>([])

// Datas passadas
function disablePastDates(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// Formatar data BR
function formatDateBR(dateStr: string): string {
  const date = new Date(dateStr)
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`
}

// Vacina atrasada
function isVaccineLate(vacDate: string): boolean {
  const dateVaccine = new Date(vacDate)
  const now = new Date()
  dateVaccine.setHours(0,0,0,0)
  now.setHours(0,0,0,0)
  const diffDays = (now.getTime() - dateVaccine.getTime()) / (1000*3600*24)
  return diffDays > 365
}

// Carrega pet e vacinas atrasadas
onMounted(async () => {
  if (!selectedPetId.value) return
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:8000/api/pets/${selectedPetId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Erro ao carregar pet')
    const data = await res.json()
    selectedPet.value = data
    if (data.vacinas && Array.isArray(data.vacinas)) {
      overdueVaccines.value = data.vacinas.filter((v: any) => isVaccineLate(v.date || v.data_aplicacao))
    }
  } catch (err) {
    console.error(err)
  }
})

// Agendar vacina
async function scheduleVaccination() {
  if (!selectedPetId.value || !formRef.value) return
  try {
    await formRef.value.validate()
    const payload = {
      pet_id: selectedPetId.value,
      vacina_id: form.value.selectedVaccine,
      data_agendada: form.value.scheduleDate,
      observacoes: null
    }
    const token = localStorage.getItem('token')
if (!token) {
  alert('Você precisa estar logado!')
  return
}

    const res = await fetch(`http://127.0.0.1:8000/api/agendamento-de-vacinas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    const result = await res.json()
    if (!res.ok) {
      console.error('Erro ao agendar vacina:', result)
      alert(result.message || 'Erro ao agendar vacina')
      return
    }

    alert('Vacinação agendada com sucesso!')

    // Limpar formulário
    form.value.selectedVaccine = null
    form.value.scheduleDate = null

    // Atualizar lista de vacinas atrasadas
    const vacinaLabel = allVaccinesOptions.value.find(v => v.value === payload.vacina_id)?.label
    selectedPet.value.vacinas.push({
      id: result.id,
      name: vacinaLabel,
      date: form.value.scheduleDate
    })
    overdueVaccines.value = selectedPet.value.vacinas.filter((v: any) => isVaccineLate(v.date))
  } catch (err) {
    console.warn('Formulário inválido:', err)
  }
}
</script>


<style scoped>
.schedule-card {
  max-width: 600px;
  margin: 40px auto; /* centraliza horizontal e deixa um espaço vertical */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;

  /* Centralizar verticalmente com flex */
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80vh; /* ocupa quase toda a altura da tela */
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Lista de vacinas atrasadas */
.vaccines-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.vaccine-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: #555;
  flex-wrap: wrap;
  gap: 8px;
}

.vaccine-name {
  font-weight: bold;
}

.vaccine-date {
  font-style: italic;
  color: #888;
}

.vaccine-status.red {
  color: red;
  font-weight: bold;
}

.confirm-btn {
  margin-top: 16px;
  align-self: flex-start;
  min-width: 180px;
}

/* RESPONSIVO */
@media (max-width: 600px) {
  .schedule-card {
    max-width: 100%;
    margin: 10px auto;
    padding: 10px;
    min-height: auto;
  }

  .form-section {
    gap: 12px;
  }

  /* Inputs, selects, datepicker e botão ocupam 100% */
  n-select,
  n-date-picker,
  .confirm-btn {
    width: 100%;
  }

  .vaccine-item {
    flex-direction: column;
    align-items: flex-start;
    font-size: 14px;
  }

  .vaccine-name,
  .vaccine-date,
  .vaccine-status.red {
    font-size: 14px;
  }

  .confirm-btn {
    font-size: 14px;
    padding: 12px 0;
  }
}
</style>

