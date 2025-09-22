<template>
  <n-card title="Vacinas do Pet" class="pet-detail-card">
    <div class="vaccines-section">
      <h3>Vacinas Atrasadas</h3>
      <ul class="vaccines-list">
        <li v-for="vacina in overdueVaccines" :key="vacina.id" class="vaccine-item">
          <span class="vaccine-name">{{ vacina.name }}</span>  
          <span class="vaccine-date">{{ formatDateBR(vacina.date) }}</span> 
          <span class="vaccine-status red">Atrasada</span>
        </li>
      </ul>
      
      <h3>Vacinas em Dia</h3>
      <ul class="vaccines-list">
        <li v-for="vacina in inDateVaccines" :key="vacina.id" class="vaccine-item">
          <span class="vaccine-name">{{ vacina.name }}</span>  
          <span class="vaccine-date">{{ formatDateBR(vacina.date) }}</span>  
          <span class="vaccine-status green">Em Dia</span>
        </li>
      </ul>
      
      <h3>Vacinas Necessárias</h3>
      <ul class="vaccines-list">
        <li v-for="vacina in necessaryVaccines" :key="vacina.name" class="vaccine-item">
          <span class="vaccine-name">{{ vacina.name }}</span>  
          <span class="vaccine-status orange">Necessária</span>
        </li>
      </ul>
    </div>

    <div class="back-btn-wrapper">
      <n-button @click="goBack" type="primary">Voltar</n-button>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Vaccine {
  id: number
  name: string
  date: string
}
interface Pet {
  id: number
  name: string
  species: string
  age: number
  vaccines: Vaccine[]
}

const route = useRoute()
const router = useRouter()

const pet = ref<Pet>({
  id: 0,
  name: '',
  species: '',
  age: 0,
  vaccines: []
})

onMounted(() => {
  const petId = Number(route.params.id)
  pet.value = {
    id: petId,
    name: petId === 1 ? 'Rex' : 'Mimi',
    species: petId === 1 ? 'Cachorro' : 'Gato',
    age: petId === 1 ? 4 : 2,
    vaccines: [
      { id: 1, name: 'Vacina Raiva', date: '2025-01-10' },
      { id: 2, name: 'Vacina V8', date: '2022-03-15' },
      { id: 3, name: 'Vacina Parvovirose', date: '2023-04-01' }
    ]
  }
})

function isVaccineLate(vacDate: string): boolean {
  const dateVaccine = new Date(vacDate)
  const now = new Date()
  const diffTime = now.getTime() - dateVaccine.getTime()
  const diffDays = diffTime / (1000 * 3600 * 24)
  return diffDays > 365
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

const overdueVaccines = computed(() =>
  pet.value.vaccines.filter(v => isVaccineLate(v.date))
)
const inDateVaccines = computed(() =>
  pet.value.vaccines.filter(v => !isVaccineLate(v.date))
)

const necessaryVaccines = computed(() => {
  if (pet.value.species === 'Cachorro') {
    return [
      { name: 'Vacina Raiva' },
      { name: 'Vacina V8' },
      { name: 'Vacina Parvovirose' }
    ]
  } else if (pet.value.species === 'Gato') {
    return [
      { name: 'Vacina V3' },
      { name: 'Vacina Leucemia Felina' }
    ]
  }
  return []
})

function goBack() {
  router.back()
}
</script>

<style scoped>
.pet-detail-card {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.vaccines-section {
  margin-top: 20px;
}

.vaccines-section h3 {
  font-size: 20px;
  margin: 15px 0 10px;
  color: #222;
}

.vaccines-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.vaccine-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: #555;
  border-bottom: 1px solid #eee;
  padding: 6px 0;
}

.vaccine-name {
  font-weight: bold;
  margin-right: 5px;
}

.vaccine-date {
  margin-right: 10px;
}

.vaccine-status {
  font-weight: bold;
}
.vaccine-status.green { color: green; }
.vaccine-status.red { color: rgb(230, 34, 34); }
.vaccine-status.orange { color: orange; }

/* Botão voltar */
.back-btn-wrapper {
  margin-top: 20px;
  text-align: right;
}
@media (max-width: 768px) {
  .back-btn-wrapper {
    text-align: center;
  }

  /* Itens de vacina em coluna no mobile */
  .vaccine-item {
    flex-direction: column;
    align-items: flex-start;
    font-size: 14px;
  }

  .vaccine-name,
  .vaccine-date,
  .vaccine-status {
    margin: 2px 0;
  }
}
</style>
