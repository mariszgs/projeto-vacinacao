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
import axios from 'axios'

const route = useRoute()
const petIdFromRoute = Number(route.params.id) || null
const selectedPetId = ref<number | null>(petIdFromRoute)
const formRef = ref<FormInst | null>(null)

// Formulário
const form = ref({
  selectedVaccine: null as number | null,
  scheduleDate: null as Date | null
})

// Regras
const rules = {
  selectedVaccine: [{ required: true, message: 'Selecione uma vacina' }],
  scheduleDate: [{ required: true, message: 'Escolha a data do agendamento' }]
}

// Pet e vacinas
const selectedPet = ref<any>(null)
const overdueVaccines = ref<any[]>([])
const allVaccinesOptions = ref<{label: string, value: number}[]>([])

// Formatar data para exibir
function formatDateBR(dateStr: string): string {
  const date = new Date(dateStr)
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`
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
function disablePastDates(date: Date) {
  const today = new Date()
  today.setHours(0,0,0,0)
  return date < today
}

// Buscar dados do backend
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token || !selectedPetId.value) return

  try {
    // Pet
    const resPet = await axios.get(`http://127.0.0.1:8000/api/pets/${selectedPetId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    selectedPet.value = resPet.data

    // Vacinas atrasadas
    if (selectedPet.value.vacinas && Array.isArray(selectedPet.value.vacinas)) {
      overdueVaccines.value = selectedPet.value.vacinas.filter((v: any) => isVaccineLate(v.date || v.data_aplicacao))
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
  }
})

// Agendar vacina
async function scheduleVaccination() {
  if (!selectedPetId.value || !formRef.value) return
  try {
    await formRef.value.validate()

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Você precisa estar logado!')
      return
    }

    // ✅ Garante formato "YYYY-MM-DD" (aceito pelo backend Laravel)
    const dataAgendadaFormatted = form.value.scheduleDate
      ? new Date(form.value.scheduleDate).toISOString().split('T')[0]
      : null

    const payload = {
      pet_id: selectedPetId.value,
      vacina_id: form.value.selectedVaccine,
      data_agendada: dataAgendadaFormatted,
      observacoes: null
    }

    const res = await axios.post(
      'http://127.0.0.1:8000/api/agendamento-de-vacinas',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    alert('Vacinação agendada com sucesso!')

    // ✅ Garante que o array vacinas exista antes de dar push
    if (!selectedPet.value.vacinas || !Array.isArray(selectedPet.value.vacinas)) {
      selectedPet.value.vacinas = []
    }

    // Atualizar lista local
    const vacinaLabel = allVaccinesOptions.value.find(
      v => v.value === payload.vacina_id
    )?.label

    selectedPet.value.vacinas.push({
      id: res.data.id,
      name: vacinaLabel,
      date: dataAgendadaFormatted
    })

    overdueVaccines.value = selectedPet.value.vacinas.filter((v: any) =>
      isVaccineLate(v.date)
    )

    // Limpar formulário
    form.value.selectedVaccine = null
    form.value.scheduleDate = null

  } catch (err: any) {
    console.error('Erro ao agendar vacina:', err.response?.data || err)
    alert(err.response?.data?.message || 'Erro ao agendar vacina')
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

