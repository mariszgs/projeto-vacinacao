<template>
  <n-card title="Perfil do Usuário" style="max-width: 600px; margin: 20px auto;">
    <n-form :model="user" ref="formRef">
      <!-- Exibe e permite editar o nome -->
      <n-form-item label="Nome" path="name">
        <n-input v-model="user.name" placeholder="Digite seu nome" />
        <n-button
          type="primary"
          size="small"
          style="margin-top: 12px; margin-bottom: 12px; margin-left: 5px;"
          @click="updateName"
        >
          Atualizar Nome
        </n-button>
      </n-form-item>

      <!-- Exibe e permite editar o nome de usuário -->
      <n-form-item label="Nome de Usuário" path="username">
        <n-input v-model="user.username" placeholder="Digite seu nome de usuário" />
        <n-button
          type="primary"
          size="small"
          style="margin-top: 12px; margin-bottom: 12px; margin-left: 5px;"
          @click="updateUsername"
        >
          Atualizar Usuário
        </n-button>
      </n-form-item>

      <!-- Exibe e permite editar a senha -->
      <n-form-item label="Senha" path="password">
        <n-input
          v-model="user.password"
          type="password"
          placeholder="Digite sua senha"
        />
        <n-button
          type="primary"
          size="small"
          style="margin-top: 12px; margin-bottom: 12px; margin-left: 5px;"
          @click="updatePassword"
        >
          Atualizar Senha
        </n-button>
      </n-form-item>

      <n-button type="primary" @click="saveProfile">Salvar Alterações</n-button>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Definindo dados do usuário (simulados aqui)
const user = ref({
  name: '',
  username: '',
  password: ''
});

// Supondo que o login do usuário já tenha ocorrido e as informações são passadas para o sistema
onMounted(() => {
  // Aqui você pode substituir com dados reais que vêm de uma API ou de um sistema de login
  // Exemplo simulado:
  user.value = {
    name: 'Mariana Gomes',
    username: 'mariana123',
    password: 'senha123'
  };
});

// Funções para atualizar os campos do usuário

function updateName() {
  console.log('Nome atualizado:', user.value.name);
  // Aqui você pode integrar com a API para atualizar o nome do usuário
}

function updateUsername() {
  console.log('Usuário atualizado:', user.value.username);
  // Aqui você pode integrar com a API para atualizar o nome de usuário
}

function updatePassword() {
  console.log('Senha atualizada:', user.value.password);
  // Aqui você pode integrar com a API para atualizar a senha
}

// Função para salvar as alterações do perfil
function saveProfile() {
  console.log('Perfil salvo:', user.value);
  // Aqui você pode integrar com uma API para salvar as alterações no backend
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
  margin-top: 10px;
}
</style>
