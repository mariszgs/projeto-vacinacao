<template>
  <div class="login-page">
    <div class="login-container">
      <n-card 
        class="login-card"
        :bordered="true"
      >
        <!-- Transição suave entre login e registro -->
        <transition name="fade" mode="out-in">
          <!-- Formulário de Login -->
          <div v-if="!isRegistering" key="login" class="form-content">
            <div class="form-header">
              <h2 class="form-title">Bem-vindo de volta</h2>
              <p class="form-subtitle">Entre na sua conta para continuar</p>
            </div>

            <n-form :model="form" :rules="loginRules" ref="loginFormRef" size="large" class="auth-form">
              <n-form-item path="email" class="form-item">
                <n-input 
                  v-model:value="form.email" 
                  placeholder="Digite seu email"
                  :input-props="{ type: 'email' }"
                />
              </n-form-item>

              <n-form-item path="password" class="form-item">
                <n-input 
                  type="password"
                  v-model:value="form.password" 
                  placeholder="Digite sua senha"
                  show-password-on="click"
                />
              </n-form-item>

              <n-button 
                type="primary" 
                block 
                @click="handleLogin"
                :loading="loading"
                size="large"
                class="auth-btn"
              >
                Entrar
              </n-button>
            </n-form>

            <n-divider class="custom-divider">Ou</n-divider>
            
            <n-button 
              type="default" 
              block 
              @click="toggleRegister"
              :disabled="loading"
              size="large"
              class="toggle-btn"
            >
              Criar Nova Conta
            </n-button>
          </div>

          <!-- Formulário de Registro -->
          <div v-else key="register" class="form-content">
            <div class="form-header">
              <h2 class="form-title">Criar Conta</h2>
              <p class="form-subtitle">Cadastre-se para começar a usar</p>
            </div>

            <n-form :model="registerForm" :rules="registerRules" ref="registerFormRef" size="large" class="auth-form">
              <n-form-item path="name" class="form-item">
                <n-input 
                  v-model:value="registerForm.name" 
                  placeholder="Digite seu nome "
                />
              </n-form-item>

              <n-form-item path="email" class="form-item">
                <n-input 
                  v-model:value="registerForm.email" 
                  placeholder="Digite seu email"
                  :input-props="{ type: 'email' }"
                />
              </n-form-item>

              <n-form-item path="password" class="form-item">
                <n-input 
                  type="password"
                  v-model:value="registerForm.password" 
                  placeholder="Escolha uma senha"
                  show-password-on="click"
                />
              </n-form-item>

              <n-form-item path="password_confirmation" class="form-item">
                <n-input 
                  type="password"
                  v-model:value="registerForm.password_confirmation" 
                  placeholder="Confirme sua senha"
                  show-password-on="click"
                />
              </n-form-item>

              <n-button 
                type="primary" 
                block 
                @click="handleRegister"
                :loading="loading"
                size="large"
                class="auth-btn"
              >
                Cadastrar
              </n-button>
            </n-form>

            <n-divider class="custom-divider">Já tem uma conta?</n-divider>
            
            <n-button 
              type="default" 
              block 
              @click="toggleRegister"
              :disabled="loading"
              size="large"
              class="toggle-btn"
            >
              Fazer Login
            </n-button>
          </div>
        </transition>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NForm, NFormItem, NInput, NButton, NDivider, useMessage, type FormInst, type FormRules } from 'naive-ui';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const message = useMessage();
const loading = ref(false);

const loginFormRef = ref<FormInst | null>(null);
const registerFormRef = ref<FormInst | null>(null);

const form = ref({
  email: '',
  password: ''
});

const isRegistering = ref(false);

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

