<template>
  <n-card title="Lista de Vacinas">
    <!-- Botão adicionar -->
    <div class="add-btn-wrapper">
      <n-button type="primary" @click="goToCreate">
        Adicionar Nova Vacina
      </n-button>
    </div>

    <!-- Desktop: tabela -->
    <div class="desktop-table">
      <n-data-table
        :columns="columns"
        :data="vaccines"
        :scroll="{ x: 'max-content' }"
        style="margin-top: 24px;"
      />
      <!-- Paginação -->
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-size="perPage"
        :show-size-picker="false"
        style="margin-top:16px; display:flex; justify-content:center;"
        @update:page="fetchVaccines"
      />
    </div>

    <!-- Mobile: cards -->
    <div class="mobile-list">
      <n-card
        v-for="vaccine in vaccines"
        :key="vaccine.id"
        style="margin-bottom: 12px;"
        :title="vaccine.nome"
      >
        <p><strong>Descrição:</strong> {{ vaccine.descricao }}</p>
        <p><strong>Data de Validade:</strong>
          {{ vaccine.validade ? formatDateBR(vaccine.validade) : 'Não informada' }}
        </p>

        <n-space style="margin-top: 8px;">
          <n-button
            size="small"
            type="info"
            @click="goToEdit(vaccine.id)"
          >
            Editar
          </n-button>
          <n-button
            size="small"
            type="error"
            @click="goToDelete(vaccine.id)"
          >
            Excluir
          </n-button>
        </n-space>
      </n-card>
      <!-- Paginação mobile -->
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-size="perPage"
        :show-size-picker="false"
        style="margin-top:16px; display:flex; justify-content:center;"
        @update:page="fetchVaccines"
      />
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { NButton, NPagination, useMessage } from "naive-ui";

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

// Axios com header Authorization
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Formata data para DD-MM-YYYY
function formatDateBR(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Buscar vacinas com paginação
async function fetchVaccines(page = currentPage.value) {
  try {
    const response = await api.get("/vacinas", {
      params: { limit: perPage.value, page }
    });

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    vaccines.value = items;
    totalVaccines.value = response.data.count ?? 0;
    currentPage.value = page;
  } catch (error) {
    console.error("Erro ao buscar vacinas:", error);
    vaccines.value = [];
    totalVaccines.value = 0;
    message.error("Erro ao carregar vacinas.");
  }
}

// Excluir vacina
async function goToDelete(id: number) {
  if (!confirm("Tem certeza que deseja excluir esta vacina?")) return;

  try {
    const response = await api.delete(`/vacinas/${id}`);
    if (response.status === 200 || response.status === 204) {
      vaccines.value = vaccines.value.filter((v) => v.id !== id);
      message.success(response.data?.message || "Vacina excluída com sucesso!");
    } else {
      message.error("Não foi possível excluir a vacina.");
      console.warn("DELETE retornou:", response);
    }
  } catch (error: any) {
    console.error("Erro ao excluir vacina:", error);
    const msg = error.response?.data?.message || "Erro ao excluir vacina.";
    message.error(msg);
  }
}

// Navegação
function goToCreate() {
  router.push("/vaccines/create");
}

function goToEdit(id: number) {
  router.push(`/vaccines/edit/${id}`);
}

// Tabela (desktop)
const columns = [
  { title: "ID", key: "id" },
  { title: "Nome", key: "nome" },
  { title: "Descrição", key: "descricao" },
  {
    title: "Data de Validade",
    key: "validade",
    render: (row: Vaccine) =>
      row.validade ? formatDateBR(row.validade) : "Não informada",
  },
  {
    title: "Ações",
    key: "actions",
    render(row: Vaccine) {
      return h(
        "div",
        { style: "display:flex; gap:8px;" },
        [
          h(
            NButton,
            { size: "small", type: "info", onClick: () => goToEdit(row.id) },
            { default: () => "Editar" }
          ),
          h(
            NButton,
            { size: "small", type: "error", onClick: () => goToDelete(row.id) },
            { default: () => "Excluir" }
          )
        ]
      );
    },
  },
];

// Paginação
const totalPages = computed(() => Math.ceil(totalVaccines.value / perPage.value));

// Carrega vacinas ao montar
onMounted(() => fetchVaccines());
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
