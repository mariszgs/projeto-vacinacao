<template>
  <div class="page-container">
    <n-card 
      class="add-vaccine-card"
      :bordered="true"
    >
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
              <n-form-item label="Nome da Vacina" path="nome" class="form-item">
                <n-input 
                  v-model:value="form.nome" 
                  placeholder="Digite o nome da vacina"
                  size="large"
                />
              </n-form-item>

              <!-- Descrição -->
              <n-form-item label="Descrição" path="descricao" class="form-item full-width">
                <n-input
                  type="textarea"
                  v-model:value="form.descricao"
                  placeholder="Descreva a vacina (opcional)"
                  :rows="4"
                  size="large"
                />
              </n-form-item>

              <!-- Data de Validade -->
              <n-form-item label="Data de Validade" path="validade" class="form-item">
                <n-date-picker
                  v-model:value="form.validade"
                  type="date"
                  value-format="yyyy-MM-dd" 
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
  nome: '',
  descricao: '',
  validade: null as string | null // string no formato YYYY-MM-DD
})

// Regras de validação 
const rules = {
  nome: [
    { 
      required: true, 
      message: 'O nome da vacina é obrigatório', 
      trigger: ['blur', 'input'] 
    }
  ],
  validade: [
    { 
      required: true, 
      message: 'A data de validade é obrigatória', 
      trigger: ['blur', 'change'],
      validator: (rule: any, value: string | null) => {
        return !!value // Validação simples se tem valor
      }
    }
  ]
}

function disablePastDates(date: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today.getTime()
}

async function submitForm() {
  if (!formRef.value) return

  submitting.value = true
  try {
    // Valida o formulário
    await formRef.value.validate()
    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      validade: form.validade
      ? new Date(form.validade).toISOString().slice(0, 10)
      : null
}

    if (!payload.validade) {
      message.error('Selecione uma data de validade')
      submitting.value = false
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      message.error('Usuário não autenticado.')
      submitting.value = false
      return
    }

    const response = await axios.post('http://localhost:8000/api/vacinas', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })


    message.success(`Vacina "${form.nome}" cadastrada com sucesso!`)
    
    // Redireciona após sucesso
    setTimeout(() => {
      router.push('/vaccines')
    }, 1000)
    
  } catch (error: any) {
    console.error('Erro ao salvar vacina:', error)
    
    // Tratamento específico para erro de validação
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors
      console.log('Erros de validação:', validationErrors)
      
      if (validationErrors.validade) {
        message.error(validationErrors.validade[0])
      } else if (validationErrors.nome) {
        message.error(validationErrors.nome[0])
      } else {
        message.error('Erro de validação nos dados')
      }
    } else if (error.response?.status === 401) {
      message.error('Sessão expirada. Faça login novamente.')
      router.push('/login')
    } else if (error.response?.data?.message) {
      message.error(error.response.data.message)
    } else {
      message.error('Erro ao cadastrar vacina. Tente novamente.')
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
.page-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.add-vaccine-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-header {
  margin-bottom: 24px;
}

.form-title-content {
  text-align: center;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.form-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.custom-divider {
  margin: 24px 0;
}

.form-section {
  margin-bottom: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
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
  flex-wrap: wrap;
}

.action-btn {
  min-width: 160px;
}

/* Transições */
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

/* Responsividade */
@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
  }
  
  .form-grid {
    gap: 16px;
  }
}
</style>