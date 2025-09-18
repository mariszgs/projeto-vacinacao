<template>
  <n-card title="Vacinas do Pet" class="pet-detail-card">
    <div class="vaccines-section">
      <h3>Vacinas Atrasadas</h3>
      <ul class="vaccines-list">
        <li v-for="vacina in overdueVaccines" :key="vacina.id" class="vaccine-item">
          <span class="vaccine-name">{{ vacina.name }}</span>  
          <span class="vaccine-date">{{ formatDateBR(vacina.date) }}</span> 
          <span class="vaccine-status" style="color: red;">
            Atrasada
          </span>
        </li>
      </ul>
      
      <h3>Vacinas em Dia</h3>
      <ul class="vaccines-list">
        <li v-for="vacina in inDateVaccines" :key="vacina.id" class="vaccine-item">
          <span class="vaccine-name">{{ vacina.name }}</span>  
          <span class="vaccine-date">{{ formatDateBR(vacina.date) }}</span>  
          <span class="vaccine-status" style="color: green;">
            Em Dia
          </span>
        </li>
      </ul>
      
      <h3>Vacinas Necessárias</h3>
      <ul class="vaccines-list">
        <li v-for="vacina in necessaryVaccines" :key="vacina.name" class="vaccine-item">
          <span class="vaccine-name">{{ vacina.name }}</span>  
          <span class="vaccine-status" style="color: orange;">
            Necessária
          </span>
        </li>
      </ul>
    </div>

    <n-button @click="goBack" class="back-button">Voltar</n-button>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Vaccine {
  id: number;
  name: string;
  date: string; // formato 'YYYY-MM-DD'
}

interface Pet {
  id: number;
  name: string;
  species: string;
  age: number;
  vaccines: Vaccine[];
}

const route = useRoute();
const router = useRouter();

const pet = ref<Pet>({
  id: 0,
  name: '',
  species: '',
  age: 0,
  vaccines: []
});

// Simulação de dados
onMounted(() => {
  const petId = Number(route.params.id);
  // Simulação de dados do pet
  pet.value = {
    id: petId,
    name: petId === 1 ? 'Rex' : 'Mimi',
    species: petId === 1 ? 'Cachorro' : 'Gato',
    age: petId === 1 ? 4 : 2,
    vaccines: [
      { id: 1, name: 'Vacina Raiva', date: '2025-01-10' },
      { id: 2, name: 'Vacina V8', date: '2022-03-15' },
      { id: 3, name: 'Vacina Parvovirose', date: '2023-04-01' } // Exemplo de vacina em dia
    ]
  };
});

// Função que retorna se a vacina está atrasada (mais de 365 dias)
function isVaccineLate(vacDate: string): boolean {
  const dateVaccine = new Date(vacDate);
  const now = new Date();
  const diffTime = now.getTime() - dateVaccine.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  return diffDays > 365; // mais de 365 dias = atrasada
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // mês começa do 0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}


// Filtrando as vacinas
const overdueVaccines = computed(() => {
  return pet.value.vaccines.filter(vacina => isVaccineLate(vacina.date));
});

const inDateVaccines = computed(() => {
  return pet.value.vaccines.filter(vacina => !isVaccineLate(vacina.date));
});

// Vacinas necessárias dependendo do tipo de animal
const necessaryVaccines = computed(() => {
  if (pet.value.species === 'Cachorro') {
    return [
      { name: 'Vacina Raiva' },
      { name: 'Vacina V8' },
      { name: 'Vacina Parvovirose' },
    ];
  } else if (pet.value.species === 'Gato') {
    return [
      { name: 'Vacina V3' },
      { name: 'Vacina Leucemia Felina' },
    ];
  }
  return [];
});

// Função de voltar
function goBack() {
  router.back();
}
</script>

<style scoped>
.pet-detail-card {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.vaccines-section {
  margin-top: 20px;
}

.vaccines-section h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #222b22ff;
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

.vaccine-date {
  margin-right: 10px;
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

.back-button {
  margin-top: 20px;
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #45a049;
}
</style>
