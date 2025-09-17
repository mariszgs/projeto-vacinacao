<template>
  <n-card title="Editar Pet" style="max-width: 600px; margin: 20px auto;">
    <n-form :model="pet" ref="formRef">
      <n-form-item label="Nome" path="name">
        <n-input v-model:value="pet.name" placeholder="Digite o nome do pet" />
      </n-form-item>
      
      <n-form-item label="Espécie" path="species">
        <n-select
          v-model:value="pet.species"
          :options="speciesOptions"
          placeholder="Selecione a espécie"
        />
      </n-form-item>

      <n-form-item label="Idade" path="age">
        <n-input-number v-model:value="pet.age" :min="0" placeholder="Digite a idade" />
      </n-form-item>

      <!-- Lista de Vacinas -->
      <n-form-item label="Vacinas" v-for="(vacina, index) in pet.vaccines" :key="vacina.id">
        <n-row>
          <n-col span="12">
            <n-input v-model:value="vacina.name" placeholder="Nome da vacina" />
          </n-col>
          <n-col span="12">
            <n-date-picker
              v-model:value="vacina.date"
              type="date"
              placeholder="Data da vacina"
              :disabled-date="disabledDate"
            />
          </n-col>
        </n-row>
        <n-button
          type="error"
          size="small"
          @click="removeVaccine(index)"
           style="margin-top: 12px; margin-bottom: 12px; margin-left: 5px;"
        >
          Remover Vacina
        </n-button>
      </n-form-item>

      <n-button type="dashed" size="small" @click="addVaccine">Adicionar Vacina</n-button>

      <n-form-item>
        <n-space>
          <n-button type="primary" @click="savePet">Salvar</n-button>
          <n-button @click="goBack">Cancelar</n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NCard, NForm, NFormItem, NInput, NSelect, NInputNumber, NDatePicker, NRow, NCol, NSpace } from 'naive-ui';

const route = useRoute();
const router = useRouter();

// Dados do pet
const pet = ref({
  id: 0,
  name: '',
  species: '',
  age: 0,
  vaccines: [
    { id: 1, name: 'Vacina Raiva', date: '2024-01-10' },
    { id: 2, name: 'Vacina V8', date: '2023-05-15' }
  ]
});

const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' }
];

// Função para desabilitar datas passadas
function disabledDate(current: Date): boolean {
  return current && current < new Date();
}

// Carregar dados do pet quando a página for carregada
onMounted(() => {
  const petId = Number(route.params.id); // O id do pet é obtido pela rota
  // Aqui você pode carregar os dados do pet com base no id, por exemplo, via API
  // Exemplo fictício de dados:
  pet.value = {
    id: petId,
    name: 'Rex', 
    species: 'Cachorro',
    age: 4,
    vaccines: [
      { id: 1, name: 'Vacina Raiva', date: '2024-01-10' },
      { id: 2, name: 'Vacina V8', date: '2022-03-15' }
    ]
  };
});

// Adicionar nova vacina
function addVaccine() {
  // Gerando um ID único para a nova vacina
  const newVaccine = { id: Date.now(), name: '', date: null };  // Inicializando a data como null
  pet.value.vaccines.push(newVaccine);
}

// Remover vacina
function removeVaccine(index: number) {
  pet.value.vaccines.splice(index, 1);
}

// Função de salvar pet
function savePet() {
  console.log('Salvando pet:', pet.value);
  // Aqui você pode realizar a lógica para salvar os dados, como enviar para a API
  router.push('/pets'); // Redireciona para a lista de pets
}

// Função para voltar à lista de pets
function goBack() {
  router.push('/pets');
}
</script>

<style scoped>
/* Estilos personalizados para o formulário de edição */
n-card {
  max-width: 600px;
  margin: 20px auto;
}

n-form-item {
  margin-bottom: 10px;
}

n-button {
  margin-top: 10px;
}

.n-button-error {
  margin-top: 10px;
}
</style>
