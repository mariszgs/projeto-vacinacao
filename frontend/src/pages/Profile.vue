<template>
  <n-card title="Perfil do Usuário" style="max-width: 600px; margin: 20px auto;">
    <n-form :model="user" ref="formRef">
      <!-- Nome -->
      <n-form-item label="Nome" path="name">
        <n-input v-model="user.name" placeholder="Digite seu nome" />
      </n-form-item>

      <!-- Email (nome de usuário no backend) -->
      <n-form-item label="Email" path="email">
        <n-input v-model="user.email" placeholder="Digite seu email" />
      </n-form-item>

      <!-- Senha (opcional) -->
      <n-form-item label="Nova Senha (opcional)" path="password">
        <n-input
          v-model="user.password"
          type="password"
          placeholder="Digite nova senha (ou deixe em branco)"
        />
      </n-form-item>

      <n-form-item label="Confirmação de Senha" path="password_confirmation">
        <n-input
          v-model="user.password_confirmation"
          type="password"
          placeholder="Confirme a nova senha"
        />
      </n-form-item>

      <n-button type="primary" @click="saveProfile">Salvar Alterações</n-button>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Dados do usuário
const user = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

// Carrega dados do usuário logado ao montar o componente
onMounted(async () => {
  try {
    const response = await axios.get('/api/user')
    console.log('Dados do usuário:', response.data);
    user.value.name = response.data.name
    user.value.email = response.data.email
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
    alert('Erro ao carregar dados do usuário.')
  }
})

// Salva perfil no backend
async function saveProfile() {
  try {
    // Monta payload
    const payload: any = {
      name: user.value.name,
      email: user.value.email
    }

    if (user.value.password) {
      payload.password = user.value.password
      payload.password_confirmation = user.value.password_confirmation
    }

    const response = await axios.put('/api/user', payload)
    alert(response.data.message || 'Perfil atualizado com sucesso!')
  } catch (error: any) {
    console.error('Erro ao salvar perfil:', error)
    if (error.response?.data?.errors) {
      alert('Erro de validação: ' + JSON.stringify(error.response.data.errors))
    } else {
      alert('Erro ao salvar perfil.')
    }
  }
}
</script>

<style scoped>
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
