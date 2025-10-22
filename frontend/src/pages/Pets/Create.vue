<template>
  <div class="page-container">
    <n-card 
      class="create-pet-card"
      :bordered="true"
    >
      <!-- Transição suave -->
      <transition name="fade" mode="out-in">
        <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" size="large" class="pet-form">
          
          <!-- Cabeçalho -->
          <div class="form-header">
            <h2 class="form-title">Cadastrar Novo Pet</h2>
            <p class="form-subtitle">Preencha as informações do seu pet</p>
          </div>

          <n-divider class="custom-divider" />

          <!-- Informações Básicas -->
          <div class="form-section">
            <h3 class="section-title">Informações Básicas</h3>
            <div class="form-grid">
              <!-- Nome -->
              <n-form-item label="Nome" path="name" class="form-item">
                <n-input 
                  v-model:value="form.name" 
                  placeholder="Digite o nome do pet"
                  size="large"
                />
              </n-form-item>

              <!-- Espécie -->
              <n-form-item label="Espécie" path="species" class="form-item">
                <n-select
                  v-model:value="form.species"
                  :options="speciesOptions"
                  placeholder="Selecione a espécie"
                  size="large"
                />
              </n-form-item>

              <!-- Data de Nascimento -->
              <n-form-item label="Data de Nascimento" path="birthdate" class="form-item">
                <n-date-picker
                  v-model:value="birthdateDate"
                  type="date"
                  format="dd/MM/yyyy"
                  placeholder="Selecione a data de nascimento"
                  :disabled-date="disabledDateNascimento"
                  @update:value="updateBirthdate"
                  size="large"
                  style="width: 100%"
                />
              </n-form-item>
            </div>
          </div>

          <!-- Vacinas Tomadas -->
          <div class="form-section">
            <h3 class="section-title">Vacinas Tomadas</h3>
            <n-form-item label="Vacinas Tomadas" path="vaccinesTaken" class="form-item">
              <n-select
                v-model:value="form.vaccinesTaken"
                :options="vaccinesOptions"
                multiple
                label-field="label"
                value-field="value"
                placeholder="Selecione as vacinas tomadas"
                @update:value="handleVaccinesTakenChange"
                size="large"
              />
            </n-form-item>

            <div class="vaccines-dates" v-if="form.vaccinesTaken.length">
              <n-card
                v-for="(vaccineId, index) in form.vaccinesTaken"
                :key="'taken-' + index"
                class="vaccine-date-card"
              >
                <div class="vaccine-date-content">
                  <span class="vaccine-label">{{ getVaccineLabel(vaccineId) }}</span>
                  <n-date-picker
                    v-model:value="vaccinesTakenDatesRefs[index]"
                    type="date"
                    format="dd/MM/yyyy"
                    placeholder="Selecione a data"
                    :disabled-date="disabledDate"
                    @update:value="(val: Date | string | null) => updateVaccineDate(index, val)"
                    size="small"
                    style="min-width: 140px;"
                  />
                </div>
              </n-card>
            </div>
          </div>

          <!-- Vacinas a Tomar -->
          <div class="form-section">
            <h3 class="section-title">Vacinas a Tomar</h3>
            <n-form-item label="Vacinas a Tomar" path="vaccinesToTake" class="form-item">
              <n-select
                v-model:value="form.vaccinesToTake"
                :options="vaccinesOptions"
                multiple
                label-field="label"
                value-field="value"
                placeholder="Selecione as vacinas a tomar"
                @update:value="handleVaccinesToTakeChange"
                size="large"
              />
            </n-form-item>

            <div class="vaccines-dates" v-if="form.vaccinesToTake.length">
              <n-card
                v-for="(vaccineId, index) in form.vaccinesToTake"
                :key="'toTake-' + index"
                class="vaccine-date-card"
              >
                <div class="vaccine-date-content">
                  <span class="vaccine-label">{{ getVaccineLabel(vaccineId) }}</span>
                  <n-date-picker
                    v-model:value="vaccinesToTakeDatesRefs[index]"
                    type="date"
                    format="dd/MM/yyyy"
                    placeholder="Selecione a data"
                    :disabled-date="disabledDate"
                    @update:value="(val: Date | string | null) => updateVaccineToTakeDate(index, val)"
                    size="small"
                    style="min-width: 140px;"
                  />
                </div>
              </n-card>
            </div>
          </div>

          <!-- Botões -->
          <div class="action-buttons">
            <n-button 
              type="primary" 
              @click="submitForm" 
              size="large"
              class="action-btn"
              :loading="submitting"
            >
              Cadastrar Pet
            </n-button>
            <n-button 
              @click="cancel" 
              size="large"
              class="action-btn"
              :disabled="submitting"
            >
              Cancelar
            </n-button>
          </div>

        </n-form>
      </transition>
    </n-card>
  </div>
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
const submitting = ref(false);

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

  // array dentro de response.data.items
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

  submitting.value = true;
  try {
    await formRef.value.validate();
    const token = localStorage.getItem('token');
    if (!token) {
      message.error("Você precisa estar autenticado.");
      return;
    }

    // Validação extra: datas de vacinas tomadas não podem ser anteriores à data de nascimento
    const birth = birthdateDate.value;
    if (!birth) {
      message.error("Data de nascimento inválida.");
      return;
    }

    for (let i = 0; i < form.vaccinesTaken.length; i++) {
      const vaccineDateStr = form.vaccinesTakenDates[i];
      if (!vaccineDateStr) continue;

      const vaccineDate = new Date(vaccineDateStr);
      if (vaccineDate < birth) {
        message.error(`A data da vacina "${getVaccineLabel(form.vaccinesTaken[i])}" não pode ser anterior à data de nascimento do pet.`);
        return;
      }
    }

    // Criar pet
    const petResponse = await axios.post(
      'http://127.0.0.1:8000/api/pets',
      {
        name: form.name,
        species: form.species,
        breed: null,
        birthdate: form.birthdate || null
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const petId = petResponse.data.id;

    // Vacinas tomadas
    for (let i = 0; i < form.vaccinesTaken.length; i++) {
      const vacinaId = form.vaccinesTaken[i];
      const dataAplicacao = form.vaccinesTakenDates[i] || null;
      if (!dataAplicacao) continue;

      await axios.post(
        `http://127.0.0.1:8000/api/pets/${petId}/vacinas`,
        {
          vacina_id: vacinaId,
          data_aplicacao: dataAplicacao,
          data_proxima_dose: null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // Vacinas a tomar
    for (let i = 0; i < form.vaccinesToTake.length; i++) {
      const vacinaId = form.vaccinesToTake[i];
      const dataAgendada = form.vaccinesToTakeDates[i] || null;
      if (!dataAgendada) continue;

      await axios.post(
        'http://127.0.0.1:8000/api/agendamento-de-vacinas',
        {
          pet_id: petId,
          vacina_id: vacinaId,
          data_agendada: dataAgendada,
          observacoes: ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
  } finally {
    submitting.value = false;
  }
}

// Cancelar
function cancel() { router.push('/pets'); }
</script>

<style scoped>
/* Container da página para centralização */
.page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

/* Container principal - CENTRALIZADO */
.create-pet-card {
  width: 100%;
  max-width: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
}

/* Cabeçalho do formulário */
.form-header {
  margin-bottom: 20px;
  text-align: center;
}

.form-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.form-subtitle {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.custom-divider {
  margin: 20px 0;
}

/* Formulário */
.pet-form {
  width: 100%;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-item {
  margin-bottom: 0;
}

/* Vacinas e datas */
.vaccines-dates {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.vaccine-date-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.vaccine-date-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px;
}

.vaccine-label {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
  flex: 1;
}

/* Botões de ação */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  min-width: 140px;
}

/* Transição de fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* RESPONSIVIDADE MOBILE */
@media (max-width: 768px) {
  .page-container {
    padding: 12px;
    align-items: flex-start;
  }
  
  .create-pet-card {
    margin: 0;
    border-radius: 8px;
    max-width: none;
  }
  
  .form-header {
    text-align: left;
  }
  
  .vaccine-date-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .vaccine-date-content .n-date-picker {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 8px;
  }
  
  .create-pet-card {
    border-radius: 6px;
  }
  
  .form-title {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 16px;
  }
}

/* Para telas muito pequenas */
@media (max-width: 320px) {
  .page-container {
    padding: 4px;
  }
  
  .form-title {
    font-size: 18px;
  }
}
</style>