<template>
  <n-card title="Lista de Pets" style="position: relative;">
    <n-button
      type="primary"
      style="position: absolute; top: 16px; right: 16px;"
      @click="goToCreate"
    >
      Adicionar Novo Pet
    </n-button>
    <n-data-table
      :columns="columns"
      :data="pets"
      style="margin-top: 48px;"
      :scroll="{ x: '100%' }"
    />
  </n-card>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { useRouter } from 'vue-router';
import { NButton } from 'naive-ui';

interface Pet {
  id: number;
  name: string;
  species: string;
  age: number;
}

const router = useRouter();

const pets = ref<Pet[]>([
  { id: 1, name: 'Rex', species: 'Cachorro', age: 4 },
  { id: 2, name: 'Mimi', species: 'Gato', age: 2 }
]);

function goToCreate() {
  router.push('/pets/create');
}

function goToView(id: number) {
  router.push(`/pets/${id}`);
}

// Colunas com coluna customizada de ações
const columns = [
  { title: 'ID', key: 'id' },
  { title: 'Nome', key: 'name' },
  { title: 'Espécie', key: 'species' },
  { title: 'Idade', key: 'age' },
  {
    title: 'Ações',
    key: 'actions',
    render(row: Pet) {
      return h(
        NButton,
        {
          size: 'small',
          onClick: () => goToView(row.id)
        },
        { default: () => 'Visualizar' }
      );
    }
  }
];
</script>
