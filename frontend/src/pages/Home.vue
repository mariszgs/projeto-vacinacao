<template>
  <div>
    <h1>Bem-vindo ao Projeto Vacinação</h1>

    <!-- Grid Responsivo de Estatísticas -->


    <!-- Alerta de Vacinas Atrasadas -->
    <n-alert
      v-if="overdueVaccines > 0"
      type="warning"
      show-icon
      style="margin-top: 24px;"
      title="Existem pets com vacinas atrasadas. Verifique a lista de pets."
    />

    <!-- Calendário de Vacinação -->
    <n-card
      title="Calendário de Vacinação"
      bordered
      style="margin-top: 24px;"
    >
      <n-calendar
        v-model:value="calendarDate"
        :show-time="true"
        @update:value="handleCalendarChange"
        :locale="naiveLocale"
        :formatter="formatter"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ptBR as naiveLocale } from "naive-ui";
import { ptBR } from "date-fns/locale/pt-BR";
import { format } from "date-fns";

// Dados simulados
const totalPets = ref(20);
const vaccinesApplied = ref(150);
const overdueVaccines = ref(3);

// Timestamp
const calendarDate = ref(Date.now());

// Traduzindo o calendário
const formatter = {
  title: (date: Date) => format(new Date(date), "MMMM yyyy", { locale: ptBR }),
  weekday: (date: Date) => format(new Date(date), "EEE", { locale: ptBR }),
  day: (date: Date) => format(new Date(date), "d", { locale: ptBR })
};

function handleCalendarChange(timestamp: number) {
  const dataFormatada = format(new Date(timestamp), "dd/MM/yyyy", {
    locale: ptBR
  });
  console.log("Data selecionada:", dataFormatada);
}
</script>
