<template>
  <n-card title="Lista de Pets">
    <n-data-table :columns="columns" :data="pets" />
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Pet {
  id: number;
  name: string;
  species: string;
  age: number;
}

const pets = ref<Pet[]>([
  { id: 1, name: 'Rex', species: 'Cachorro', age: 4 },
  { id: 2, name: 'Mimi', species: 'Gato', age: 2 }
]);

const columns = [
  { title: 'ID', key: 'id' },
  { title: 'Nome', key: 'name' },
  { title: 'Espécie', key: 'species' },
  { title: 'Idade', key: 'age' }
];
</script>
