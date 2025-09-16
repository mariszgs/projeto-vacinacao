<template>
  <n-card title="Cadastrar Novo Pet" style="max-width: 400px; margin: 20px auto;">
    <n-form :model="form" :rules="rules" ref="formRef">
      <n-form-item label="Nome" path="name">
        <n-input v-model:value="form.name" placeholder="Digite o nome do pet" />
      </n-form-item>

      <n-form-item label="Espécie" path="species">
        <n-select
          v-model:value="form.species"
          :options="speciesOptions"
          placeholder="Selecione a espécie"
        />
      </n-form-item>

      <n-form-item label="Idade" path="age">
        <n-input-number v-model:value="form.age" :min="0" />
      </n-form-item>

      <n-form-item>
        <n-space>
          <n-button type="primary" @click="submitForm">Cadastrar</n-button>
          <n-button @click="cancel">Cancelar</n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const formRef = ref();

const form = reactive({
  name: '',
  species: '',
  age: null as number | null,
});

const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' },
];

const rules = {
  name: [
    { required: true, message: 'Nome é obrigatório', trigger: 'blur' },
    { min: 2, message: 'Nome deve ter no mínimo 2 caracteres', trigger: 'blur' }
  ],
  species: [
    { required: true, message: 'Espécie é obrigatória', trigger: 'change' }
  ],
  age: [
    { required: true, message: 'Idade é obrigatória', trigger: 'change' },
    { type: 'number', min: 0, message: 'Idade deve ser 0 ou mais', trigger: 'change' }
  ]
};

function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      // Aqui você faria a chamada para salvar o pet no backend ou state global
      console.log('Pet cadastrado:', { ...form });

      // Após salvar, redireciona para a lista de pets
      router.push('/pets');
    } else {
      console.log('Erro na validação do formulário');
    }
  });
}

function cancel() {
  router.push('/pets');
}
</script>
