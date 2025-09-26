<template>
  <n-card title="Lista de Vacinas">
    <div class="add-btn-wrapper">
      <n-button type="primary" @click="goToCreate">
        Adicionar Nova Vacina
      </n-button>
    </div>

    <n-spin :show="loading">
      <n-alert v-if="error" type="error" closable>
        {{ error }}
      </n-alert>

      <!-- Desktop -->
      <div class="desktop-table">
        <n-data-table
          :columns="columns"
          :data="vaccines"
          :scroll="{ x: 'max-content' }"
          style="margin-top: 24px;"
        />
      </div>

      <!-- Mobile -->
      <div class="mobile-list">
        <n-card
          v-for="vaccine in vaccines"
          :key="vaccine.id"
          :title="vaccine.nome"
          style="margin-bottom: 12px;"
        >
          <p><strong>Descrição:</strong> {{ vaccine.descricao }}</p>
          <p><strong>Validade (dias):</strong> {{ vaccine.validade_dias ?? 'Não informada' }}</p>
        </n-card>
      </div>
    </n-spin>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/api"; // ✅ usando axios centralizado

const router = useRouter();

interface Vaccine {
  id: number;
  nome: string;
  descricao: string;
  validade_dias: number | null;
  created_at?: string;
  updated_at?: string;
}

const vaccines = ref<Vaccine[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Carrega vacinas da API
async function fetchVaccines() {
  loading.value = true;
  error.value = null;

  try {
    const response = await api.get("/vacinas");
    vaccines.value = response.data;
  } catch (err: any) {
    console.error("Erro ao buscar vacinas:", err);
    if (err.response?.status === 401) {
      error.value = "Não autorizado. Faça login para continuar.";
    } else {
      error.value = "Erro ao buscar vacinas. Tente novamente mais tarde.";
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchVaccines();
});

function goToCreate() {
  router.push("/vaccines/create");
}

// Tabela para desktop
const columns = [
  { title: "ID", key: "id" },
  { title: "Nome", key: "nome" },
  { title: "Descrição", key: "descricao" },
  {
    title: "Validade (dias)",
    key: "validade_dias",
    render: (row: Vaccine) => row.validade_dias ?? "Não informado",
  },
];
</script>

<style scoped>
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
      