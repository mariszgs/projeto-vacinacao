<template>
  <n-card title="Cadastrar Novo Pet" style="max-width: 400px; margin: 20px auto;">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="medium">
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

      <n-form-item label="Data de Nascimento" path="birthdate">
        <n-date-picker
          v-model:value="form.birthdate"
          type="date"
          format="dd/MM/yyyy"
          value-format="yyyy-MM-dd"
          placeholder="Selecione a data de nascimento"
          :disabled-date="disabledDateNascimento"
        />
      </n-form-item>

      <!-- VACINAS (mantido, mas não enviado pro backend ainda) -->
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
            v-model:value="form.vaccinesTakenDates[index]"
            type="date"
            placeholder="Selecione a data"
            :disabled-date="disabledDate"
            format="dd/MM/yyyy"
            value-format="yyyy-MM-dd"
          />
        </n-form-item>
      </div>

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
import { useMessage } from 'naive-ui';
import axios from 'axios';
import type { FormInst } from 'naive-ui';

const router = useRouter();
const message = useMessage();
const formRef = ref<FormInst | null>(null);

const form = reactive({
  name: '',
  species: '',
  birthdate: null as string | null,
  vaccinesTaken: [] as string[],
  vaccinesTakenDates: [] as (string | null)[],
  vaccinesToTake: [] as string[],
  vaccinesToTakeDates: [] as (string | null)[]
});

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

const rules = {
  name: [{ required: true, message: 'Nome é obrigatório', trigger: 'blur' }],
  species: [{ required: true, message: 'Espécie é obrigatória', trigger: 'change' }],
  birthdate: [{ required: true, message: 'Data de nascimento é obrigatória', trigger: 'change' }]
};

function disabledDate(current: Date): boolean {
  return current && current < new Date();
}

function disabledDateNascimento(current: Date): boolean {
  return current.getTime() > Date.now();
}

function handleVaccinesTakenChange(selected: string[]) {
  form.vaccinesTakenDates = new Array(selected.length).fill(null);
}

function handleVaccinesToTakeChange(selected: string[]) {
  form.vaccinesToTakeDates = new Array(selected.length).fill(null);
}

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
      breed: null, // pode remover se não usa
      birthdate: form.birthdate
    };

    await axios.post('http://localhost:8000/api/pets', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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

function cancel() {
  router.push('/pets');
}
</script>
