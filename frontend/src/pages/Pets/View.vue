<template>
  <n-card title="Detalhes do Pet" class="pet-detail-card">
    <div class="pet-info">
      <p><strong>ID:</strong> {{ pet.id }}</p>
      <p><strong>Nome:</strong> {{ pet.name }}</p>
      <p><strong>Espécie:</strong> {{ pet.species }}</p>
      <p><strong>Idade:</strong> {{ pet.age }} anos</p>
    </div>

    <div class="vaccines-section">
      <h3>Vacinações</h3>
      <ul class="vaccines-list">
        <li v-for="vacina in pet.vaccines" :key="vacina.id" class="vaccine-item">
          <span class="vaccine-name">{{ vacina.name }}</span>  
          <span class="vaccine-date">{{ vacina.date }}</span>  
          <span :style="{ color: isVaccineLate(vacina.date) ? 'red' : 'green' }" class="vaccine-status">
            {{ isVaccineLate(vacina.date) ? 'Atrasada' : 'Em dia' }}
          </span>
        </li>
      </ul>
    </div>

    <n-button @click="goBack" class="back-button">Voltar</n-button>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

onMounted(() => {
  const petId = Number(route.params.id);
  // Simulação de dados
  pet.value = {
    id: petId,
    name: petId === 1 ? 'Rex' : 'Mimi',
    species: petId === 1 ? 'Cachorro' : 'Gato',
    age: petId === 1 ? 4 : 2,
    vaccines: [
      { id: 1, name: 'Vacina Raiva', date: '2025-01-10' },
      { id: 2, name: 'Vacina V8', date: '2022-03-15' } // exemplo atrasada
    ]
  };
});

// Função que retorna true se a vacina está atrasada
function isVaccineLate(vacDate: string): boolean {
  const dateVaccine = new Date(vacDate);
  const now = new Date();
  const diffTime = now.getTime() - dateVaccine.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  return diffDays > 365; // mais de 365 dias = atrasada
}

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

.pet-info p {
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
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

@media (max-width: 600px) {
  .pet-detail-card {
    padding: 15px;
    max-width: 100%;
  }

  .pet-info p {
    font-size: 14px;
  }

  .vaccines-section h3 {
    font-size: 18px;
  }

  .vaccines-item {
    font-size: 14px;
  }
}
</style>
