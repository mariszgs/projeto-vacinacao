<template>
  <n-card title="Detalhes do Pet" style="max-width: 600px; margin: 20px auto;">
    <p><strong>ID:</strong> {{ pet.id }}</p>
    <p><strong>Nome:</strong> {{ pet.name }}</p>
    <p><strong>Espécie:</strong> {{ pet.species }}</p>
    <p><strong>Idade:</strong> {{ pet.age }}</p>

    <h3>Vacinações</h3>
    <ul>
      <li v-for="vacina in pet.vaccines" :key="vacina.id">
        {{ vacina.name }} - {{ vacina.date }} -
        <span :style="{ color: isVaccineLate(vacina.date) ? 'red' : 'green' }">
          {{ isVaccineLate(vacina.date) ? 'Atrasada' : 'Em dia' }}
        </span>
      </li>
    </ul>

    <n-button @click="goBack">Voltar</n-button>
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
