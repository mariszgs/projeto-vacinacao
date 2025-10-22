<template>
  <div class="page-container">
    <n-card 
      class="add-vaccine-card"
      :bordered="true"
    >
      <!-- Transição suave -->
      <transition name="fade" mode="out-in">
        <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="large" class="vaccine-form">
          
          <!-- Cabeçalho -->
          <div class="form-header">
            <div class="form-title-content">
              <h2 class="form-title">Adicionar Nova Vacina</h2>
              <p class="form-subtitle">Cadastre uma nova vacina no sistema</p>
            </div>
          </div>

          <n-divider class="custom-divider" />

          <!-- Formulário -->
          <div class="form-section">
            <div class="form-grid">
              <!-- Nome da Vacina -->
              <n-form-item label="Nome da Vacina" path="name" class="form-item">
                <n-input 
                  v-model:value="form.name" 
                  placeholder="Digite o nome da vacina"
                  size="large"
                />
              </n-form-item>

              <!-- Descrição -->
              <n-form-item label="Descrição" path="description" class="form-item full-width">
                <n-input
                  type="textarea"
                  v-model:value="form.description"
                  placeholder="Descreva a vacina"
                  :rows="4"
                  size="large"
                />
              </n-form-item>

              <!-- Data de Validade -->
              <n-form-item label="Data de Validade" path="expirationDate" class="form-item">
                <n-date-picker
                  v-model:value="form.expirationDate"
                  type="date"
                  value-format="timestamp"
                  placeholder="Selecione a data de validade"
                  :disabled-date="disablePastDates"
                  format="dd/MM/yyyy"
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
              @click="submitForm" 
              size="large"
              class="action-btn"
              :loading="submitting"
            >
              Cadastrar Vacina
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useMessage, type FormInst } from 'naive-ui'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const submitting = ref(false)

const form = reactive({
  name: '',
  description: '',
  expirationDate: null as number | null // timestamp
})

const rules = {
  name: [
    { required: true, message: 'O nome da vacina é obrigatório', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'A descrição é obrigatória', trigger: 'blur' }
  ],
}

function disablePastDates(date: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today.getTime()
}

// converte timestamp para YYYY-MM-DD
function formatDateForBackend(timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function submitForm() {
  if (!formRef.value) return

  submitting.value = true
  try {
    await formRef.value.validate()

    const payload: any = {
      nome: form.name,
      descricao: form.description,
    }

    if (form.expirationDate != null) {
      payload.validade = formatDateForBackend(form.expirationDate)
    }

    const token = localStorage.getItem('token')
    if (!token) {
      message.error('Usuário não autenticado.')
      return
    }

    await axios.post('http://localhost:8000/api/vacinas', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    message.success(`Vacina "${form.name}" cadastrada com sucesso!`)
    cancel()
  } catch (error: any) {
    console.error('Erro ao salvar vacina:', error)
    if (error.response?.status === 401) {
      message.error('Não autorizado. Verifique seu token.')
    } else {
      message.error('Erro ao cadastrar vacina.')
    }
  } finally {
    submitting.value = false
  }
}

function cancel() {
  router.push('/vaccines')
}
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
.add-vaccine-card {
  width: 100%;
  max-width: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

/* Cabeçalho do formulário */
.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.form-title-content {
  flex: 1;
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

/*  RESPONSIVIDADE MOBILE */
@media (max-width: 768px) {
  .page-container {
    padding: 12px;
    align-items: flex-start;
  }
  
  .add-vaccine-card {
    margin: 0;
    border-radius: 8px;
    max-width: none;
  }
  
  .form-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
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
  
  .add-vaccine-card {
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