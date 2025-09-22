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
import type { FormInst } from 'naive-ui'

const router = useRouter()
const formRef = ref<FormInst | null>(null)

const form = reactive({
  name: '',
  description: '',
  expirationDate: null as Date | null
})

const rules = {
  name: [
    { required: true, message: 'O nome da vacina é obrigatório', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'A descrição é obrigatória', trigger: 'blur' }
  ],
  expirationDate: [
    { required: true, message: 'A data de validade é obrigatória', trigger: 'blur' }
  ]
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
    alert(`Vacina "${form.name}" salva com sucesso!\nData de validade: ${form.expirationDate?.toLocaleDateString()}`)
    
    // TODO: Enviar dados para o backend aqui

    cancel()
  } catch (errors) {
    console.warn('Formulário inválido:', errors)
    // Erros são exibidos automaticamente pelo Naive UI
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

  /* Inputs, textarea e datepicker ocupam 100% na tela pequena */
  .add-vaccine-card ::v-deep input,
  .add-vaccine-card ::v-deep textarea,
  .add-vaccine-card ::v-deep .n-date-picker {
    width: 100% !important;
  }
}
</style>
