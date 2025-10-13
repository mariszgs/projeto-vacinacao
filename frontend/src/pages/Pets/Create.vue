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
          @update:value="updateBirthdate"
        />
      </n-form-item>

      <!-- Vacinas Tomadas -->
      <n-form-item label="Vacinas Tomadas" path="vaccinesTaken">
        <n-select
          v-model:value="form.vaccinesTaken"
          :options="vaccinesOptions"
          multiple
          label-field="label"
          value-field="value"
          placeholder="Selecione as vacinas tomadas"
          @update:value="handleVaccinesTakenChange"
        />
      </n-form-item>

      <div v-for="(vaccineId, index) in form.vaccinesTaken" :key="'taken-' + index">
        <n-form-item
          :label="'Data da ' + getVaccineLabel(vaccineId) + ' Tomada'"
          :path="'vaccinesTakenDates[' + index + ']'"
        >
          <n-date-picker
            v-model:value="vaccinesTakenDatesRefs[index]"
            type="date"
            format="dd/MM/yyyy"
            placeholder="Selecione a data"
            :disabled-date="disabledDate"
            @update:value="(val: Date | string | null) => updateVaccineDate(index, val)"
          />
        </n-form-item>
      </div>

      <!-- Vacinas a Tomar -->
      <n-form-item label="Vacinas a Tomar" path="vaccinesToTake">
        <n-select
          v-model:value="form.vaccinesToTake"
          :options="vaccinesOptions"
          multiple
          label-field="label"
          value-field="value"
          placeholder="Selecione as vacinas a tomar"
          @update:value="handleVaccinesToTakeChange"
        />
      </n-form-item>

      <div v-for="(vaccineId, index) in form.vaccinesToTake" :key="'toTake-' + index">
        <n-form-item
          :label="'Data de Agendamento para ' + getVaccineLabel(vaccineId)"
          :path="'vaccinesToTakeDates[' + index + ']'"
        >
          <n-date-picker
            v-model:value="vaccinesToTakeDatesRefs[index]"
            type="date"
            format="dd/MM/yyyy"
            placeholder="Selecione a data"
            :disabled-date="disabledDate"
            @update:value="(val: Date | string | null) => updateVaccineToTakeDate(index, val)"
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
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import axios from 'axios';
import type { FormInst } from 'naive-ui';

const router = useRouter();
const message = useMessage();
const formRef = ref<FormInst | null>(null);

// Formulário
const form = reactive({
  name: '',
  species: '',
  birthdate: '',
  vaccinesTaken: [] as number[],   // IDs
  vaccinesTakenDates: [] as string[],
  vaccinesToTake: [] as number[],  // IDs
  vaccinesToTakeDates: [] as string[]
});

// Refs para DatePickers
const birthdateDate = ref<Date | null>(null);
const vaccinesTakenDatesRefs = ref<(Date | null)[]>([]);
const vaccinesToTakeDatesRefs = ref<(Date | null)[]>([]);

// Opções
const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' }
];
const vaccinesOptions = ref<{label: string, value: number}[]>([]);

// Regras
const rules = {
  name: [{ required: true, message: 'Nome é obrigatório', trigger: 'blur' }],
  species: [{ required: true, message: 'Espécie é obrigatória', trigger: 'change' }],
  birthdate: [{ required: true, message: 'Data de nascimento é obrigatória', trigger: 'blur' }]
};

// Datas
function disabledDate(current: Date): boolean { return current && current < new Date(); }
function disabledDateNascimento(current: Date): boolean { return current.getTime() > Date.now(); }

const updateBirthdate = (val: Date | string | null) => {
  if (!val) { form.birthdate = ''; birthdateDate.value = null; return; }
  const date = val instanceof Date ? val : new Date(val);
  form.birthdate = date.toISOString().split('T')[0];
  birthdateDate.value = date;
};