// Regras de validação para login
const loginRules: FormRules = {
  email: [
    { required: true, message: 'Email é obrigatório', trigger: 'blur' },
    { type: 'email', message: 'Email inválido', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Senha é obrigatória', trigger: 'blur' },
    { min: 6, message: 'Senha deve ter pelo menos 6 caracteres', trigger: 'blur' }
  ]
};

// Regras de validação para registro
const registerRules: FormRules = {
  name: [
    { required: true, message: 'Nome é obrigatório', trigger: 'blur' },
    { min: 2, message: 'Nome deve ter pelo menos 2 caracteres', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email é obrigatório', trigger: 'blur' },
    { type: 'email', message: 'Email inválido', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Senha é obrigatória', trigger: 'blur' },
    { min: 6, message: 'Senha deve ter pelo menos 6 caracteres', trigger: 'blur' }
  ],
  password_confirmation: [
    { required: true, message: 'Confirmação de senha é obrigatória', trigger: 'blur' },
    { 
      validator: (rule, value) => {
        return value === registerForm.value.password;
      },
      message: 'As senhas não coincidem',
      trigger: 'blur'
    }
  ]
};

async function handleLogin() {
  if (!loginFormRef.value) return;
  
  loading.value = true;
  try {
    await loginFormRef.value.validate();

    const response = await axios.post('http://localhost:8000/api/login', {
      email: form.value.email,
      password: form.value.password
    });

    // DEBUG: Ver a estrutura completa da resposta
    console.log('Resposta completa do login:', response.data);
    
    // Verificar qual campo do token está sendo retornado
    const token = response.data.access_token || response.data.token;
    console.log('Token encontrado:', token ? 'SIM' : 'NÃO');
    
    if (!token) {
      throw new Error('Token não encontrado na resposta');
    }

    // Salvando o token
    localStorage.setItem('token', token);

    // Configura Axios para todas as requisições
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

    message.success('Login realizado com sucesso!');
    router.push('/home');
  } catch (error: any) {
    console.error('Erro no login:', error);
    if (error.response?.status === 401) {
      message.error('Credenciais inválidas.');
    } else if (error.response?.data?.message) {
      message.error(error.response.data.message);
    } else {
      message.error('Erro ao fazer login. Tente novamente.');
    }
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  if (!registerFormRef.value) return;
  
  loading.value = true;
  try {
    await registerFormRef.value.validate();

    const response = await axios.post('http://localhost:8000/api/register', {
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
      password_confirmation: registerForm.value.password_confirmation
    });

    message.success('Cadastro realizado com sucesso! Faça login.');
    toggleRegister();
    
    // Limpa o formulário de registro
    registerForm.value = {
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    };
  } catch (error: any) {
    console.error(error);
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      message.error(firstError as string);
    } else if (error.response?.data?.message) {
      message.error(error.response.data.message);
    } else {
      message.error('Erro ao registrar usuário.');
    }
  } finally {
    loading.value = false;
  }
}

function toggleRegister() {
  isRegistering.value = !isRegistering.value;
  
  // Limpa os formulários ao alternar
  if (!isRegistering.value) {
    form.value = { email: '', password: '' };
  }
}
</script>

<style scoped>
/* Página de login */
.login-page {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 440px;
  display: flex;
  justify-content: center;
}

/* Card principal */
.login-card {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

/* Cabeçalho do formulário */
.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.form-subtitle {
  margin: 8px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

/* Formulário */
.form-content {
  width: 100%;
}

.auth-form {
  width: 100%;
}

.form-item {
  margin-bottom: 20px;
}

.custom-divider {
  margin: 24px 0;
  color: #d1d5db;
}

/* Botões */
.auth-btn {
  height: 48px;
  font-weight: 600;
  border-radius: 8px;
  margin-top: 8px;
}

.toggle-btn {
  height: 48px;
  border-radius: 8px;
}

/* Transição de fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* RESPONSIVIDADE MOBILE */
@media (max-width: 768px) {
  .login-page {
    padding: 16px;
  }
  
  .login-container {
    max-width: 100%;
  }
  
  .login-card {
    border-radius: 8px;
  }
  
  .form-title {
    font-size: 22px;
  }
  
  .form-subtitle {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 12px;
  }
  
  .login-card {
    border-radius: 6px;
  }
  
  .form-title {
    font-size: 20px;
  }
}

/* Para telas muito pequenas */
@media (max-width: 320px) {
  .login-page {
    padding: 8px;
  }
  
  .form-title {
    font-size: 18px;
  }
}
</style>