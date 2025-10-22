<template>
  <div class="page-container">
    <n-card 
      title="Lista de Pets"
      class="pets-card"
      :bordered="true"
    >
      <!-- Botão adicionar -->
      <div class="add-btn-wrapper">
        <n-button type="primary" @click="goToCreate" size="large" class="action-btn">
          Adicionar Novo Pet
        </n-button>
      </div>

      <!-- Transição suave -->
      <transition name="fade" mode="out-in">
        <div v-if="!loading && pets.length" key="content">
          <!-- Desktop: tabela -->
          <div class="desktop-table">
            <n-data-table
              :columns="columns"
              :data="pets"
              :scroll="{ x: 'max-content' }"
              style="margin-top: 24px;"
              class="pets-table"
            />
          </div>

          <!-- Mobile: cards -->
          <div class="mobile-list">
            <n-card
              v-for="pet in pets"
              :key="pet.id"
              class="pet-card"
              :title="pet.name"
            >
              <div class="pet-info">
                <div class="info-item">
                  <span class="info-label">Espécie</span>
                  <span class="info-value">{{ pet.species }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Idade</span>
                  <span class="info-value">{{ pet.age }}</span>
                </div>
              </div>

              <div class="mobile-actions">
                <n-button size="small" @click="goToView(pet.id)" class="mobile-btn">Visualizar</n-button>
                <n-button size="small" @click="goToEdit(pet.id)" class="mobile-btn">Editar</n-button>
                <n-button size="small" @click="goToSchedule(pet.id)" class="mobile-btn">Agendar Vacinação</n-button>
                <n-button size="small" type="error" @click="goToDelete(pet.id)" class="mobile-btn">Excluir</n-button>
              </div>
            </n-card>
          </div>

          <!-- Paginação -->
          <div class="pagination">
            <n-button size="small" @click="prevPage" :disabled="currentPage === 1" class="page-btn">Anterior</n-button>
            <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
            <n-button size="small" @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">Próxima</n-button>
          </div>
        </div>
        
        <!-- Loading state -->
        <div v-else-if="loading" key="loading" class="loading-container">
          <n-skeleton height="32px" width="200px" style="margin-bottom: 20px;" />
          <n-skeleton height="20px" :repeat="5" style="margin-bottom: 8px;" />
        </div>

        <!-- Empty state -->
        <div v-else key="empty" class="empty-state">
          <n-empty description="Nenhum pet encontrado">
            <template #extra>
              <n-button size="small" @click="goToCreate">
                Adicionar Primeiro Pet
              </n-button>
            </template>
          </n-empty>
        </div>
      </transition>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { NButton, useMessage, NEmpty } from "naive-ui";

const message = useMessage();
const router = useRouter();

interface Pet {
  id: number;
  name: string;
  species: string;
  age: number | string;
}

const pets = ref<Pet[]>([]);
const currentPage = ref(1);
const perPage = ref(10);
const totalPets = ref(0);
const loading = ref(true); // controle do fade

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
      params: { limit: perPage.value, page },
    });

    let petsArray: any[] = [];
    if (Array.isArray(response.data.items)) {
      petsArray = response.data.items;
      totalPets.value = response.data.count;
    }

    pets.value = petsArray
      .map((pet: any) => ({
        ...pet,
        age: formatarIdade(pet.birthdate),
      }))
      .sort((a, b) => a.id - b.id);

    currentPage.value = page;
  } catch (error) {
    console.error("Erro ao buscar pets:", error);
    message.error("Erro ao carregar pets.");
  } finally {
    // pequeno delay pro fade suave 🩵
    setTimeout(() => (loading.value = false), 400);
  }
}

