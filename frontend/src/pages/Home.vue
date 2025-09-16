<template>
  <div>
    <h1>Bem-vindo ao Projeto Vacinação</h1>

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

    <n-alert
      v-if="overdueVaccines > 0"
      type="warning"
      show-icon
      style="margin-top: 24px;"
      title="Existem pets com vacinas atrasadas. Verifique a lista de pets."
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const totalPets = ref(20);
const vaccinesApplied = ref(150);
const overdueVaccines = ref(3);
</script>
