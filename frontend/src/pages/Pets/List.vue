<template>
  <n-card title="Lista de Pets">
    <!-- Botão adicionar -->
    <div class="add-btn-wrapper">
      <n-button type="primary" @click="goToCreate">
        Adicionar Novo Pet
      </n-button>
    </div>

    <!-- Desktop: tabela -->
    <div class="desktop-table">
      <n-data-table
        :columns="columns"
        :data="pets"
        :scroll="{ x: 'max-content' }"
        style="margin-top: 24px;"
      />
    </div>

    <!-- Mobile: cards -->
    <div class="mobile-list">
      <n-card
        v-for="pet in pets"
        :key="pet.id"
        style="margin-bottom: 12px;"
        :title="pet.name"
      >
        <p><strong>Espécie:</strong> {{ pet.species }}</p>
        <p><strong>Idade:</strong> {{ pet.age }} anos</p>

        <n-space vertical style="margin-top: 8px;">
          <n-button size="small" @click="goToView(pet.id)">Visualizar</n-button>
          <n-button size="small" @click="goToEdit(pet.id)">Editar</n-button>
          <n-button size="small" @click="goToSchedule(pet.id)">Agendar Vacinação</n-button>
          <n-button size="small" @click="goToDelete(pet.id)">Excluir</n-button>
        </n-space>
      </n-card>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import { useRouter } from "vue-router";
import { NButton } from "naive-ui";

interface Pet {
  id: number;
  name: string;
  species: string;
  age: number;
}

const router = useRouter();

const pets = ref<Pet[]>([
  { id: 1, name: "Rex", species: "Cachorro", age: 4 },
  { id: 2, name: "Mimi", species: "Gato", age: 2 }
]);

function goToCreate() {
  router.push("/pets/create");
}
function goToView(id: number) {
  router.push(`/pets/${id}`);
}
function goToEdit(id: number) {
  router.push(`/pets/edit/${id}`);
}
function goToDelete(id: number) {
  if (confirm("Tem certeza que deseja excluir este pet?")) {
    pets.value = pets.value.filter((pet) => pet.id !== id);
    console.log(`Pet com ID ${id} excluído`);
  }
}
function goToSchedule(id: number) {
  router.push(`/schedule/${id}`);
}

// Colunas da tabela (só para desktop)
const columns = [
  { title: "ID", key: "id" },
  { title: "Nome", key: "name" },
  { title: "Espécie", key: "species" },
  { title: "Idade", key: "age" },
  {
    title: "Ações",
    key: "actions",
    render(row: Pet) {
      return h(
        "div",
        { style: "display: flex; gap: 8px; flex-wrap: wrap;" },
        [
          h(
            NButton,
            { size: "small", onClick: () => goToView(row.id) },
            { default: () => "Visualizar" }
          ),
          h(
            NButton,
            { size: "small", onClick: () => goToEdit(row.id) },
            { default: () => "Editar" }
          ),
          h(
            NButton,
            { size: "small", onClick: () => goToSchedule(row.id) },
            { default: () => "Agendar" }
          ),
          h(
            NButton,
            { size: "small", onClick: () => goToDelete(row.id) },
            { default: () => "Excluir" }
          )
        ]
      );
    }
  }
];
</script>

<style scoped>
/* Botão adicionar responsivo */
.add-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
@media (max-width: 768px) {
  .add-btn-wrapper {
    justify-content: center;
  }
}

/* Mostrar tabela só no desktop */
.desktop-table {
  display: block;
}
.mobile-list {
  display: none;
}

@media (max-width: 768px) {
  .desktop-table {
    display: none;
  }
  .mobile-list {
    display: block;
  }
}
</style>
