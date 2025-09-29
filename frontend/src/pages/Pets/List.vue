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
          <n-button size="small" type="error" @click="goToDelete(pet.id)">Excluir</n-button>
        </n-space>
      </n-card>
    </div>

    <!-- Paginação -->
    <div class="pagination" style="margin-top: 16px; display:flex; gap:8px; justify-content:center;">
      <n-button size="small" @click="prevPage" :disabled="currentPage === 1">Anterior</n-button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <n-button size="small" @click="nextPage" :disabled="currentPage === totalPages">Próxima</n-button>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { NButton, useMessage } from "naive-ui";

const message = useMessage();
const router = useRouter();

interface Pet {
  id: number;
  name: string;
  species: string;
  age: number;
}

const pets = ref<Pet[]>([]);
const currentPage = ref(1);
const perPage = ref(10);
const totalPets = ref(0);

// Axios com header Authorization
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Buscar pets do backend com paginação
async function fetchPets(page = 1) {
  try {
    const response = await api.get("/pets", {
      params: { limit: perPage.value, page }
    });

    let petsArray: any[] = [];
    if (Array.isArray(response.data.items)) {
      petsArray = response.data.items;
      totalPets.value = response.data.count;
    }

    pets.value = petsArray.map((pet: any) => ({
      ...pet,
      age: calcularIdade(pet.birthdate),
    }));

    currentPage.value = page;
  } catch (error) {
    console.error("Erro ao buscar pets:", error);
    message.error("Erro ao carregar pets.");
  }
}

// Calcular idade baseado na data de nascimento
function calcularIdade(dataNascimento: string | null): number {
  if (!dataNascimento) return 0;
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

// Excluir pet
async function goToDelete(id: number) {
  if (confirm("Tem certeza que deseja excluir este pet?")) {
    try {
      const response = await api.delete(`/pets/${id}`);
      pets.value = pets.value.filter((pet) => pet.id !== id);
      message.success(response.data.message || "Pet excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir pet:", error);
      message.error("Erro ao excluir pet.");
    }
  }
}

// Navegação
function goToCreate() {
  router.push("/pets/create");
}
function goToView(id: number) {
  router.push(`/pets/${id}`);
}
function goToEdit(id: number) {
  router.push(`/pets/edit/${id}`);
}
function goToSchedule(id: number) {
  router.push(`/schedule/${id}`);
}

// Tabela (desktop)
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
          h(NButton, { size: "small", onClick: () => goToView(row.id) }, { default: () => "Visualizar" }),
          h(NButton, { size: "small", onClick: () => goToEdit(row.id) }, { default: () => "Editar" }),
          h(NButton, { size: "small", onClick: () => goToSchedule(row.id) }, { default: () => "Agendar" }),
          h(NButton, { size: "small", type: "error", onClick: () => goToDelete(row.id) }, { default: () => "Excluir" })
        ]
      );
    }
  }
];

// Paginação
const totalPages = computed(() => Math.ceil(totalPets.value / perPage.value));
function nextPage() {
  if (currentPage.value < totalPages.value) fetchPets(currentPage.value + 1);
}
function prevPage() {
  if (currentPage.value > 1) fetchPets(currentPage.value - 1);
}

// Carrega os pets ao montar
onMounted(() => fetchPets());
</script>

<style scoped>
.add-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
@media (max-width: 768px) {
  .add-btn-wrapper { justify-content: center; }
}

.desktop-table { display: block; }
.mobile-list { display: none; }
@media (max-width: 768px) {
  .desktop-table { display: none; }
  .mobile-list { display: block; }
}
</style>
