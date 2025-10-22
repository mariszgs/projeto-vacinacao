<template>
  <n-card 
    :title="isEditing ? 'Editar Perfil' : 'Perfil do Usuário'" 
    class="profile-card"
    :bordered="true"
  >
    
    <!-- Transição suave -->
    <transition name="fade" mode="out-in">
      <!-- Esqueleto de carregamento -->
      <div v-if="loading" key="loading" class="loading-container">
        <n-skeleton height="24px" width="60%" style="margin-bottom: 16px;" />
        <n-skeleton text :repeat="4" />
      </div>

      <!-- Conteúdo do perfil -->
      <div v-else key="content">
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

          <!-- Desktop: mantém o n-descriptions -->
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
              <n-text type="info">{{ formatDate(user.created_at) }}</n-text>
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
    </transition>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'

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

const user = ref<User>({ name: '', email: '', created_at: '' })
const userForm = ref<UserForm>({ name: '', email: '', password: '', password_confirmation: '' })
const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const formRef = ref<FormInst | null>(null)
const message = useMessage()

const token = localStorage.getItem('token')
if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token

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
    { min: 6, message: 'Senha deve ter pelo menos 6 caracteres', trigger: 'blur' }
  ],
  password_confirmation: [
    { 
      validator: (rule, value) => {
        if (!userForm.value.password) return true
        return value === userForm.value.password
      },
      message: 'As senhas não coincidem',
      trigger: 'blur'
    }
  ]
}

function getInitials(name: string): string {
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
    const response = await axios.get('http://localhost:8000/api/user')
    user.value = response.data
    resetForm()
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
    message.error('Erro ao carregar dados do perfil')
  } finally {
    setTimeout(() => (loading.value = false), 300)
  }
}

onMounted(loadUser)

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
    
    // Validação do formulário
    await formRef.value?.validate()

    const payload: any = {
      name: userForm.value.name,
      email: userForm.value.email
    }

    if (userForm.value.password) {
      payload.password = userForm.value.password
      payload.password_confirmation = userForm.value.password_confirmation
    }

    const response = await axios.put('http://localhost:8000/api/user', payload)
    user.value = response.data.user
    isEditing.value = false
    resetForm()
    
    message.success(response.data.message || 'Perfil atualizado com sucesso!')
  } catch (error: any) {
    console.error('Erro ao salvar perfil:', error)
    
    if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat()
      errors.forEach((err: any) => message.error(err))
    } else if (error.message) {
      message.error('Erro ao salvar perfil: ' + error.message)
    } else {
      message.error('Erro ao salvar perfil.')
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Container principal */
.profile-card {
  max-width: 600px;
  margin: 20px auto;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.loading-container {
  padding: 20px 0;
}

/* Seção do avatar */
.profile-view .avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info .user-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
  line-height: 1.3;
}

.user-info .user-email {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
  word-break: break-all;
  line-height: 1.4;
}

/* Divisor */
.custom-divider {
  margin: 20px 0;
}

/* Layout mobile para informações do perfil */
.profile-info-mobile {
  display: none;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #1f2937;
  word-break: break-word;
}

/* Desktop: mantém o n-descriptions */
.profile-details-desktop {
  margin: 20px 0;
}

/* Botões */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.action-btn {
  min-width: 140px;
}

/* Formulário */
.responsive-form {
  width: 100%;
}

.form-input {
  width: 100%;
}

.password-collapse {
  margin: 16px 0;
}

/* Transições melhoradas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/*  RESPONSIVIDADE MOBILE  */
@media (max-width: 768px) {
  .profile-card {
    margin: 12px;
    max-width: none;
    border-radius: 8px;
  }
  
  /* Esconde o n-descriptions no mobile */
  .profile-details-desktop {
    display: none;
  }
  
  /* Mostra o layout mobile */
  .profile-info-mobile {
    display: flex;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .user-info {
    width: 100%;
    text-align: center;
  }
  
  .user-info .user-name {
    font-size: 20px;
  }
  
  .user-info .user-email {
    font-size: 13px;
  }
  
  .custom-divider {
    margin: 16px 0;
  }
  
  .actions {
    justify-content: center;
    margin-top: 20px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .profile-card {
    margin: 8px;
    border-radius: 6px;
  }
  
  .user-info .user-name {
    font-size: 18px;
  }
  
  .user-info .user-email {
    font-size: 12px;
  }
  
  .info-item {
    padding: 10px;
  }
  
  .info-label {
    font-size: 11px;
  }
  
  .info-value {
    font-size: 13px;
  }
  
  .custom-divider {
    margin: 12px 0;
  }
}

/* Para telas muito pequenas */
@media (max-width: 320px) {
  .profile-card {
    margin: 4px;
  }
  
  .user-info .user-name {
    font-size: 16px;
  }
  
  .user-info .user-email {
    font-size: 11px;
  }
  
  .info-item {
    padding: 8px;
  }
}
</style>