// Função para formatar idade
function formatarIdade(dataNascimento: string | null): string {
  if (!dataNascimento) return "0 anos";

  const nascimento = new Date(dataNascimento);
  const hoje = new Date();

  let anos = hoje.getFullYear() - nascimento.getFullYear();
  let meses = hoje.getMonth() - nascimento.getMonth();
  const dias = hoje.getDate() - nascimento.getDate();

  if (dias < 0) meses--;
  if (meses < 0) {
    anos--;
    meses += 12;
  }

  if (anos < 1) return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  if (meses === 0) return `${anos} ${anos === 1 ? "ano" : "anos"}`;
  return `${anos} ${anos === 1 ? "ano" : "anos"} e ${meses} ${
    meses === 1 ? "mês" : "meses"
  }`;
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
  { title: "ID", key: "id", width: 80 },
  { title: "Nome", key: "name", width: 150 },
  { title: "Espécie", key: "species", width: 120 },
  { title: "Idade", key: "age", width: 120 },
  {
    title: "Ações",
    key: "actions",
    width: 320, // Aumentei a largura para acomodar melhor os botões
    render(row: Pet) {
      return h("div", { class: "table-actions" }, [
        h(NButton, { 
          size: "small", 
          onClick: () => goToView(row.id),
          class: "action-btn-table"
        }, { default: () => "Visualizar" }),
        h(NButton, { 
          size: "small", 
          onClick: () => goToEdit(row.id),
          class: "action-btn-table"
        }, { default: () => "Editar" }),
        h(NButton, { 
          size: "small", 
          onClick: () => goToSchedule(row.id),
          class: "action-btn-table"
        }, { default: () => "Agendar" }),
        h(NButton, { 
          size: "small", 
          type: "error", 
          onClick: () => goToDelete(row.id),
          class: "action-btn-table"
        }, { default: () => "Excluir" }),
      ]);
    },
  },
];

const totalPages = computed(() => Math.ceil(totalPets.value / perPage.value));
function nextPage() {
  if (currentPage.value < totalPages.value) fetchPets(currentPage.value + 1);
}
function prevPage() {
  if (currentPage.value > 1) fetchPets(currentPage.value - 1);
}

onMounted(() => fetchPets());
</script>

<style scoped>
/* Container da página - APENAS CENTRALIZAÇÃO */
.page-container {
  padding: 20px;
  box-sizing: border-box;
}

/* Container principal - APENAS O CONTEÚDO */
.pets-card {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
  /* Removi min-height e flex properties */
}

.loading-container {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Botão adicionar */
.add-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.action-btn {
  min-width: 160px;
}

/* Tabela desktop */
.pets-table {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.table-actions {
  display: flex;
  gap: 10px; /* Aumentei o gap para melhor espaçamento */
  flex-wrap: wrap;
  align-items: center;
}

.action-btn-table {
  min-width: 75px; /* Largura mínima para consistência */
  flex-shrink: 0; /* Evitar que os botões fiquem muito pequenos */
}

/* Cards mobile */
.mobile-list {
  display: none;
}

.pet-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.pet-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px; /* Aumentei o margin-bottom */
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

/* Container de ações no mobile */
.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Espaçamento consistente entre os botões */
}

.mobile-btn {
  width: 100%;
}

/* Paginação */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px 0;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.page-btn {
  min-width: 80px;
}

/* Transição de fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* RESPONSIVIDADE MOBILE */
@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }
  
  .pets-card {
    border-radius: 8px;
  }
  
  .add-btn-wrapper {
    justify-content: center;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
  }
  
  .desktop-table {
    display: none;
  }
  
  .mobile-list {
    display: block;
  }
  
  .pet-info {
    gap: 10px;
  }
  
  .info-label {
    font-size: 11px;
  }
  
  .info-value {
    font-size: 13px;
  }
  
  .mobile-actions {
    gap: 6px; /* Espaçamento menor no mobile */
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .page-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 8px;
  }
  
  .pets-card {
    border-radius: 6px;
  }
  
  .pet-card {
    margin-bottom: 12px;
  }
  
  .info-label {
    font-size: 10px;
  }
  
  .info-value {
    font-size: 12px;
  }
  
  .mobile-actions {
    gap: 4px; /* Espaçamento mínimo para telas muito pequenas */
  }
}

/* Para telas muito pequenas */
@media (max-width: 320px) {
  .page-container {
    padding: 4px;
  }
  
  .pet-card {
    margin-bottom: 8px;
  }
}

/* Estilos para a tabela no desktop */
.pets-table :deep(.n-data-table-table) {
  border-radius: 8px;
}

.pets-table :deep(.n-data-table-th) {
  background-color: #f8f9fa;
  font-weight: 600;
}

.pets-table :deep(.n-data-table-td) {
  padding: 12px 16px;
}

.pets-table :deep(.n-button) {
  font-size: 12px;
}

/* Melhorias específicas para os botões de ação na tabela */
.pets-table :deep(.table-actions .n-button) {
  margin: 2px; /* Pequena margem extra para evitar sobreposição */
}
</style>