<template>
  <n-card title="Detalhes da Vacina" style="max-width: 600px; margin: 20px auto;">
    <div v-if="vaccine">
      <p><strong>Nome:</strong> {{ vaccine.nome }}</p>
      <p><strong>Descrição:</strong> {{ vaccine.descricao }}</p>
      <p><strong>Data de Validade:</strong> {{ vaccine.validade ? formatDateBR(vaccine.validade) : 'Não informada' }}</p>

      <n-space style="margin-top: 16px; display: flex; justify-content: flex-end;">
        <n-button type="primary" @click="goBack">Voltar</n-button>
      </n-space>
    </div>
    <div v-else style="text-align:center; padding:20px;">
      Carregando...
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useMessage, NButton, NSpace, NCard } from "naive-ui";

const message = useMessage();
const router = useRouter();
const route = useRoute();

interface Vaccine {
  id: number;
  nome: string;
  descricao: string;
  validade: string | null;
}

const vaccine = ref<Vaccine | null>(null);

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function formatDateBR(dateString: string | null) {
  if (!dateString) return "Não informada";
  const date = new Date(dateString + "T00:00:00");
  return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getFullYear()}`;
}

async function fetchVaccine() {
  const id = route.params.id;
  if (!id) {
    console.error("ID da vacina não encontrado na rota");
    return;
  }
  try {
    const response = await api.get(`/vacinas/${id}`);
    vaccine.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar vacina:", error);
    message.error("Erro ao carregar a vacina.");
  }
}

function goBack() {
  router.back();
}

onMounted(() => fetchVaccine());
</script>

<style scoped>
n-card {
  padding: 16px;
}
</style>
