<template>
  <n-card title="Adicionar Vacina" class="add-vaccine-card">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="medium">
      <n-form-item label="Nome da Vacina" path="name">
        <n-input v-model:value="form.name" placeholder="Digite o nome da vacina" />
      </n-form-item>

      <n-form-item label="Descrição" path="description">
        <n-input
          type="textarea"
          v-model:value="form.description"
          placeholder="Descreva a vacina"
          rows="4"
        />
      </n-form-item>

      <n-form-item label="Data de Validade" path="expirationDate">
        <n-date-picker
          v-model:value="form.expirationDate"
          type="date"
          value-format="timestamp"
          placeholder="Selecione a data de validade"
          :disabled-date="disablePastDates"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item>
        <n-space>
          <n-button type="primary" @click="submitForm">Salvar</n-button>
          <n-button @click="cancel">Cancelar</n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useMessage, type FormInst } from 'naive-ui'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)

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

function disablePastDates(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
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

  try {
    await formRef.value.validate()

    const payload: any = {
      nome: form.name,
      descricao: form.description,
    }

    if (form.expirationDate != null) {
      payload.validade = formatDateForBackend(form.expirationDate) // <- mudou aqui
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

    message.success(`Vacina "${form.name}" salva com sucesso!`)
    cancel()
  } catch (error: any) {
    console.error('Erro ao salvar vacina:', error)
    if (error.response?.status === 401) {
      message.error('Não autorizado. Verifique seu token.')
    } else {
      message.error('Erro ao salvar vacina.')
    }
  }
}

function cancel() {
  router.push('/vaccines')
}
</script>

<style scoped>
.add-vaccine-card {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .add-vaccine-card {
    max-width: 90vw;
    margin: 20px auto;
    padding: 16px;
  }

  .add-vaccine-card ::v-deep input,
  .add-vaccine-card ::v-deep textarea,
  .add-vaccine-card ::v-deep .n-date-picker {
    width: 100% !important;
  }
}
</style>
