<template>
  <n-card title="Editar Vacina" style="max-width: 500px; margin: 20px auto;">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
      
      <n-form-item label="Nome" path="nome">
        <n-input v-model:value="form.nome" placeholder="Digite o nome da vacina" />
      </n-form-item>

      <n-form-item label="Descrição" path="descricao">
        <n-input
          v-model:value="form.descricao"
          type="textarea"
          placeholder="Digite a descrição"
        />
      </n-form-item>

      <n-form-item label="Data de Validade" path="validade">
        <n-date-picker
          v-model:value="form.validade as DatePickerValue"
          type="date"
          placeholder="Selecione a data"
        />
      </n-form-item>

      <n-space style="margin-top: 16px;">
        <n-button type="primary" @click="submit">Salvar Alterações</n-button>
        <n-button @click="cancel">Cancelar</n-button>
      </n-space>

    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { NForm, NFormItem, NInput, NButton, NDatePicker, useMessage } from "naive-ui";
import type { FormRules } from "naive-ui";

// Tipo compatível com n-date-picker
type DatePickerValue = Date | [Date, Date] | null;

const route = useRoute();
const router = useRouter();
const message = useMessage();

const formRef = ref<InstanceType<typeof NForm>>();

const form = ref({
  nome: "",
  descricao: "",
  validade: null as Date | null // Date ou null
});

// Regras do formulário
const rules: FormRules = {
  nome: [
    { required: true, message: "Nome obrigatório", trigger: "blur" },
    { max: 255, message: "Máximo 255 caracteres" }
  ],
  descricao: [],
  validade: []
};

// Axios com token
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Carrega vacina pelo ID
async function fetchVaccine() {
  try {
    const id = route.params.id;
    const response = await api.get(`/vacinas/${id}`);
    const data = response.data;

    form.value.nome = data.nome;
    form.value.descricao = data.descricao;
    form.value.validade = data.validade ? new Date(data.validade) : null;
  } catch (error) {
    console.error("Erro ao carregar vacina:", error);
    message.error("Não foi possível carregar a vacina.");
  }
}

// Enviar atualização
async function submit() {
  try {
    await formRef.value?.validate();

    const id = route.params.id;
    const payload = {
      nome: form.value.nome,
      descricao: form.value.descricao,
      validade: form.value.validade
        ? form.value.validade.toISOString().split("T")[0] // Converte para YYYY-MM-DD
        : null
    };

    await api.put(`/vacinas/${id}`, payload);

    message.success("Vacina atualizada com sucesso!");
    router.push("/vaccines");
  } catch (error: any) {
    console.error("Erro ao atualizar vacina:", error);
    const msg = error.response?.data?.message || "Erro ao atualizar vacina.";
    message.error(msg);
  }
}

function cancel() {
  router.push("/vaccines");
}

onMounted(fetchVaccine);
</script>

<style scoped>
</style>
