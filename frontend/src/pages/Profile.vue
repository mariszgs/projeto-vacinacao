<template>
  <n-card 
    :title="isEditing ? 'Editar Perfil' : 'Perfil do Usuário'" 
    class="profile-card"
    :bordered="true"
  >
    <transition name="fade" mode="out-in">
      <div v-if="loading" key="loading" class="loading-container">
        <n-skeleton height="24px" width="60%" style="margin-bottom: 16px;" />
        <n-skeleton text :repeat="4" />
      </div>

      <div v-else-if="user.name" key="content">
        <!-- Modo visualização -->
        <div v-if="!isEditing" class="profile-view">
          <div class="avatar-section">
            <n-avatar
              round
              size="large"
              :style="{ backgroundColor: '#18a058' }"
              class="user-avatar"
            >
              {{ getInitials(user.name) }}
            </n-avatar>
            <div class="user-info">
              <h2 class="user-name">{{ user.name }}</h2>
              <p class="user-email">{{ user.email }}</p>
            </div>
          </div>

          <n-divider class="custom-divider" />

          <div class="profile-info-mobile">
            <div class="info-item">
              <span class="info-label">Nome</span>
              <span class="info-value">{{ user.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Membro desde</span>
              <span class="info-value">{{ formatDate(user.created_at) }}</span>
            </div>
          </div>

          <n-descriptions 
            bordered 
            label-placement="left" 
            :column="1" 
            class="profile-details-desktop"
          >
            <n-descriptions-item label="Nome">
              <n-text strong>{{ user.name }}</n-text>
            </n-descriptions-item>
            <n-descriptions-item label="Email">
              <n-text>{{ user.email }}</n-text>
            </n-descriptions-item>
            <n-descriptions-item label="Membro desde">
              <n-text>{{ formatDate(user.created_at) }}</n-text>
            </n-descriptions-item>
          </n-descriptions>

          <div class="actions">
            <n-button type="primary" @click="isEditing = true" size="large" class="action-btn">
              Editar Perfil
            </n-button>
          </div>
        </div>

        <!-- Modo edição -->
        <div v-else class="edit-form">
          <n-form 
            :model="userForm" 
            ref="formRef"
            :rules="rules"
            label-placement="top"
            label-width="auto"
            class="responsive-form"
          >
            <n-form-item label="Nome" path="name">
              <n-input 
                v-model:value="userForm.name" 
                placeholder="Digite seu nome completo"
                size="large"
                class="form-input"
              />
            </n-form-item>

            <n-form-item label="Email" path="email">
              <n-input 
                v-model:value="userForm.email" 
                placeholder="Digite seu email"
                size="large"
                type="email"
                class="form-input"
              />
            </n-form-item>

            <n-collapse :default-expanded-names="['password']" accordion class="password-collapse">
              <n-collapse-item title="Alterar Senha" name="password">
                <n-form-item label="Nova Senha" path="password">
                  <n-input
                    v-model:value="userForm.password"
                    type="password"
                    placeholder="Digite nova senha"
                    show-password-on="click"
                    size="large"
                    class="form-input"
                  />
                </n-form-item>

                <n-form-item label="Confirmação de Senha" path="password_confirmation">
                  <n-input
                    v-model:value="userForm.password_confirmation"
                    type="password"
                    placeholder="Confirme a nova senha"
                    show-password-on="click"
                    size="large"
                    class="form-input"
                  />
                </n-form-item>
              </n-collapse-item>
            </n-collapse>

            <div class="form-actions">
              <n-button 
                type="primary" 
                @click="saveProfile" 
                :loading="saving"
                size="large"
                class="action-btn"
              >
                Salvar Alterações
              </n-button>
              <n-button 
                type="default" 
                @click="cancelEdit" 
                :disabled="saving"
                size="large"
                class="action-btn"
              >
                Cancelar
              </n-button>
            </div>
          </n-form>
        </div>
      </div>

      <!-- Quando não há usuário -->
      <div v-else key="no-user" class="no-user-container">
        <n-result
          status="404"
          title="Usuário não encontrado"
          :description="errorMessage || 'Não foi possível carregar os dados do usuário.'"
        >
          <template #footer>
            <n-button @click="loadUser" type="primary">
              Tentar Novamente
            </n-button>
            <n-button @click="debugResponse" type="default" style="margin-left: 10px;">
              Debug Resposta
            </n-button>
          </template>
        </n-result>
      </div>
    </transition>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'

interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

interface UserForm {
  name: string
  email: string
  password?: string
  password_confirmation?: string
}

const user = ref<User>({ 
  id: 0, 
  name: '', 
  email: '', 
  created_at: '', 
  updated_at: '' 
})
const userForm = ref<UserForm>({ 
  name: '', 
  email: '', 
  password: '', 
  password_confirmation: '' 
})
const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const formRef = ref<FormInst | null>(null)
const message = useMessage()
const errorMessage = ref<string>('')
const lastResponse = ref<any>(null)

// Função para debug da resposta
function debugResponse() {
  console.log('Última resposta da API:', lastResponse.value)
  if (lastResponse.value) {
    console.log('- response.data:', lastResponse.value.data)
    console.log('- response.data.data:', lastResponse.value.data?.data)
    console.log('- response.data.user:', lastResponse.value.data?.user)
  }
}

// Configurar axios com token
function setupAxiosHeaders() {
  const token = localStorage.getItem('token')
  if (token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
  }
}

// Regras de validação
const rules: FormRules = {
  name: [
    { required: true, message: 'Nome é obrigatório', trigger: 'blur' },
    { min: 2, message: 'Nome deve ter pelo menos 2 caracteres', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email é obrigatório', trigger: 'blur' },
    { type: 'email', message: 'Email inválido', trigger: 'blur' }
  ],
  password: [
    { 
      min: 6, 
      message: 'Senha deve ter pelo menos 6 caracteres', 
      trigger: 'blur' 
    }
  ],
  password_confirmation: [
    { 
      validator: (rule, value) => {
        if (!userForm.value.password) return true
        return value === userForm.value.password
      },
      message: 'As senhas não coincidem',
      trigger: ['blur', 'input']
    }
  ]
}

function getInitials(name: string): string {
  if (!name) return 'US'
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

async function loadUser() {
  try {
    loading.value = true
    errorMessage.value = ''
    
    // Verificar se tem token
    const token = localStorage.getItem('token')
    if (!token) {
      errorMessage.value = 'Usuário não autenticado. Faça login novamente.'
      loading.value = false
      return
    }

    setupAxiosHeaders()
    
    const response = await axios.get('http://localhost:8000/api/user')
    lastResponse.value = response
    let userData = null
    
    if (response.data.data) {
      userData = response.data.data
    } else if (response.data.user) {
      userData = response.data.user
    } else {
      userData = response.data
    }

    if (userData && userData.name) {
      user.value = userData
      resetForm()
    } else {
      throw new Error('Estrutura de dados do usuário inválida')
    }
    
  } catch (error: any) {
    
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
      
      if (error.response.status === 401) {
        errorMessage.value = 'Sessão expirada. Faça login novamente.'
        message.error('Sessão expirada. Faça login novamente.')
        localStorage.removeItem('token')
      } else if (error.response.status === 404) {
        errorMessage.value = 'Endpoint não encontrado. Verifique a URL da API.'
        message.error('Endpoint não encontrado. Verifique a URL da API.')
      } else if (error.response.status === 500) {
        errorMessage.value = 'Erro interno do servidor. Tente novamente mais tarde.'
        message.error('Erro interno do servidor.')
      } else {
        errorMessage.value = `Erro ${error.response.status}: ${error.response.data?.message || 'Erro ao carregar perfil'}`
        message.error(errorMessage.value)
      }
    } else if (error.request) {
      console.error(' Sem resposta do servidor:', error.request)
      errorMessage.value = 'Servidor não respondendo. Verifique se o backend está rodando na porta 8000.'
      message.error('Servidor não respondendo. Verifique se o backend está rodando.')
    } else {
      errorMessage.value = 'Erro inesperado: ' + error.message
      message.error('Erro inesperado: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  userForm.value.name = user.value.name
  userForm.value.email = user.value.email
  userForm.value.password = ''
  userForm.value.password_confirmation = ''
}

function cancelEdit() {
  isEditing.value = false
  resetForm()
}

async function saveProfile() {
  try {
    saving.value = true
    
    await formRef.value?.validate()

    const payload: any = {
      name: userForm.value.name,
      email: userForm.value.email
    }

    if (userForm.value.password && userForm.value.password.trim() !== '') {
      payload.password = userForm.value.password
      payload.password_confirmation = userForm.value.password_confirmation
    }

    setupAxiosHeaders()
    const response = await axios.put('http://localhost:8000/api/user', payload)
    
    let userData = null
    
    if (response.data.data) {
      userData = response.data.data
    } else if (response.data.user) {
      userData = response.data.user
    } else {
      userData = response.data
    }

    user.value = userData
    isEditing.value = false
    resetForm()
    
    message.success('Perfil atualizado com sucesso!')
  } catch (error: any) {
    console.error('Erro ao salvar perfil:', error)
    
    if (error.response?.status === 422) {
      const errors = error.response.data.errors
      Object.values(errors).flat().forEach((err: any) => {
        message.error(err)
      })
    } else if (error.response?.status === 401) {
      message.error('Sessão expirada. Faça login novamente.')
      localStorage.removeItem('token')
    } else {
      message.error('Erro ao salvar perfil.')
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.profile-card {
  max-width: 600px;
  margin: 0 auto;
}

.loading-container,
.no-user-container {
  padding: 20px;
  text-align: center;
}

.avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  margin-right: 16px;
}

.user-info h2 {
  margin: 0;
  color: #333;
}

.user-email {
  margin: 4px 0 0 0;
  color: #666;
}

.custom-divider {
  margin: 24px 0;
}

.profile-info-mobile {
  display: block;
}

@media (min-width: 768px) {
  .profile-info-mobile {
    display: none;
  }
}

.profile-details-desktop {
  display: none;
}

@media (min-width: 768px) {
  .profile-details-desktop {
    display: block;
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.info-value {
  color: #333;
}

.actions {
  margin-top: 24px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-btn {
  flex: 1;
}

.password-collapse {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* RESPONSIVIDADE PARA MOBILE */
@media (max-width: 768px) {
  .profile-card {
    margin: 16px auto;
    width: calc(100% - 32px);
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    min-height: 48px; /* Altura mínima para touch */
    font-size: 16px; /* Tamanho de fonte ideal para mobile */
    font-weight: 500;
  }

  /* Botão salvar */
  .form-actions .action-btn:first-child {
    order: 1; /* Garante que o Salvar fique em primeiro */
  }

  /* Botão cancelar */
  .form-actions .action-btn:last-child {
    order: 2;
    background-color: transparent;
  }

  /* Botão de editar perfil (modo visualização) */
  .actions .action-btn {
    width: 100%;
    min-height: 48px;
    font-size: 16px;
    font-weight: 500;
  }

  .responsive-form {
    padding: 0 4px;
  }

  /* Ajustes nos inputs para mobile */
  .form-input {
    font-size: 16px; /* Previnir zoom no iOS */
  }

  /* Ajustes no collapse de senha */
  .password-collapse {
    margin-bottom: 16px;
  }

  /* Ajustes na seção do avatar */
  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .user-avatar {
    margin-right: 0;
  }

  .info-item {
    flex-direction: column;
    gap: 4px;
    padding: 16px 0;
  }
}

/* Pra telas muito pequenas */
@media (max-width: 480px) {
  .profile-card {
    margin: 12px auto;
    width: calc(100% - 24px);
  }

  .form-actions {
    gap: 10px;
    margin-top: 20px;
  }

  .action-btn {
    min-height: 44px;
    font-size: 15px;
  }

  /* Ajuste no padding dos botões para telas pequenas */
  :deep(.n-button) {
    padding: 0 16px;
  }
}

/* Pra telas médias (tablets) */
@media (min-width: 769px) and (max-width: 1024px) {
  .profile-card {
    max-width: 500px;
  }

  .form-actions {
    gap: 16px;
  }

  .action-btn {
    min-height: 44px;
  }
}

/* efeitos de hover pra desktop */
@media (min-width: 769px) {
  .action-btn:hover {
    transform: translateY(-1px);
    transition: transform 0.2s ease;
  }
}

@media (max-width: 320px) {
  .action-btn {
    min-height: 42px;
    font-size: 14px;
  }
  
  .form-actions {
    gap: 8px;
  }
}

:deep(.n-button__icon) {
  font-size: 18px;
}

.action-btn:focus {
  outline: 2px solid #18a058;
  outline-offset: 2px;
}
</style>