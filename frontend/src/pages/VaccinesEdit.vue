<template>
  <n-card title="Editar Vacina" style="max-width: 500px; margin: 20px auto;">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
      <n-form-item label="Nome" path="nome">
        <n-input v-model:value="form.nome" placeholder="Digite o nome da vacina" />
      </n-form-item>

      <n-form-item label="Descrição" path="descricao">
        <n-input v-model:value="form.descricao" type="textarea" placeholder="Digite a descrição" />
      </n-form-item>

      <n-form-item label="Data de Validade" path="validade">
        <n-date-picker v-model:value="form.validade" type="date" placeholder="Selecione a data"
          format="dd/MM/yyyy" value-format="timestamp" />
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

const route = useRoute();
const router = useRouter();
const message = useMessage();

const formRef = ref<InstanceType<typeof NForm>>();

const form = ref({
  nome: "",
  descricao: "",
  validade: null as number | null
});

const rules: FormRules = {
  nome: [{ required: true, message: "Nome obrigatório", trigger: "blur" }, { max: 255, message: "Máximo 255 caracteres" }],
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
  try {
    await formRef.value?.validate();
    const id = route.params.id;

    const validadeAjustada = form.value.validade
      ? (() => { const d = new Date(form.value.validade); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })()
      : null;

    const payload = { nome: form.value.nome, descricao: form.value.descricao, validade: validadeAjustada };

    await api.put(`/vacinas/${id}`, payload);

    message.success("Vacina atualizada com sucesso!");
    router.push("/vaccines"); // Vaccines.vue vai atualizar o item mantendo a ordem
  } catch (error: any) {
    console.error(error);
    message.error(error.response?.data?.message || "Erro ao atualizar vacina.");
  }
}

function cancel() { router.push("/vaccines"); }

onMounted(fetchVaccine);
</script>
