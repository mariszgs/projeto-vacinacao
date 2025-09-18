<template>
  <n-card title="Lista de Pets" class="pet-card">
    <div class="header-actions">
      <n-button type="primary" @click="goToCreate">
        Adicionar Novo Pet
      </n-button>
    </div>

    <n-data-table
      :columns="columns"
      :data="pets"
      class="pet-table"
      :scroll="{ x: 800 }"
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
  }
}
function goToSchedule(id: number) {
  router.push(`/schedule/${id}`);
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: 'Nome', key: 'name', width: 150 },
  { title: 'Espécie', key: 'species', width: 120 },
  { title: 'Idade', key: 'age', width: 80 },
  {
    title: 'Ações',
    key: 'actions',
    width: 350,
    render(row: Pet) {
      return h(
        'div',
        { class: 'actions-container' },
        [
          h(
            NButton,
            {
              size: 'small',
              onClick: () => goToView(row.id),
              class: 'action-button'
            },
            { default: () => 'Visualizar' }
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => goToEdit(row.id),
              class: 'action-button'
            },
            { default: () => 'Editar' }
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => goToSchedule(row.id),
              class: 'action-button'
            },
            { default: () => 'Agendar Vacinação' }
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => goToDelete(row.id),
              class: 'action-button'
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
.pet-card {
  margin: 20px auto;
  max-width: 100%;
  overflow-x: auto;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.pet-table {
  width: 100%;
}

/* Botões de ação */
.actions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

.action-button {
  flex: 1 1 45%;
  min-width: 100px;
}

/* Responsividade para celular */
@media (max-width: 600px) {
  .actions-container {
    flex-direction: column;
    gap: 6px;
  }

  .action-button {
    width: 100%;
  }

  .header-actions {
    justify-content: center;
  }
}
</style>
