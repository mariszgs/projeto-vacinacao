<template>
  <n-card title="Cadastrar Novo Pet" style="max-width: 400px; margin: 20px auto;">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="medium">
      
      <!-- Nome -->
      <n-form-item label="Nome" path="name">
        <n-input v-model:value="form.name" placeholder="Digite o nome do pet" />
      </n-form-item>

      <!-- Espécie -->
      <n-form-item label="Espécie" path="species">
        <n-select
          v-model:value="form.species"
          :options="speciesOptions"
          placeholder="Selecione a espécie"
        />
      </n-form-item>

      <!-- Data de Nascimento -->
      <n-form-item label="Data de Nascimento" path="birthdate">
        <n-date-picker
          v-model:value="birthdateDate"
          type="date"
          format="dd/MM/yyyy"
          placeholder="Selecione a data de nascimento"
          :disabled-date="disabledDateNascimento"
          @update:value="(val: Date | null) => form.birthdate = val ? val.toISOString().split('T')[0] : ''"
        />
      </n-form-item>

      <!-- Vacinas Tomadas -->
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
        <n-form-item
          :label="'Data da ' + vaccine + ' Tomada'"
          :path="'vaccinesTakenDates[' + index + ']'"
        >
          <n-date-picker
            v-model:value="vaccinesTakenDatesRefs[index]"
            type="date"
            format="dd/MM/yyyy"
            placeholder="Selecione a data"
            :disabled-date="disabledDate"
            @update:value="(val: Date | null) => form.vaccinesTakenDates[index] = val ? val.toISOString().split('T')[0] : ''"
          />
        </n-form-item>
      </div>

      <!-- Vacinas a Tomar -->
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
        <n-form-item
          :label="'Data de Agendamento para ' + vaccine"
          :path="'vaccinesToTakeDates[' + index + ']'"
        >
          <n-date-picker
            v-model:value="vaccinesToTakeDatesRefs[index]"
            type="date"
            format="dd/MM/yyyy"
            placeholder="Selecione a data"
            :disabled-date="disabledDate"
            @update:value="(val: Date | null) => form.vaccinesToTakeDates[index] = val ? val.toISOString().split('T')[0] : ''"
          />
        </n-form-item>
      </div>

      <!-- Botões -->
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
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import axios from 'axios';
import type { FormInst } from 'naive-ui';

const router = useRouter();
const message = useMessage();
const formRef = ref<FormInst | null>(null);

// Modelo do formulário
const form = reactive({
  name: '',
  species: '',
  birthdate: '', // agora é string
  vaccinesTaken: [] as string[],
  vaccinesTakenDates: [] as string[],
  vaccinesToTake: [] as string[],
  vaccinesToTakeDates: [] as string[]
});

// Refs temporárias para os DatePickers (valores Date)
const birthdateDate = ref<Date | null>(null);
const vaccinesTakenDatesRefs = ref<(Date | null)[]>([]);
const vaccinesToTakeDatesRefs = ref<(Date | null)[]>([]);

// Opções
const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' }
];

const vaccinesOptions = [
  { label: 'Vacina Antirrábica', value: 'Antirrabica' },
  { label: 'Vacina V8', value: 'V8' },
  { label: 'Vacina V10', value: 'V10' },
  { label: 'Vacina Gripe Canina', value: 'GripeCanina' },
  { label: 'Vacina Leptospirose', value: 'Leptospirose' }
];

// Regras de validação
const rules = {
  name: [{ required: true, message: 'Nome é obrigatório', trigger: 'blur' }],
  species: [{ required: true, message: 'Espécie é obrigatória', trigger: 'change' }],
  birthdate: [{ required: true, message: 'Data de nascimento é obrigatória', trigger: 'blur' }]
};

// Funções de datas
function disabledDate(current: Date): boolean {
  return current && current < new Date();
}

function disabledDateNascimento(current: Date): boolean {
  return current.getTime() > Date.now();
}

// Atualiza arrays de datas para vacinas
function handleVaccinesTakenChange(selected: string[]) {
  form.vaccinesTakenDates = new Array(selected.length).fill('');
  vaccinesTakenDatesRefs.value = new Array(selected.length).fill(null);
}

function handleVaccinesToTakeChange(selected: string[]) {
  form.vaccinesToTakeDates = new Array(selected.length).fill('');
  vaccinesToTakeDatesRefs.value = new Array(selected.length).fill(null);
}

// Submit
async function submitForm() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const token = localStorage.getItem('token');
    if (!token) {
      message.error("Você precisa estar autenticado.");
      return;
    }

    const payload = {
      name: form.name,
      species: form.species,
      birthdate: form.birthdate || null,
      vaccinesTaken: form.vaccinesTaken.map((v, i) => ({
        name: v,
        date: form.vaccinesTakenDates[i] || null
      })),
      vaccinesToTake: form.vaccinesToTake.map((v, i) => ({
        name: v,
        date: form.vaccinesToTakeDates[i] || null
      }))
    };

    await axios.post('http://localhost:8000/api/pets', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    message.success('Pet cadastrado com sucesso!');
    router.push('/pets');
  } catch (error: any) {
    console.error(error);
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      message.error(firstError as string);
    } else {
      message.error('Erro ao cadastrar pet.');
    }
  }
}

// Cancelar
function cancel() {
  router.push('/pets');
}
</script>
