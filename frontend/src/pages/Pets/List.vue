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

function goToEdit(id: number) {
  router.push(`/pets/edit/${id}`);
}

function goToDelete(id: number) {
  if (confirm('Tem certeza que deseja excluir este pet?')) {
    pets.value = pets.value.filter(pet => pet.id !== id);
    console.log(`Pet com ID ${id} excluído`);
  }
}

function goToSchedule(id: number) {
  router.push(`/schedule/${id}`);
}

// Colunas com coluna customizada de ações
const columns = [
  { title: 'ID', key: 'id' },
  { title: 'Nome', key: 'name' },
  { title: 'Espécie', key: 'species' },
  { title: 'Idade', key: 'age' },
  {
  
    key: 'actions',
    render(row: Pet) {
      return h(
        'div', // Usando um contêiner div para empacotar os botões
        {
          style: 'display: flex; gap: 10px; justify-content: space-between;'
        },
        [
          h(
            NButton,
            {
              size: 'small',
              onClick: () => goToView(row.id),
              style: 'flex-grow: 1;' // Faz com que o botão ocupe toda a largura disponível
            },
            { default: () => 'Visualizar' }
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => goToEdit(row.id),
              style: 'flex-grow: 1;' // O mesmo para o botão de editar
            },
            { default: () => 'Editar' }
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => goToSchedule(row.id),
              style: 'flex-grow: 1;' // O mesmo para o botão de agendar
            },
            { default: () => 'Agendar Vacinação' }
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => goToDelete(row.id),
              style: 'flex-grow: 1;' // O mesmo para o botão de excluir
            },
            { default: () => 'Excluir' }
          )
        ]
      );
    }
  }
];
</script>

<style scoped>
/* Estilos personalizados para o formulário de edição */
n-card {
  max-width: 600px;
  margin: 20px auto;
}

n-form-item {
  margin-bottom: 16px;
}

n-button {
  margin-top: 16px;
}
</style>
