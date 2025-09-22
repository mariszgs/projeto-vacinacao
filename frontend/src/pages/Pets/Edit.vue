<template>
  <n-card title="Editar Pet" style="max-width: 600px; margin: 20px auto;">
    <n-form :model="pet" ref="formRef">
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

      <n-form-item label="Idade" path="age">
        <n-input-number v-model:value="pet.age" :min="0" placeholder="Digite a idade" />
      </n-form-item>

      <!-- Lista de Vacinas -->
      <n-form-item
        label="Vacinas"
        v-for="(vacina, index) in pet.vaccines"
        :key="vacina.id"
      >
        <div class="vaccine-fields">
          <n-input v-model:value="vacina.name" placeholder="Nome da vacina" />
          <n-date-picker
            v-model:value="vacina.date"
            type="date"
            placeholder="Data da vacina"
            :disabled-date="disabledDate"
            format="dd/MM/yyyy"
            value-format="timestamp"
          />
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

interface Vaccine {
  id: number
  name: string
  date: number | null  // timestamp ou null
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
  vaccines: [
    { id: 1, name: 'Vacina Raiva', date: null },
    { id: 2, name: 'Vacina V8', date: null }
  ]
})

const speciesOptions = [
  { label: 'Cachorro', value: 'Cachorro' },
  { label: 'Gato', value: 'Gato' },
  { label: 'Outro', value: 'Outro' }
]

// Função para desabilitar datas passadas
function disabledDate(current: Date): boolean {
  return current && current < new Date()
}

onMounted(() => {
  const petId = Number(route.params.id)
  // Simulando carregamento de dados — aqui você pode puxar da API, por ex.
  pet.value = {
    id: petId,
    name: 'Rex',
    species: 'Cachorro',
    age: 4,
    vaccines: [
      { id: 1, name: 'Vacina Raiva', date: new Date('2024-01-10').getTime() },
      { id: 2, name: 'Vacina V8', date: new Date('2022-03-15').getTime() }
    ]
  }
})

// Adicionar nova vacina
function addVaccine() {
  const newVaccine: Vaccine = { id: Date.now(), name: '', date: null }
  pet.value.vaccines.push(newVaccine)
}

// Remover vacina
function removeVaccine(index: number) {
  pet.value.vaccines.splice(index, 1)
}

// Salvar pet (simulado)
function savePet() {
  console.log('Salvando pet:', pet.value)
  router.push('/pets')
}

// Voltar para lista
function goBack() {
  router.push('/pets')
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
