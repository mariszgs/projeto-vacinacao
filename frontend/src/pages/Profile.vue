<template>
  <n-card title="Perfil do Usuário" style="max-width: 600px; margin: 20px auto;">
    <div v-if="loading">
      <n-skeleton text :repeat="3" />
    </div>

    <div v-else>
      <!-- Modo visualização -->
      <div v-if="!isEditing">
        <n-descriptions bordered label-placement="top" column="1">
          <n-descriptions-item label="Nome">{{ user.name }}</n-descriptions-item>
          <n-descriptions-item label="Email">{{ user.email }}</n-descriptions-item>
          <n-descriptions-item label="Criado em">{{ formatDate(user.created_at) }}</n-descriptions-item>
        </n-descriptions>
        <n-button type="primary" style="margin-top: 12px;" @click="isEditing = true">
          Editar Perfil
        </n-button>
      </div>

      <!-- Modo edição -->
      <div v-else>
        <n-form :model="userForm" ref="formRef">
          <n-form-item label="Nome" path="name">
            <n-input v-model:value="userForm.name" placeholder="Digite seu nome" />
          </n-form-item>

          <n-form-item label="Email" path="email">
            <n-input v-model:value="userForm.email" placeholder="Digite seu email" />
          </n-form-item>

          <n-form-item label="Nova Senha (opcional)" path="password">
            <n-input
              v-model="userForm.password"
              type="password"
              placeholder="Digite nova senha (ou deixe em branco)"
            />
          </n-form-item>

          <n-form-item label="Confirmação de Senha" path="password_confirmation">
            <n-input
              v-model="userForm.password_confirmation"
              type="password"
              placeholder="Confirme a nova senha"
            />
          </n-form-item>

          <n-button type="primary" @click="saveProfile">Salvar Alterações</n-button>
          <n-button type="default" style="margin-left: 8px;" @click="cancelEdit">Cancelar</n-button>
        </n-form>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface User {
  name: string
  email: string
  created_at: string
}

interface UserForm {
  name: string
  email: string
  password?: string
  password_confirmation?: string
}

// Estado
const user = ref<User>({
  name: '',
  email: '',
  created_at: ''
})

const userForm = ref<UserForm>({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const loading = ref(true)
const isEditing = ref(false)

// Configura token do usuário
const token = localStorage.getItem('token')
if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token

// Formata datas
function formatDate(dateString: string) {
  return dateString ? new Date(dateString).toLocaleDateString('pt-BR') : '-'
}

// Carrega dados do usuário
async function loadUser() {
  try {
    const response = await axios.get('/user')
    user.value = response.data
    resetForm()
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUser()
})

// Reseta formulário
function resetForm() {
  userForm.value.name = user.value.name
  userForm.value.email = user.value.email
  userForm.value.password = ''
  userForm.value.password_confirmation = ''
}

// Cancela edição
function cancelEdit() {
  isEditing.value = false
  resetForm()
}

// Salva perfil
async function saveProfile() {
  try {
    const payload: any = {
      name: userForm.value.name,
      email: userForm.value.email
    }

    if (userForm.value.password) {
      payload.password = userForm.value.password
      payload.password_confirmation = userForm.value.password_confirmation
    }

    const response = await axios.put('/user', payload)
    user.value = response.data.user
    isEditing.value = false
    resetForm()
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
