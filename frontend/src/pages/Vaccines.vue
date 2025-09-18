<template>
  <n-card title="Lista de Vacinas" style="position: relative;">
    <n-data-table
      :columns="columns"
      :data="vaccines"
      style="margin-top: 48px;"
      :scroll="{ x: '100%' }"
    />
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

interface Vaccine {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  isMandatory: boolean;
  lastApplied: string;
  applicationInterval: string;
  status: string;
  type?: string;
}

const router = useRouter();

// Dados simulados
const vaccines = ref<Vaccine[]>([
  {
    id: 1,
    name: 'Vacina Raiva',
    description: 'Prevenção contra a raiva em cães e gatos.',
    createdAt: '2000-01-01',
    isMandatory: true,
    lastApplied: '2023-01-15',
    applicationInterval: '1 ano',
    status: 'Em circulação',
  },
  {
    id: 2,
    name: 'Vacina V8',
    description: 'Protege contra 8 doenças em cães.',
    createdAt: '2010-03-10',
    isMandatory: true,
    lastApplied: '2022-12-20',
    applicationInterval: '1 ano',
    status: 'Em circulação',
  },
  {
    id: 3,
    name: 'Vacina V3',
    description: 'Vacina para gatos que previne várias doenças.',
    createdAt: '2005-05-30',
    isMandatory: false,
    lastApplied: '2022-09-12',
    applicationInterval: '1 ano',
    status: 'Em circulação',
  }
]);

// Função para formatar datas no padrão brasileiro
function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Definindo as colunas da tabela com datas formatadas
const columns = [
  { title: 'ID', key: 'id' },
  { title: 'Nome', key: 'name' },
  { title: 'Descrição', key: 'description' },
  { 
    title: 'Data de Criação', 
    key: 'createdAt', 
    render: (row: Vaccine) => formatDateBR(row.createdAt)
  },
  { 
    title: 'Obrigatória', 
    key: 'isMandatory', 
    render: (row: Vaccine) => row.isMandatory ? 'Sim' : 'Não' 
  },
  { 
    title: 'Última Aplicação', 
    key: 'lastApplied',
    render: (row: Vaccine) => formatDateBR(row.lastApplied)
  },
  { title: 'Intervalo de Aplicação', key: 'applicationInterval' },
  { title: 'Status', key: 'status' },
];

// Função para redirecionar para detalhes da vacina
function goToView(id: number) {
  router.push(`/vaccines/${id}`);
}
</script>

<style scoped>
n-card {
  max-width: 800px;
  margin: 20px auto;
}

n-button {
  margin-top: 16px;
}
</style>
