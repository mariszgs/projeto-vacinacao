<template>
  <n-card title="Editar Pet" style="max-width: 600px; margin: 20px auto;">
    <n-form :model="pet" :rules="rules" ref="formRef">
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

      <n-form-item label="Data de Nascimento" path="birthdate">
  <n-date-picker
    v-model:value="pet.birthdate"
    type="date"
    placeholder="Selecione a data de nascimento"
    :disabled-date="disabledDate"
    format="dd/MM/yyyy"
    value-format="yyyy-MM-dd"
  />
</n-form-item>



      <!-- Lista de Vacinas -->
      <n-form-item
        v-for="(vacina, index) in pet.vaccines"
        :key="vacina.id"
        :label="'Vacina ' + (index + 1)"
      >
        <div class="vaccine-fields">
          <n-form-item :path="`vaccines[${index}].name`" style="margin-bottom: 0;">
            <n-input v-model:value="vacina.name" placeholder="Nome da vacina" />
          </n-form-item>
          <n-form-item :path="`vaccines[${index}].date`" style="margin-bottom: 0;">
            <n-date-picker
              v-model:value="vacina.date"
              type="date"
              placeholder="Data da vacina"
              :disabled-date="disabledDate"
              format="dd/MM/yyyy"
              value-format="timestamp"
            />
          </n-form-item>
          <n-button
            type="error"
            size="small"
            @click="removeVaccine(index)"
            class="remove-btn"
          >
            Remover Vacina
          </n-button>
        </div>
      </n-form-item>

      <n-button type="dashed" size="small" @click="addVaccine">Adicionar Vacina</n-button>
      <n-divider>Vacinas Aplicadas</n-divider>
<n-table :bordered="false" :single-line="false" size="small" v-if="pet.vacinasAplicadas?.length">
  <thead>
    <tr>
      <th>Nome da Vacina</th>
      <th>Data de Aplicação</th>
      <th>Próxima Dose</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="vac in pet.vacinasAplicadas" :key="vac.id">
      <td>{{ vac.vacina.nome }}</td>
      <td>{{ formatarData(vac.data_aplicacao) }}</td>
      <td>{{ vac.data_proxima_dose ? formatarData(vac.data_proxima_dose) : '—' }}</td>
    </tr>
  </tbody>
</n-table>
<n-empty v-else description="Nenhuma vacina registrada ainda." />


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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInst, FormRules } from 'naive-ui'
import axios from 'axios'
import { useMessage } from 'naive-ui'

const message = useMessage()
const formRef = ref<FormInst | null>(null)

interface Vaccine {
  id: number
  name: string
  date: number | null
}

interface VacinaAplicada {
  id: number
  vacina: {
    nome: string
  }
  data_aplicacao: string
  data_proxima_dose: string | null
}

interface Pet {
  id: number
  name: string
  species: string
  birthdate: string | null
  vaccines: Vaccine[]
  vacinasAplicadas?: VacinaAplicada[]
}


const route = useRoute()
const router = useRouter()

const pet = ref<Pet>({
  id: 0,
  name: '',
  species: '',
  birthdate: null,
  vaccines: []
})

const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' }
]

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      message.error('Sessão expirada. Faça login novamente.')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

function parseVaccines(data: any[]): Vaccine[] {
  return data.map(v => ({
    id: v.id,
    name: v.name,
    date: v.date ? new Date(v.date).getTime() : null
  }))
}

function prepareVaccinesToSave(vaccines: Vaccine[]) {
  return vaccines.map(v => ({
    id: v.id,
    name: v.name,
    date: v.date ? new Date(v.date).toISOString() : null
  }))
}

const rules: FormRules = {
  name: [
    { required: true, message: 'Nome é obrigatório', trigger: 'blur' },
    { min: 2, message: 'Nome deve ter pelo menos 2 caracteres', trigger: 'blur' }
  ],
  species: [
    { required: true, message: 'Espécie é obrigatória', trigger: 'change' }
  ],
  birthdate: [
    { required: true, message: 'Data de nascimento é obrigatória', trigger: 'change' }
  ],
  vaccines: {
    type: 'array',
    required: true,
    message: 'Adicione pelo menos uma vacina',
    trigger: 'change'
  }
}

for (let i = 0; i < 20; i++) {
  rules[`vaccines[${i}].name`] = [
    { required: true, message: 'Nome da vacina é obrigatório', trigger: 'blur' },
    { min: 2, message: 'Nome deve ter pelo menos 2 caracteres', trigger: 'blur' }
  ]
  rules[`vaccines[${i}].date`] = [
    { required: true, type: 'number', message: 'Data da vacina é obrigatória', trigger: 'change' }
  ]
}

function disabledDate(current: Date): boolean {
  return current && current > new Date()
}

async function fetchPet() {
  const petId = Number(route.params.id)
  if (!petId) {
    message.error('ID do pet inválido.')
    router.push('/pets')
    return
  }
  try {
    const response = await api.get(`/pets/${petId}`)
    const data = response.data

   pet.value = {
  id: data.id,
  name: data.name,
  species: data.species,
  birthdate: data.birthdate || null,
  vaccines: parseVaccines(data.vaccines || []),
  vacinasAplicadas: data.vacinas_aplicadas || []
}

  } catch (error) {
    console.error('Erro ao carregar pet:', error)
    message.error('Erro ao carregar dados do pet.')
    router.push('/pets')
  }
}

onMounted(() => {
  fetchPet()
})

function addVaccine() {
  pet.value.vaccines.push({ id: Date.now(), name: '', date: null })
}

function removeVaccine(index: number) {
  pet.value.vaccines.splice(index, 1)
}

async function savePet() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const payload = {
      name: pet.value.name,
      species: pet.value.species,
      birthdate: pet.value.birthdate,
      vaccines: prepareVaccinesToSave(pet.value.vaccines)
    }

    await api.put(`/pets/${pet.value.id}`, payload)
    message.success('Pet atualizado com sucesso!')
    router.push('/pets')
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      message.error(error.response?.data?.message || 'Erro ao salvar o pet.')
    } else {
      message.error('Erro inesperado.')
    }
    console.warn('Erro de validação ou envio:', error)
  }
}

function goBack() {
  router.push('/pets')
}

function formatarData(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}


</script>

<style scoped>
.vaccine-fields {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.vaccine-fields > * {
  flex: 1 1 200px;
  min-width: 120px;
}

/* Mobile */
@media (max-width: 600px) {
  n-card {
    max-width: 100%;
    margin: 10px;
    padding: 10px;
  }

  .vaccine-fields {
    flex-direction: column;
    gap: 8px;
  }

  .vaccine-fields > * {
    flex: 1 1 100%;
  }

  .remove-btn {
    width: 100%;
    height: auto !important;
    padding: 10px 0;
    font-size: 14px;
  }

  n-button[type="dashed"] {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }

  .n-form-item {
    width: 100%;
  }

  .n-input, .n-select, .n-input-number {
    width: 100%;
  }

  n-button {
    width: 100%;
    font-size: 14px;
    padding: 12px;
  }
}
</style>
