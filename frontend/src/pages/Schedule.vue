<template>
  <n-card title="Agendar Vacinação" class="schedule-card">
    <div>
      <!-- Seleção do ID do animal -->
      <n-form-item label="Selecione o Pet" path="petId">
        <n-select
          v-model="selectedPetId"
          :options="petOptions"
          placeholder="Selecione o ID do Pet"
          @update:value="loadPetVaccines"
        />
      </n-form-item>

      <!-- Exibir Vacinas Necessárias e Atrasadas -->
      <div v-if="selectedPetId">
        <h3>Vacinas Atrasadas</h3>
        <ul class="vaccines-list">
          <li v-for="vacina in overdueVaccines" :key="vacina.id" class="vaccine-item">
            <span class="vaccine-name">{{ vacina.name }}</span>  
            <span class="vaccine-date">{{ vacina.date }}</span>  
            <span class="vaccine-status" style="color: red;">Atrasada</span>
          </li>
        </ul>

        <h3>Vacinas Necessárias</h3>
        <ul class="vaccines-list">
          <li v-for="vacina in necessaryVaccines" :key="vacina.name" class="vaccine-item">
            <span class="vaccine-name">{{ vacina.name }}</span>  
            <span class="vaccine-status" style="color: orange;">Necessária</span>
          </li>
        </ul>
      </div>

      <!-- Calendário de Agendamento -->
      <n-card title="Calendário de Vacinação" bordered style="margin-top: 24px;">
        <n-calendar
          v-model="calendarDate"
          :date="calendarDate"
          :show-time="true"
          @change="handleCalendarChange"
        />
      </n-card>

      <!-- Seletor de vacina ao selecionar uma data -->
      <div v-if="showVaccineSelector">
        <n-select
          v-model="selectedVaccine"
          :options="vaccinesToSchedule"
          placeholder="Selecione a vacina a agendar"
        />
        <n-button
          type="primary"
          style="margin-top: 16px;"
          @click="scheduleVaccination"
        >
          Confirmar Agendamento
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Simulação de dados de pets
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
];

const selectedPetId = ref<number | null>(null);
const calendarDate = ref(new Date()); // Data do calendário
const selectedVaccine = ref<string | null>(null);
const showVaccineSelector = ref(false);

// Filtrando as vacinas necessárias e atrasadas
const selectedPet = computed(() => pets.find(pet => pet.id === selectedPetId.value));

const overdueVaccines = computed(() => {
  if (selectedPet.value) {
    return selectedPet.value.vaccines.filter(vacina => isVaccineLate(vacina.date));
  }
  return [];
});

const necessaryVaccines = computed(() => {
  if (selectedPet.value) {
    return selectedPet.value.species === 'Cachorro' ? 
      [{ name: 'Vacina Raiva' }, { name: 'Vacina V8' }, { name: 'Vacina Parvovirose' }] : 
      [{ name: 'Vacina V3' }, { name: 'Vacina Leucemia Felina' }];
  }
  return [];
});

// Função que retorna se a vacina está atrasada (mais de 365 dias)
function isVaccineLate(vacDate: string): boolean {
  const dateVaccine = new Date(vacDate);
  const now = new Date();
  const diffTime = now.getTime() - dateVaccine.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  return diffDays > 365; // mais de 365 dias = atrasada
}

// Opções de vacina a agendar
const vaccinesToSchedule = computed(() => {
  return [
    ...overdueVaccines.value.map(vacina => ({ label: vacina.name, value: vacina.name })),
    ...necessaryVaccines.value.map(vacina => ({ label: vacina.name, value: vacina.name }))
  ];
});

// Função para lidar com a mudança de data no calendário
function handleCalendarChange(date: Date) {
  console.log('Data selecionada:', date);
  showVaccineSelector.value = true;
}

// Função para agendar a vacina
function scheduleVaccination() {
  console.log('Vacinação agendada para:', selectedPetId.value, 'com a vacina:', selectedVaccine.value, 'em', calendarDate.value);
  // Lógica de agendamento, como salvar em um banco de dados ou API
}

// Carregar vacinas do pet selecionado
function loadPetVaccines() {
  showVaccineSelector.value = false; // Esconde o seletor de vacina até que o ID do pet seja selecionado
}

// Dados de opções de pet
const petOptions = computed(() => pets.map(pet => ({ label: pet.name, value: pet.id })));
</script>

<style scoped>
.schedule-card {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.vaccines-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.vaccine-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: #555;
}

.vaccine-name {
  font-weight: bold;
  margin-right: 5px;
}

.vaccine-status {
  font-weight: bold;
}

.vaccine-status.green {
  color: green;
}

.vaccine-status.red {
  color: red;
}

.vaccine-status.orange {
  color: orange;
}

.n-button {
  margin-top: 16px;
}
</style>