// Busca vacinas do backend
onMounted(async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get('http://127.0.0.1:8000/api/vacinas', {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Aqui pegamos o array dentro de response.data.items
  vaccinesOptions.value = response.data.items.map((v: any) => ({
    label: v.nome,
    value: v.id
  }));
});


// Label da vacina pelo ID
function getVaccineLabel(id: number) {
  const found = vaccinesOptions.value.find(v => v.value === id);
  return found ? found.label : '';
}

// Atualiza arrays de datas
function handleVaccinesTakenChange(selected: number[]) {
  const newDates: string[] = [];
  const newRefs: (Date | null)[] = [];
  selected.forEach(vId => {
    const oldIndex = form.vaccinesTaken.indexOf(vId);
    if (oldIndex !== -1) {
      newDates.push(form.vaccinesTakenDates[oldIndex]);
      newRefs.push(vaccinesTakenDatesRefs.value[oldIndex]);
    } else { newDates.push(''); newRefs.push(null); }
  });
  form.vaccinesTaken = selected;
  form.vaccinesTakenDates = newDates;
  vaccinesTakenDatesRefs.value = newRefs;
}

function handleVaccinesToTakeChange(selected: number[]) {
  const newDates: string[] = [];
  const newRefs: (Date | null)[] = [];
  selected.forEach(vId => {
    const oldIndex = form.vaccinesToTake.indexOf(vId);
    if (oldIndex !== -1) {
      newDates.push(form.vaccinesToTakeDates[oldIndex]);
      newRefs.push(vaccinesToTakeDatesRefs.value[oldIndex]);
    } else { newDates.push(''); newRefs.push(null); }
  });
  form.vaccinesToTake = selected;
  form.vaccinesToTakeDates = newDates;
  vaccinesToTakeDatesRefs.value = newRefs;
}

// Datas individuais
function updateVaccineDate(index: number, val: Date | string | null) {
  if (!val) { form.vaccinesTakenDates[index] = ''; vaccinesTakenDatesRefs.value[index] = null; return; }
  const date = val instanceof Date ? val : new Date(val);
  form.vaccinesTakenDates[index] = date.toISOString().split('T')[0];
  vaccinesTakenDatesRefs.value[index] = date;
}

function updateVaccineToTakeDate(index: number, val: Date | string | null) {
  if (!val) { form.vaccinesToTakeDates[index] = ''; vaccinesToTakeDatesRefs.value[index] = null; return; }
  const date = val instanceof Date ? val : new Date(val);
  form.vaccinesToTakeDates[index] = date.toISOString().split('T')[0];
  vaccinesToTakeDatesRefs.value[index] = date;
}

// Submit
async function submitForm() {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    const token = localStorage.getItem('token');
    if (!token) { message.error("Você precisa estar autenticado."); return; }

    // Criar pet
    const petResponse = await axios.post('http://127.0.0.1:8000/api/pets', {
      name: form.name,
      species: form.species,
      breed: null,
      birthdate: form.birthdate || null
    }, { headers: { Authorization: `Bearer ${token}` } });

    const petId = petResponse.data.id;

    // Vacinas tomadas
    for (let i = 0; i < form.vaccinesTaken.length; i++) {
      const vacinaId = form.vaccinesTaken[i];
      const dataAplicacao = form.vaccinesTakenDates[i] || null;
      if (!dataAplicacao) continue;
      await axios.post(`http://127.0.0.1:8000/api/pets/${petId}/vacinas`, {
        vacina_id: vacinaId,
        data_aplicacao: dataAplicacao,
        data_proxima_dose: null
      }, { headers: { Authorization: `Bearer ${token}` } });
    }

    // Vacinas a tomar
    for (let i = 0; i < form.vaccinesToTake.length; i++) {
      const vacinaId = form.vaccinesToTake[i];
      const dataAgendada = form.vaccinesToTakeDates[i] || null;
      if (!dataAgendada) continue;
      await axios.post('http://127.0.0.1:8000/api/agendamento-de-vacinas', {
        pet_id: petId,
        vacina_id: vacinaId,
        data_agendada: dataAgendada,
        observacoes: ''
      }, { headers: { Authorization: `Bearer ${token}` } });
    }

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
function cancel() { router.push('/pets'); }
</script>
