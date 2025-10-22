<template>
  <n-card 
    title="Lista de Vacinas"
    class="vaccines-card"
    :bordered="true"
  >
    <div class="add-btn-wrapper">
      <n-button type="primary" @click="goToCreate" size="large" class="action-btn">
        Adicionar Nova Vacina
      </n-button>
    </div>

    <!-- v-if e o v-else dentro do mesmo <transition> -->
    <transition name="fade" mode="out-in">
      <div v-if="!loading && vaccines.length" key="table-content">
        <!-- Desktop: tabela -->
        <div class="desktop-table">
          <n-data-table
            :columns="columns"
            :data="vaccines"
            :scroll="{ x: 'max-content' }"
            style="margin-top: 24px;"
            class="vaccines-table"
          />
        </div>

        <!-- Mobile: cards -->
        <div class="mobile-list">
          <n-card
            v-for="vaccine in vaccines"
            :key="vaccine.id"
            class="vaccine-card"
            :title="vaccine.nome"
          >
            <div class="vaccine-info">
              <div class="info-item">
                <span class="info-label">Descrição</span>
                <span class="info-value">{{ truncated(vaccine.descricao, 30) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Validade</span>
                <span class="info-value">{{ vaccine.validade ? formatDateBR(vaccine.validade) : "Não informada" }}</span>
              </div>
            </div>

            <div class="mobile-actions">
              <n-button size="small" @click="goToView(vaccine.id)" class="mobile-btn">Visualizar</n-button>
              <n-button size="small" @click="goToEdit(vaccine.id)" class="mobile-btn">Editar</n-button>
              <n-button size="small" type="error" @click="goToDelete(vaccine.id)" class="mobile-btn">Excluir</n-button>
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

      <!-- Estado de carregamento -->
      <div v-else-if="loading" key="loading" class="loading-container">
        <n-skeleton height="32px" width="200px" style="margin-bottom: 20px;" />
        <n-skeleton height="20px" :repeat="5" style="margin-bottom: 8px;" />
      </div>

      <!-- Estado vazio -->
      <div v-else key="empty" class="empty-state">
        <n-empty description="Nenhuma vacina encontrada">
          <template #extra>
            <n-button size="small" @click="goToCreate">
              Adicionar Primeira Vacina
            </n-button>
          </template>
        </n-empty>
      </div>
    </transition>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { NButton, useMessage, NEmpty } from "naive-ui";

const message = useMessage();
const router = useRouter();

interface Vaccine {
  id: number;
  nome: string;
  descricao: string;
  validade: string | null;
}

const vaccines = ref<Vaccine[]>([]);
const currentPage = ref(1);
const perPage = ref(10);
const totalVaccines = ref(0);
const loading = ref(true);

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

function formatDateBR(dateString: string | null) {
  if (!dateString) return "Não informada";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("pt-BR");
}

function truncated(text: string, max = 30) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

async function fetchVaccines(page = 1) {
  loading.value = true;
  try {
    const response = await api.get("/vacinas", {
      params: { limit: perPage.value, page },
    });

    let items: any[] = [];
    if (Array.isArray(response.data.items)) {
      items = response.data.items;
      totalVaccines.value = response.data.count;
    }

    vaccines.value = items.sort((a, b) => a.id - b.id);
    currentPage.value = page;
  } catch (error) {
    console.error("Erro ao buscar vacinas:", error);
    message.error("Erro ao carregar vacinas.");
  } finally {
    setTimeout(() => (loading.value = false), 300);
  }
}

async function goToDelete(id: number) {
  if (confirm("Tem certeza que deseja excluir esta vacina?")) {
    try {
      const response = await api.delete(`/vacinas/${id}`);
      vaccines.value = vaccines.value.filter((v) => v.id !== id);
      message.success(response.data.message || "Vacina excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir vacina:", error);
      message.error("Erro ao excluir vacina.");
    }
  }
}

function goToCreate() {
  router.push("/vaccines/create");
}
function goToView(id: number) {
  router.push(`/vaccines/view/${id}`);
}
function goToEdit(id: number) {
  router.push(`/vaccines/edit/${id}`);
}

const columns = [
  { title: "ID", key: "id", width: 80 },
  { title: "Nome", key: "nome", width: 150 },
  {
    title: "Descrição",
    key: "descricao",
    width: 200,
    render(row: Vaccine) {
      return h("span", truncated(row.descricao, 30));
    },
  },
  {
    title: "Validade",
    key: "validade",
    width: 120,
    render(row: Vaccine) {
      return formatDateBR(row.validade);
    },
  },
  {
    title: "Ações",
    key: "actions",
    width: 280,
    render(row: Vaccine) {
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
          type: "error", 
          onClick: () => goToDelete(row.id),
          class: "action-btn-table"
        }, { default: () => "Excluir" }),
      ]);
    },
  },
];

const totalPages = computed(() => Math.ceil(totalVaccines.value / perPage.value));

function nextPage() {
  if (currentPage.value < totalPages.value) fetchVaccines(currentPage.value + 1);
}
function prevPage() {
  if (currentPage.value > 1) fetchVaccines(currentPage.value - 1);
}

onMounted(() => fetchVaccines());
</script>

<style scoped>
/* Container da página - APENAS ESPAÇAMENTO */
.page-container {
  padding: 20px;
  box-sizing: border-box;
}

/* Container principal - APENAS O CONTEÚDO */
.vaccines-card {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
  /* Sem height fixo - altura automática pelo conteúdo */
}

.loading-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
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
.vaccines-table {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.table-actions {
  display: flex;
  gap: 12px; /* Aumentei o gap para melhor espaçamento */
  flex-wrap: wrap;
  align-items: center;
}

.action-btn-table {
  min-width: 80px; /* Largura mínima para consistência */
  flex-shrink: 0; /* Evita que os botões fiquem muito pequenos */
}

/* Cards mobile */
.mobile-list {
  display: none;
}

.vaccine-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.vaccine-info {
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
  word-break: break-word;
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
  
  .vaccines-card {
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
  
  .vaccine-info {
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
  
  .vaccines-card {
    border-radius: 6px;
  }
  
  .vaccine-card {
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
  
  .vaccine-card {
    margin-bottom: 8px;
  }
}

/* Estilos para a tabela no desktop */
.vaccines-table :deep(.n-data-table-table) {
  border-radius: 8px;
}

.vaccines-table :deep(.n-data-table-th) {
  background-color: #f8f9fa;
  font-weight: 600;
}

.vaccines-table :deep(.n-data-table-td) {
  padding: 12px 16px;
}

.vaccines-table :deep(.n-button) {
  font-size: 12px;
}

/* Melhorias específicas para os botões de ação na tabela */
.vaccines-table :deep(.table-actions .n-button) {
  margin: 2px; /* Pequena margem extra para evitar sobreposição */
}
</style>