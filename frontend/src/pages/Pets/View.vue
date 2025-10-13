<template>
  <n-card title="Detalhes do Pet" class="pet-detail-card">
    <div v-if="pet">
      <h2>{{ pet.name }}</h2>
      <p><strong>Espécie:</strong> {{ pet.species }}</p>
      <p><strong>Data de Nascimento:</strong> {{ formatDateBR(pet.birthdate) }}</p>

      <div class="vaccines-section" v-if="pet.vacinasAplicadas && pet.vacinasAplicadas.length">
        <!-- Vacinas Aplicadas / Atrasadas -->
        <h3>Vacinas Aplicadas</h3>
        <ul class="vaccines-list" v-if="vacinasAplicadas.length">
          <li v-for="vacina in vacinasAplicadas" :key="vacina.id" class="vaccine-item">
            <span class="vaccine-name">{{ vacina.vacina.nome }}</span>
            <span class="vaccine-date">{{ formatDateBR(vacina.data_aplicacao) }}</span>
            <span
              class="vaccine-status"
              :class="isVacinaAtrasada(vacina) ? 'red' : 'green'"
            >
              {{ isVacinaAtrasada(vacina) ? 'Atrasada' : 'Em Dia' }}
            </span>
          </li>
        </ul>
        <p v-else>Nenhuma vacina aplicada.</p>

        <!-- Vacinas Agendadas -->
        <h3>Vacinas Agendadas</h3>
        <ul class="vaccines-list" v-if="vacinasAgendadas.length">
          <li v-for="vacina in vacinasAgendadas" :key="vacina.id" class="vaccine-item">
            <span class="vaccine-name">{{ vacina.vacina.nome }}</span>
            <span class="vaccine-date">{{ formatDateBR(vacina.data_aplicacao) }}</span>
            <span class="vaccine-status blue">Agendada</span>
          </li>
        </ul>
        <p v-else>Nenhuma vacina agendada.</p>
      </div>
      <div v-else>
        <p>Sem vacinas registradas.</p>
      </div>
    </div>

    <div class="back-btn-wrapper">
      <n-button @click="goBack" type="primary">Voltar</n-button>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

interface VacinaAplicada {
  id: number
  vacina: { id: number; nome: string }
  data_aplicacao: string
  data_proxima_dose?: string | null
}

interface Pet {
  id: number
  name: string
  species: string
  birthdate: string
  vacinasAplicadas: VacinaAplicada[]
}

const route = useRoute()
const router = useRouter()
const pet = ref<Pet | null>(null)

const vacinasAplicadas = ref<VacinaAplicada[]>([])
const vacinasAgendadas = ref<VacinaAplicada[]>([])

// Buscar dados do pet
async function fetchPet() {
  try {
    const petId = Number(route.params.id)
    const token = localStorage.getItem('token') || ''
    const response = await axios.get(`http://localhost:8000/api/pets/${petId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = response.data
    pet.value = {
      ...data,
      vacinasAplicadas: data.vacinas_aplicadas || []
    }
    separarVacinas()
  } catch (error) {
    console.error('Erro ao buscar pet:', error)
  }
}

// Separar vacinas em aplicadas (em dia ou atrasadas) e agendadas
function separarVacinas() {
  const hoje = new Date().setHours(0, 0, 0, 0)

  vacinasAgendadas.value = pet.value?.vacinasAplicadas.filter(
    v => new Date(v.data_aplicacao).getTime() > hoje
  ) || []

  vacinasAplicadas.value = pet.value?.vacinasAplicadas.filter(
    v => new Date(v.data_aplicacao).getTime() <= hoje
  ) || []
}

// Verifica se a vacina está atrasada
function isVacinaAtrasada(vacina: VacinaAplicada): boolean {
  const hoje = new Date().setHours(0, 0, 0, 0)
  return vacina.data_proxima_dose ? new Date(vacina.data_proxima_dose).getTime() < hoje : false
}

// Formatar data para pt-BR
function formatDateBR(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`
}

function goBack() {
  router.back()
}

onMounted(fetchPet)
</script>


<style scoped>
.pet-detail-card {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  background-color: #fff;
}

.vaccines-section {
  margin-top: 20px;
}

.vaccines-section h3 {
  font-size: 18px;
  margin: 10px 0 5px;
}

.vaccines-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.vaccine-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 16px;
  color: #555;
}

.vaccine-name {
  font-weight: bold;
  margin-right: 10px;
}

.vaccine-date {
  margin-right: 10px;
}

.vaccine-status {
  font-weight: bold;
}
.vaccine-status.green { color: green; }
.vaccine-status.red { color: rgb(230,34,34); }
.vaccine-status.blue { color: #007BFF; }

.back-btn-wrapper {
  margin-top: 20px;
  text-align: right;
}

@media (max-width: 768px) {
  .back-btn-wrapper {
    text-align: center;
  }
  .vaccine-item {
    flex-direction: column;
    align-items: flex-start;
    font-size: 14px;
  }
  .vaccine-name, .vaccine-date, .vaccine-status {
    margin: 2px 0;
  }
}
</style>
