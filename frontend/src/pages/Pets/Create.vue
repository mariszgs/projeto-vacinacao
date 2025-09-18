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

      <!-- Adicionando vacinas tomadas -->
      <n-form-item label="Vacinas Tomadas" path="vaccinesTaken">
        <n-select
          v-model:value="form.vaccinesTaken"
          :options="vaccinesOptions"
          multiple
          placeholder="Selecione as vacinas tomadas"
          @update:value="handleVaccinesTakenChange"
        />
      </n-form-item>

      <div v-for="(vaccine, index) in form.vaccinesTaken" :key="'taken-' + index">
        <n-form-item :label="'Data da ' + vaccine + ' Tomada'" :path="'vaccinesTakenDates[' + index + ']'">
          <n-date-picker
            v-model:value="form.vaccinesTakenDates[index]"
            type="date"
            placeholder="Selecione a data"
            :disabled-date="disabledDate"
            format="dd/MM/yyyy"
            value-format="yyyy-MM-dd"
          />
        </n-form-item>
      </div>

      <!-- Adicionando vacinas a tomar -->
      <n-form-item label="Vacinas a Tomar" path="vaccinesToTake">
        <n-select
          v-model:value="form.vaccinesToTake"
          :options="vaccinesOptions"
          multiple
          placeholder="Selecione as vacinas a tomar"
          @update:value="handleVaccinesToTakeChange"
        />
      </n-form-item>

      <div v-for="(vaccine, index) in form.vaccinesToTake" :key="'toTake-' + index">
        <n-form-item :label="'Data da Última ' + vaccine + ' Tomada'" :path="'vaccinesToTakeDates[' + index + ']'">
          <n-date-picker
            v-model:value="form.vaccinesToTakeDates[index]"
            type="date"
            placeholder="Selecione a data"
            :disabled-date="disabledDate"
            format="dd/MM/yyyy"
            value-format="yyyy-MM-dd"
          />
        </n-form-item>
      </div>

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
  vaccinesTaken: [] as string[], // Vacinas tomadas
  vaccinesTakenDates: [] as (string | null)[], // Datas das vacinas tomadas
  vaccinesToTake: [] as string[], // Vacinas a tomar
  vaccinesToTakeDates: [] as (string | null)[] // Datas das vacinas a tomar
});

const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' },
];

const vaccinesOptions = [
  { label: 'Vacina Antirrábica', value: 'Antirrabica' },
  { label: 'Vacina V8', value: 'V8' },
  { label: 'Vacina V10', value: 'V10' },
  { label: 'Vacina Gripe Canina', value: 'GripeCanina' },
  { label: 'Vacina Leptospirose', value: 'Leptospirose' },
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
  ],
  vaccinesTaken: [
    { required: true, message: 'Vacinas tomadas são obrigatórias', trigger: 'change' }
  ],
  vaccinesTakenDates: [
    { required: true, message: 'Data das vacinas tomadas é obrigatória', trigger: 'change' }
  ],
  vaccinesToTake: [
    { required: true, message: 'Vacinas a tomar são obrigatórias', trigger: 'change' }
  ],
  vaccinesToTakeDates: [
    { required: true, message: 'Data das vacinas a tomar é obrigatória', trigger: 'change' }
  ]
};

// Função para desabilitar datas no passado
function disabledDate(current: Date): boolean {
  return current && current < new Date();
}

// Atualiza as datas para as vacinas tomadas
function handleVaccinesTakenChange(selectedVaccines: string[]) {
  form.vaccinesTakenDates = new Array(selectedVaccines.length).fill(null);
}

// Atualiza as datas para as vacinas a tomar
function handleVaccinesToTakeChange(selectedVaccines: string[]) {
  form.vaccinesToTakeDates = new Array(selectedVaccines.length).fill(null);
}

// Função para formatar datas para dd/MM/yyyy
function formatDateBR(dateStr: string | null) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const formData = {
        ...form,
        vaccinesTakenDates: form.vaccinesTakenDates.map(formatDateBR),
        vaccinesToTakeDates: form.vaccinesToTakeDates.map(formatDateBR),
      };

      console.log('Pet cadastrado com datas no formato BR:', formData);

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
