<template>
  <div class="page-container">
    <n-card 
      title="Detalhes da Vacina"
      class="vaccine-detail-card"
      :bordered="true"
    >
      <!-- Transição suave -->
      <transition name="fade" mode="out-in">
        <div v-if="vaccine" key="content">
          <!-- Cabeçalho -->
          <div class="vaccine-header">
            <div class="vaccine-icon">
              <n-icon size="48" color="#18a058">
                💉
              </n-icon>
            </div>
            <div class="vaccine-title">
              <h2 class="vaccine-name">{{ vaccine.nome }}</h2>
              <p class="vaccine-subtitle">Informações detalhadas da vacina</p>
            </div>
          </div>

          <n-divider class="custom-divider" />

          <!-- Informações da Vacina -->
          <div class="vaccine-info">
            <div class="info-section">
              <h3 class="section-title">Informações Básicas</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Nome</span>
                  <span class="info-value">{{ vaccine.nome }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Data de Validade</span>
                  <span class="info-value" :class="{ 'no-info': !vaccine.validade }">
                    {{ vaccine.validade ? formatDateBR(vaccine.validade) : 'Não informada' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h3 class="section-title">Descrição</h3>
              <n-card class="description-card">
                <p class="description-text" v-if="vaccine.descricao">{{ vaccine.descricao }}</p>
                <p class="no-info" v-else>Nenhuma descrição informada</p>
              </n-card>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="action-buttons">
            <n-button 
              type="primary" 
              @click="goToEdit(vaccine.id)"
              size="large"
              class="action-btn"
            >
              Editar Vacina
            </n-button>
            <n-button 
              @click="goBack" 
              size="large"
              class="action-btn"
            >
              Voltar
            </n-button>
          </div>
        </div>

        <!-- Loading state -->
        <div v-else key="loading" class="loading-container">
          <n-skeleton height="32px" width="200px" style="margin-bottom: 20px;" />
          <n-skeleton height="20px" :repeat="3" style="margin-bottom: 8px;" />
        </div>
      </transition>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useMessage, NButton, NSpace, NCard, NDivider } from "naive-ui";

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
  return date.toLocaleDateString('pt-BR');
}

async function fetchVaccine() {
  const id = route.params.id;
  if (!id) {
    console.error("ID da vacina não encontrado na rota");
    message.error("ID da vacina não encontrado");
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

function goToEdit(vaccineId: number) {
  router.push(`/vaccines/edit/${vaccineId}`);
}

onMounted(() => fetchVaccine());
</script>

<style scoped>
/* Container da página - APENAS ESPAÇAMENTO */
.page-container {
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

/* Container principal */
.vaccine-detail-card {
  width: 100%;
  max-width: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

/* Cabeçalho da vacina */
.vaccine-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.vaccine-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 2px solid #e0f2fe;
}

.vaccine-title {
  flex: 1;
}

.vaccine-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.vaccine-subtitle {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.custom-divider {
  margin: 20px 0;
}

/* Informações da vacina */
.vaccine-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
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

.no-info {
  color: #9ca3af;
  font-style: italic;
}

/* Descrição */
.description-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.description-text {
  margin: 0;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-wrap;
}

/* Botões de ação */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  min-width: 140px;
}

.loading-container {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
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
    align-items: flex-start;
  }
  
  .vaccine-detail-card {
    margin: 0;
    border-radius: 8px;
    max-width: none;
  }
  
  .vaccine-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .vaccine-icon {
    align-self: center;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 8px;
  }
  
  .vaccine-detail-card {
    border-radius: 6px;
  }
  
  .vaccine-name {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 16px;
  }
}

/* Para telas muito pequenas */
@media (max-width: 320px) {
  .page-container {
    padding: 4px;
  }
  
  .vaccine-name {
    font-size: 18px;
  }
}
</style>