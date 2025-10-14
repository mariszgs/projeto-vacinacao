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

      <!-- Vacinas Aplicadas Recentes (somente exibição) -->
      <n-divider>Vacinas Aplicadas Recentemente</n-divider>
      <div v-if="vacinasRecentes.length">
        <div v-for="vac in vacinasRecentes" :key="vac.id" class="recent-vaccine">
          {{ vac.name }} - {{ formatarData(new Date(vac.date || 0).toISOString()) }}
        </div>
      </div>
      <n-empty v-else description="Nenhuma vacina recente." />

      <!-- Vacinas Agendadas -->
      <n-divider>Vacinas Agendadas</n-divider>
      <n-table v-if="vacinasAgendadas.length" :data="vacinasAgendadas" :bordered="false" size="small">
        <thead>
          <tr>
            <th>Nome da Vacina</th>
            <th>Data Agendada</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vac in vacinasAgendadas" :key="vac.id">
            <td>{{ vac.vacina.nome }}</td>
            <td>{{ formatarData(vac.data_agendada || vac.data_aplicacao) }}</td>
            <td>
              <n-button type="error" size="tiny" @click="cancelVaccine(vac.id)">Cancelar</n-button>
            </td>
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
  data_agendada?: string
}

interface Pet {
  id: number
  name: string
  species: string
  birthdate: number | null
  vaccines: Vaccine[]
}

interface VacinaDisponivel {
  id: number
  nome: string
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
const vacinasRecentes = ref<Vaccine[]>([]) // vacinas aplicadas recentemente

const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' }
]

const vacinasDisponiveis = ref<{ label: string; value: number }[]>([])

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
  birthdate: [
  {
    required: true,
    validator: (rule, value) => {
      if (!value || value <= 0) return new Error('Data de nascimento é obrigatória')
      return true
    },
    trigger: 'change'
  }
], 
  vaccines: [
    { required: true, type: 'array', message: 'Adicione pelo menos uma vacina', trigger: 'change' },
    {
      validator: (rule, value) => {
        if (!value || !value.length) return new Error('Adicione pelo menos uma vacina')
        for (const v of value) {
          if (!v.name) return new Error('Nome da vacina é obrigatório')
          if (!v.date) return new Error('Data da vacina é obrigatória')
        }
        return true
      },
      trigger: 'change'
    }
  ]
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
    separarVacinas(data.vacinas_aplicadas || [], data.vacinas_agendadas || [])
  } catch (err) {
    console.error(err)
    message.error('Erro ao carregar dados do pet.')
    router.push('/pets')
  }
}

async function fetchVacinas() {
  try {
    const { data } = await api.get('/vacinas')
    const items = Array.isArray(data.items) ? data.items : []
    vacinasDisponiveis.value = items.map((v: VacinaDisponivel) => ({ label: v.nome, value: v.id }))
  } catch (err) {
    console.error('Erro ao carregar vacinas:', err)
    message.error('Erro ao carregar vacinas disponíveis.')
  }
}

function separarVacinas(vacinasAplicadas: any[], vacinasAgendar: any[]) {
  const hoje = new Date().setHours(0, 0, 0, 0)
  const umAnoAtras = new Date()
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)
  umAnoAtras.setHours(0, 0, 0, 0)

  vacinasRecentes.value = []
  vacinasAtrasadas.value = []
  vacinasAgendadas.value = []

  vacinasAplicadas.forEach(v => {
    const dataAplicacao = new Date(v.data_aplicacao).setHours(0, 0, 0, 0)
    if (dataAplicacao >= hoje) {
      vacinasAgendadas.value.push({ id: v.id, vacina: v.vacina, data_aplicacao: v.data_aplicacao, data_agendada: v.data_aplicacao })
    } else if (dataAplicacao < hoje && dataAplicacao >= umAnoAtras.getTime()) {
      vacinasRecentes.value.push({ id: v.id, name: v.vacina.nome, date: dataAplicacao })
    } else {
      vacinasAtrasadas.value.push({ id: v.id, vacina: v.vacina, data_aplicacao: v.data_aplicacao })
    }
  })

  vacinasAgendar.forEach(v => {
    vacinasAgendadas.value.push({
      id: v.id,
      vacina: v.vacina,
      data_aplicacao: v.data_aplicacao || v.data_agendada,
      data_agendada: v.data_agendada || v.data_aplicacao
    })
  })
}

async function savePet() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()

    const token = localStorage.getItem('token')
    if (!token) {
      message.error('Você precisa estar logado!')
      return
    }

    const birthdate = pet.value.birthdate
    ? new Date(pet.value.birthdate).toISOString().split('T')[0]
    : null


    await api.put(`/pets/${pet.value.id}`, {
      name: pet.value.name,
      species: pet.value.species,
      birthdate
    })

    const hoje = new Date().setHours(0, 0, 0, 0)

    for (const vacina of pet.value.vaccines) {
      if (!vacina.name || !vacina.date) continue

      const vacinaTime = new Date(vacina.date).setHours(0, 0, 0, 0)
      const dataISO = new Date(vacina.date).toISOString().split('T')[0]

      const payload = {
        pet_id: pet.value.id,
        vacina_id: vacina.name,
        observacoes: null,
        data_aplicacao: vacinaTime <= hoje ? dataISO : null,
        data_agendada: dataISO // sempre envia
      }

      await api.post('/agendamento-de-vacinas', payload)
    }

    message.success('Pet e vacinas salvos com sucesso!')
    router.push('/pets')
  } catch (err: any) {
    console.error('Erro ao salvar pet:', err.response?.data || err)
    message.error(err.response?.data?.message || 'Erro ao salvar pet.')
  }
}



async function cancelVaccine(vacId: number) {
  try {
    await api.delete(`/agendamento-de-vacinas/${vacId}`)
    vacinasAgendadas.value = vacinasAgendadas.value.filter(v => v.id !== vacId)
    message.success('Vacina cancelada com sucesso!')
  } catch (err) {
    console.error('Erro ao cancelar vacina:', err)
    message.error('Não foi possível cancelar a vacina.')
  }
}

function goBack() { router.push('/pets') }
function formatarData(date: string): string { return new Date(date).toLocaleDateString('pt-BR') }

onMounted(() => {
  fetchPet()
  fetchVacinas()
})
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

.recent-vaccine {
  padding: 4px 0;
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
