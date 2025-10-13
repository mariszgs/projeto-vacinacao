<template>
  <n-card title="Editar Pet" style="max-width: 600px; margin: 20px auto;">
    <n-form :model="pet" :rules="rules" ref="formRef">
      <!-- Dados do pet -->
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
          value-format="timestamp"
        />
      </n-form-item>

      <!-- Vacinas do Pet -->
      <n-divider>Vacinas do Pet</n-divider>
      <n-form-item
        v-for="(vacina, index) in [...vacinasRecentes, ...pet.vaccines]"
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

      <!-- Vacinas Agendadas -->
      <n-divider>Vacinas Agendadas</n-divider>
      <n-table v-if="vacinasAgendadas.length" :data="vacinasAgendadas" :bordered="false" size="small">
        <thead>
          <tr>
            <th>Nome da Vacina</th>
            <th>Data Agendada</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vac in vacinasAgendadas" :key="vac.id">
            <td>{{ vac.vacina.nome }}</td>
            <td>{{ formatarData(vac.data_aplicacao) }}</td>
          </tr>
        </tbody>
      </n-table>
      <n-empty v-else description="Nenhuma vacina agendada." />

      <!-- Vacinas Atrasadas -->
      <n-divider>Vacinas Atrasadas</n-divider>
      <n-table v-if="vacinasAtrasadas.length" :data="vacinasAtrasadas" :bordered="false" size="small">
        <thead>
          <tr>
            <th>Nome da Vacina</th>
            <th>Data Prevista</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vac in vacinasAtrasadas" :key="vac.id">
            <td>{{ vac.vacina.nome }}</td>
            <td>{{ formatarData(vac.data_aplicacao) }}</td>
          </tr>
        </tbody>
      </n-table>
      <n-empty v-else description="Nenhuma vacina atrasada." />

      <!-- Botões Salvar / Cancelar -->
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
import axios, { AxiosHeaders } from 'axios'
import { useMessage } from 'naive-ui'

const message = useMessage()
const formRef = ref<FormInst | null>(null)

interface Vaccine {
  id: number
  name: string
  date: number | null
}

interface VacinaAgendada {
  id: number
  vacina: { nome: string }
  data_aplicacao: string
}

interface Pet {
  id: number
  name: string
  species: string
  birthdate: number | null
  vaccines: Vaccine[]
}

const pet = ref<Pet>({
  id: 0,
  name: '',
  species: '',
  birthdate: null,
  vaccines: []
})

const vacinasAgendadas = ref<VacinaAgendada[]>([])
const vacinasAtrasadas = ref<VacinaAgendada[]>([])
const vacinasRecentes = ref<Vaccine[]>([]) // novas vacinas aplicadas recentemente

const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' }
]

const api = axios.create({ baseURL: 'http://localhost:8000/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders()
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

const route = useRoute()
const router = useRouter()

function parseVaccines(data: any[]): Vaccine[] {
  return data.map(v => ({
    id: v.id,
    name: v.name,
    date: v.date ? new Date(v.date).getTime() : null
  }))
}

const rules: FormRules = {
  name: [{ required: true, message: 'Nome é obrigatório', trigger: 'blur' }],
  species: [{ required: true, message: 'Espécie é obrigatória', trigger: 'change' }],
  birthdate: [{ required: true, type: 'number', message: 'Data de nascimento é obrigatória', trigger: 'change' }],
  vaccines: { type: 'array', required: true, message: 'Adicione pelo menos uma vacina', trigger: 'change' }
}
for (let i = 0; i < 20; i++) {
  rules[`vaccines[${i}].name`] = [{ required: true, message: 'Nome da vacina é obrigatório', trigger: 'blur' }]
  rules[`vaccines[${i}].date`] = [{ required: true, type: 'number', message: 'Data da vacina é obrigatória', trigger: 'change' }]
}

function disabledDate(current: Date): boolean { return current && current > new Date() }

async function fetchPet() {
  const petId = Number(route.params.id)
  if (!petId) { message.error('ID do pet inválido.'); router.push('/pets'); return }

  try {
    const { data } = await api.get(`/pets/${petId}`)
    pet.value = {
      id: data.id,
      name: data.name,
      species: data.species,
      birthdate: data.birthdate || null,
      vaccines: parseVaccines(data.vaccines || [])
    }
    separarVacinas(data.vacinas_aplicadas || [])
  } catch (err) {
    console.error(err)
    message.error('Erro ao carregar dados do pet.')
    router.push('/pets')
  }
}

function separarVacinas(vacinas: any[]) {
  const hoje = new Date().setHours(0, 0, 0, 0)
  const umAnoAtras = new Date()
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)
  umAnoAtras.setHours(0, 0, 0, 0)

  vacinasAgendadas.value = []
  vacinasAtrasadas.value = []
  vacinasRecentes.value = []

  vacinas.forEach(v => {
    const dataAplicacao = new Date(v.data_aplicacao).setHours(0, 0, 0, 0)

    if (dataAplicacao >= hoje) {
      vacinasAgendadas.value.push(v)
    } else if (dataAplicacao < hoje && dataAplicacao >= umAnoAtras.getTime()) {
      vacinasRecentes.value.push({
        id: v.id,
        name: v.vacina.nome,
        date: dataAplicacao
      })
    } else {
      vacinasAtrasadas.value.push(v)
    }
  })
}

function addVaccine() { pet.value.vaccines.push({ id: Date.now(), name: '', date: null }) }
function removeVaccine(index: number) { pet.value.vaccines.splice(index, 1) }

async function savePet() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()

    const birthdate = pet.value.birthdate
      ? new Date(pet.value.birthdate).toISOString().slice(0, 10)
      : null

    const vaccines = pet.value.vaccines.map(v => ({
      id: v.id,
      name: v.name,
      date: v.date ? new Date(v.date).toISOString().slice(0, 10) : null
    }))

    const payload = { name: pet.value.name, species: pet.value.species, birthdate, vaccines }
    await api.put(`/pets/${pet.value.id}`, payload)

    message.success('Pet atualizado com sucesso!')
    router.push('/pets')
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Erro do backend:', err.response?.data)
      message.error(err.response?.data?.message || 'Erro ao salvar o pet.')
    } else {
      message.error('Erro inesperado.')
      console.warn(err)
    }
  }
}

function goBack() { router.push('/pets') }

function formatarData(date: string): string { return new Date(date).toLocaleDateString('pt-BR') }

onMounted(fetchPet)
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
