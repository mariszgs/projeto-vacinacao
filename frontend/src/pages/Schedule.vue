<template>
  <n-card title="Agendar Vacinação" class="schedule-card">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="medium">
      <div class="form-section">
        <!-- Mostra o nome do pet fixo -->
        <n-form-item label="Pet">
          <span>{{ selectedPet?.name || 'Carregando...' }}</span>
        </n-form-item>

        <!-- Seletor de Data -->
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

        <!-- Seletor de Vacina -->
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

        <n-form-item>
          <n-button type="primary" class="confirm-btn" @click="scheduleVaccination">
            Confirmar Agendamento
          </n-button>
        </n-form-item>
      </div>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { FormInst } from 'naive-ui'

const route = useRoute()
const petIdFromRoute = Number(route.params.id) || null
const selectedPetId = ref<number | null>(petIdFromRoute)

const pets = [
  {
    id: 1,
    name: 'Rex',
    species: 'Cachorro',
    vaccines: [
      { id: 1, name: 'Vacina Raiva', date: '2025-01-10' },
      { id: 2, name: 'Vacina V8', date: '2022-03-15' },
      { id: 3, name: 'Vacina Parvovirose', date: '2023-04-01' }
    ]
  },
  {
    id: 2,
    name: 'Mimi',
    species: 'Gato',
    vaccines: [
      { id: 4, name: 'Vacina V3', date: '2025-05-15' },
      { id: 5, name: 'Vacina Leucemia Felina', date: '2023-07-10' }
    ]
  }
]

const selectedPet = computed(() => pets.find(pet => pet.id === selectedPetId.value))

function isVaccineLate(vacDate: string): boolean {
  const dateVaccine = new Date(vacDate)
  const now = new Date()
  dateVaccine.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const diffDays = (now.getTime() - dateVaccine.getTime()) / (1000 * 3600 * 24)
  return diffDays > 365
}

const overdueVaccines = computed(() => {
  if (!selectedPet.value) return []
  return selectedPet.value.vaccines.filter(v => isVaccineLate(v.date))
})

const formRef = ref<FormInst | null>(null)

const form = ref({
  selectedVaccine: null as string | null,
  scheduleDate: null as Date | null
})

// ⚠️ Ajuste aqui: removi trigger 'blur', só valida no submit
const rules = {
  selectedVaccine: [
    { required: true, message: 'Selecione uma vacina' }
  ],
  scheduleDate: [
    { required: true, message: 'Escolha a data do agendamento' }
  ]
}

const allVaccinesSet = new Set<string>()
pets.forEach(pet => {
  pet.vaccines.forEach(vac => allVaccinesSet.add(vac.name))
})
const allVaccinesOptions = Array.from(allVaccinesSet).map(v => ({ label: v, value: v }))

function disablePastDates(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function formatDateBR(dateStr: string): string {
  const date = new Date(dateStr)
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

async function scheduleVaccination() {
  if (!selectedPetId.value) {
    alert('Pet não selecionado')
    return
  }

  if (!formRef.value) return

  try {
    // Aqui chama validação, só aparece erro se campo vazio
    await formRef.value.validate()

    // Se passou na validação:
    alert(
      `Vacina "${form.value.selectedVaccine}" agendada para ${form.value.scheduleDate ? formatDateBR(form.value.scheduleDate.toISOString()) : ''} do pet ${selectedPet.value?.name}`
    )

    // TODO: salvar no backend aqui

    // Resetar campos após sucesso
    form.value.selectedVaccine = null
    form.value.scheduleDate = null
  } catch (errors) {
    // Validação falhou, Naive UI já mostra os erros no formulário.
    console.warn('Formulário inválido:', errors)
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

