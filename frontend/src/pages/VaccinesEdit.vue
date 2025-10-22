<template>
  <div class="page-container">
    <n-card 
      title="Editar Vacina"
      class="edit-vaccine-card"
      :bordered="true"
    >
      <!-- Transição suave -->
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { NForm, NFormItem, NInput, NButton, NDatePicker, useMessage } from "naive-ui";
import type { FormRules } from "naive-ui";

const route = useRoute();
const router = useRouter();
const message = useMessage();
const submitting = ref(false);

const formRef = ref<InstanceType<typeof NForm>>();

const form = ref({
  nome: "",
  descricao: "",
  validade: null as number | null
});

const rules: FormRules = {
  nome: [
    { required: true, message: "Nome obrigatório", trigger: "blur" }, 
    { max: 255, message: "Máximo 255 caracteres" }
  ],
  descricao: [],
  validade: []
};

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

async function fetchVaccine() {
  try {
    const id = route.params.id;
    const res = await api.get(`/vacinas/${id}`);
    const data = res.data;

    form.value.nome = data.nome;
    form.value.descricao = data.descricao;
    form.value.validade = data.validade ? new Date(data.validade + "T00:00:00").getTime() : null;
  } catch (error) {
    console.error(error);
    message.error("Não foi possível carregar a vacina.");
  }
}

async function submit() {
  submitting.value = true;
  try {
    await formRef.value?.validate();
    const id = route.params.id;

    const validadeAjustada = form.value.validade
      ? (() => { const d = new Date(form.value.validade); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })()
      : null;

    const payload = { 
      nome: form.value.nome, 
      descricao: form.value.descricao, 
      validade: validadeAjustada 
    };

    await api.put(`/vacinas/${id}`, payload);

    message.success("Vacina atualizada com sucesso!");
    router.push("/vaccines");
  } catch (error: any) {
    console.error(error);
    message.error(error.response?.data?.message || "Erro ao atualizar vacina.");
  } finally {
    submitting.value = false;
  }
}

function cancel() { 
  router.push("/vaccines"); 
}

onMounted(fetchVaccine);
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
.edit-vaccine-card {
  width: 100%;
  max-width: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

/* Cabeçalho do formulário */
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

/* Formulário */
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
  min-width: 160px;
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

/* Para telas muito pequenas */
@media (max-width: 320px) {
  .page-container {
    padding: 4px;
  }
  
  .form-title {
    font-size: 18px;
  }
}
</style>