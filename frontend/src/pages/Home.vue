<template>
  <div>
    <h1>Bem-vindo ao Projeto Vacinação</h1>

    <!-- Grid de Estatísticas -->
    <n-grid cols="3" x-gap="20" y-gap="20" style="margin-top: 24px;">
      <n-card title="Total de Pets" bordered>
        <n-statistic :value="totalPets" />
      </n-card>

      <n-card title="Vacinas Aplicadas" bordered>
        <n-statistic :value="vaccinesApplied" />
      </n-card>

      <n-card title="Vacinas Atrasadas" bordered>
        <n-statistic :value="overdueVaccines" status="error" />
      </n-card>
    </n-grid>

    <!-- Alerta de Vacinas Atrasadas -->
    <n-alert
      v-if="overdueVaccines > 0"
      type="warning"
      show-icon
      style="margin-top: 24px;"
      title="Existem pets com vacinas atrasadas. Verifique a lista de pets."
    />

    <!-- Calendário de Vacinação -->
    <n-card title="Calendário de Vacinação" bordered style="margin-top: 24px;">
      <n-calendar
        v-model="calendarDate"
        :date="calendarDate"
        :show-time="true"
        @change="handleCalendarChange"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Dados simulados
const totalPets = ref(20);
const vaccinesApplied = ref(150);
const overdueVaccines = ref(3);

// Calendário de Vacinação
const calendarDate = ref(new Date()); // Data do calendário

function handleCalendarChange(date: Date) {
  console.log('Data selecionada:', date);
}

function scheduleVaccination() {
  // Função para agendar vacina
  console.log('Vacinação agendada para:', calendarDate.value);
}
</script>

<style scoped>
/* Estilos personalizados para o formulário de edição */
n-card {
  max-width: 600px;
  margin: 20px auto;
}

n-form-item {
  margin-bottom: 16px;
}

n-button {
  margin-top: 16px;
}
</style>
