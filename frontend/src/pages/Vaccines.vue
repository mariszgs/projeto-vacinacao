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
    </div>

    <!-- Mobile: cards -->
    <div class="mobile-list">
      <n-card
        v-for="vaccine in vaccines"
        :key="vaccine.id"
        style="margin-bottom: 12px;"
        :title="vaccine.name"
      >
        <p><strong>Descrição:</strong> {{ vaccine.description }}</p>
        <p><strong>Obrigatória:</strong> {{ vaccine.isMandatory ? 'Sim' : 'Não' }}</p>
        <p><strong>Última Aplicação:</strong> {{ formatDateBR(vaccine.lastApplied) }}</p>
        <p><strong>Intervalo:</strong> {{ vaccine.applicationInterval }}</p>
        <p><strong>Status:</strong> {{ vaccine.status }}</p>
      </n-card>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

interface Vaccine {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  isMandatory: boolean;
  lastApplied: string;
  applicationInterval: string;
  status: string;
}

const router = useRouter();

const vaccines = ref<Vaccine[]>([
  {
    id: 1,
    name: "Vacina Raiva",
    description: "Prevenção contra a raiva em cães e gatos.",
    createdAt: "2000-01-01",
    isMandatory: true,
    lastApplied: "2023-01-15",
    applicationInterval: "1 ano",
    status: "Em circulação",
  },
  {
    id: 2,
    name: "Vacina V8",
    description: "Protege contra 8 doenças em cães.",
    createdAt: "2010-03-10",
    isMandatory: true,
    lastApplied: "2022-12-20",
    applicationInterval: "1 ano",
    status: "Em circulação",
  },
  {
    id: 3,
    name: "Vacina V3",
    description: "Vacina para gatos que previne várias doenças.",
    createdAt: "2005-05-30",
    isMandatory: false,
    lastApplied: "2022-09-12",
    applicationInterval: "1 ano",
    status: "Em circulação",
  },
]);

function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function goToCreate() {
  router.push("/vaccines/create");
}

// Colunas da tabela para desktop, sem a coluna de ações
const columns = [
  { title: "ID", key: "id" },
  { title: "Nome", key: "name" },
  { title: "Descrição", key: "description" },
  {
    title: "Data de Criação",
    key: "createdAt",
    render: (row: Vaccine) => formatDateBR(row.createdAt),
  },
  {
    title: "Obrigatória",
    key: "isMandatory",
    render: (row: Vaccine) => (row.isMandatory ? "Sim" : "Não"),
  },
  {
    title: "Última Aplicação",
    key: "lastApplied",
    render: (row: Vaccine) => formatDateBR(row.lastApplied),
  },
  { title: "Intervalo de Aplicação", key: "applicationInterval" },
  { title: "Status", key: "status" },
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
