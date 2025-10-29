<template>
  <div class="page-container">
    <n-card 
      class="edit-vaccine-card"
      :bordered="true"
    >
      <transition name="fade" mode="out-in">
        <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="large" class="vaccine-form">
          
          <!-- Cabeçalho -->
          <div class="form-header">
            <h2 class="form-title">Editar Vacina</h2>
            <p class="form-subtitle">Atualize as informações da vacina</p>
          </div>

          <n-divider class="custom-divider" />

          <!-- Formulário -->
          <div class="form-section">
            <div class="form-grid">
              <!-- Nome -->
              <n-form-item label="Nome" path="nome" class="form-item">
                <n-input 
                  v-model:value="form.nome" 
                  placeholder="Digite o nome da vacina"
                  size="large"
                />
              </n-form-item>

              <!-- Descrição -->
              <n-form-item label="Descrição" path="descricao" class="form-item full-width">
                <n-input 
                  v-model:value="form.descricao" 
                  type="textarea" 
                  placeholder="Digite a descrição"
                  :rows="4"
                  size="large"
                />
              </n-form-item>

              <!-- Data de Validade -->
              <n-form-item label="Data de Validade" path="validade" class="form-item">
                <n-date-picker 
                  v-model:value="form.validade" 
                  type="date" 
                  placeholder="Selecione a data"
                  format="dd/MM/yyyy" 
                  value-format="timestamp" 
                  :disabled-date="disablePastDates"
                  size="large"
                  style="width: 100%"
                />
              </n-form-item>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="action-buttons">
            <n-button 
              type="primary" 
              @click="submit" 
              size="large"
              class="action-btn"
              :loading="submitting"
            >
              Salvar Alterações
            </n-button>
            <n-button 
              @click="cancel" 
              size="large"
              class="action-btn"
              :disabled="submitting"
            >
              Cancelar
            </n-button>
          </div>
        </n-form>
      </transition>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { NForm, NFormItem, NInput, NButton, NDatePicker, useMessage } from "naive-ui";
import type { FormRules, FormInst } from "naive-ui";

const route = useRoute();
const router = useRouter();
const message = useMessage();
const submitting = ref(false);
const loading = ref(true);

const formRef = ref<FormInst | null>(null);

const form = reactive({
  nome: "",
  descricao: "",
  validade: null as number | null
});

const rules: FormRules = {
  nome: [
    { required: true, message: "Nome obrigatório", trigger: ["blur", "input"] }
  ],
  validade: [
    { 
      required: true, 
      message: "Data de validade obrigatória", 
      trigger: ["blur", "change"],
      validator: (rule: any, value: number | null) => {
        return !!value
      }
    }
  ]
};

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { 
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
});

function disablePastDates(date: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today.getTime();
}

function stringToTimestamp(dateString: string | null): number | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString + 'T12:00:00'); // Meio-dia para evitar problemas de timezone
    return date.getTime();
  } catch (error) {
    console.error('Erro ao converter data:', error);
    return null;
  }
}

function timestampToString(timestamp: number | null): string | null {
  if (!timestamp) return null;
  try {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Erro ao converter timestamp:', error);
    return null;
  }
}

async function fetchVaccine() {
  try {
    const id = route.params.id;
    
    const response = await api.get(`/vacinas/${id}`);
    const data = response.data.data || response.data;

    form.nome = data.nome || "";
    form.descricao = data.descricao || "";
    form.validade = stringToTimestamp(data.validade);

    console.log("✅ Formulário carregado:", {
      nome: form.nome,
      descricao: form.descricao,
      validade: form.validade,
      dataSelecionada: form.validade ? new Date(form.validade).toLocaleDateString('pt-BR') : 'nula'
    });
    
  } catch (error: any) {
    console.error("❌ Erro ao buscar vacina:", error);
    
    if (error.response?.status === 404) {
      message.error("Vacina não encontrada.");
      router.push("/vaccines");
    } else if (error.response?.status === 401) {
      message.error("Sessão expirada. Faça login novamente.");
      router.push("/login");
    } else {
      message.error("Não foi possível carregar a vacina.");
    }
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!formRef.value) return;

  submitting.value = true;
  try {
    await formRef.value.validate();

    const id = route.params.id;
    
    const payload = { 
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null, 
      validade: timestampToString(form.validade)
    };

    console.log("📤 Enviando para API:", payload);

    const response = await api.put(`/vacinas/${id}`, payload);

    console.log("✅ Vacina atualizada:", response.data);

    message.success("Vacina atualizada com sucesso!");
    
    router.push("/vaccines");
    
  } catch (error: any) {
    console.error("❌ Erro:", error);
    
    if (error.response?.status === 422) {
      const errors = error.response.data?.errors;
      if (errors?.validade) {
        message.error(errors.validade[0]);
      } else if (errors?.nome) {
        message.error(errors.nome[0]);
      } else {
        message.error("Erro de validação nos dados.");
      }
    } 
    else if (error.response?.status === 404) {
      message.error("Vacina não encontrada.");
    }
    else if (error.response?.status === 401) {
      message.error("Sessão expirada. Faça login novamente.");
      router.push("/login");
    }
    else {
      message.error("Erro ao atualizar vacina.");
    }
  } finally {
    submitting.value = false;
  }
}

function cancel() { 
  router.push("/vaccines"); 
}

onMounted(() => {
  fetchVaccine();
});
</script>

<style scoped>
.page-container {
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

.edit-vaccine-card {
  width: 100%;
  max-width: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

.form-header {
  margin-bottom: 20px;
  text-align: center;
}

.form-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.form-subtitle {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.custom-divider {
  margin: 20px 0;
}

.vaccine-form {
  width: 100%;
}

.form-section {
  margin-bottom: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.form-item {
  margin-bottom: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  min-width: 160px;
}

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

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
    align-items: flex-start;
  }
  
  .edit-vaccine-card {
    margin: 0;
    border-radius: 8px;
    max-width: none;
  }
  
  .form-header {
    text-align: left;
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
  
  .edit-vaccine-card {
    border-radius: 6px;
  }
  
  .form-title {
    font-size: 20px;
  }
}
</style>