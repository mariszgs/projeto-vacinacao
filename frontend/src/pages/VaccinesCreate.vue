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
  expirationDate: null as number | null // <- TIMESTAMP
})

const rules = {
  name: [
    { required: true, message: 'O nome da vacina é obrigatório', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'A descrição é obrigatória', trigger: 'blur' }
  ],
 // expirationDate: [
 //   { required: true, message: 'A data de validade é obrigatória', trigger: ['change', 'blur'] }
 // ]
}

function disablePastDates(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

async function submitForm() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normaliza para comparar só data, sem hora

    const expirationTimestamp = form.expirationDate // Já é um número (timestamp)
    const expirationDate = expirationTimestamp ? new Date(expirationTimestamp) : null

    // Calcular a diferença de dias entre a data de validade e a data de hoje
    const validadeDias = expirationTimestamp
      ? Math.floor((expirationTimestamp - today.getTime()) / (1000 * 3600 * 24))
      : null

    const payload: any = {
  nome: form.name,
  descricao: form.description,
}

if (expirationTimestamp != null) {
  payload.validade_dias = Math.floor((expirationTimestamp - today.getTime()) / (1000 * 3600 * 24))
}


    await axios.post('http://localhost:8000/api/vacinas', payload)

    message.success(`Vacina "${form.name}" salva com sucesso!`)
    cancel()
  } catch (error) {
    console.error('Erro ao salvar vacina:', error)
    message.error('Erro ao salvar vacina.')
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

/* Responsividade e centralização */
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
