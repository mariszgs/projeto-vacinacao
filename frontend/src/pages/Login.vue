<template>
  <div class="login-container">
    <n-card title="Login" style="max-width: 400px; width: 100%; margin: 0;" class="form-card">
      <!-- Formulário de Login -->
      <div v-if="!isRegistering" class="form-column">
        <n-form :model="form" @submit="handleLogin">
          <n-form-item label="Email">
  <n-input v-model:value="form.email" placeholder="Digite seu email" />
</n-form-item>
          <n-form-item label="Senha">
            <n-input type="password" v-model:value="form.password" placeholder="Digite sua senha" />
          </n-form-item>
          <n-button type="primary" block @click="handleLogin">Entrar</n-button>
          <n-divider>Ou</n-divider>
          <n-button type="default" block @click="toggleRegister">Criar Conta</n-button>
        </n-form>
      </div>

      <!-- Formulário de Registro -->
      <div v-if="isRegistering" class="form-column">
        <n-form :model="registerForm" @submit="handleRegister">
          <n-form-item label="Nome">
            <n-input v-model:value="registerForm.name" placeholder="Digite seu nome completo" />
          </n-form-item>
          <n-form-item label="Email">
            <n-input v-model:value="registerForm.email" placeholder="Digite seu email" />
          </n-form-item>
          <n-form-item label="Senha">
            <n-input type="password" v-model:value="registerForm.password" placeholder="Escolha uma senha" />
          </n-form-item>
          <n-form-item label="Confirmar Senha">
            <n-input type="password" v-model:value="registerForm.password_confirmation" placeholder="Confirme sua senha" />
          </n-form-item>
          <n-button type="primary" block @click="handleRegister">Cadastrar</n-button>
          <n-divider>Já tem uma conta?</n-divider>
          <n-button type="default" block @click="toggleRegister">Fazer Login</n-button>
        </n-form>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NForm, NFormItem, NInput, NButton, NDivider, useMessage } from 'naive-ui';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const message = useMessage();

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

async function handleLogin() {
  try {
    const response = await axios.post('http://localhost:8000/api/login', {
      email: form.value.email,
      password: form.value.password
    });

    // Salvando o token
    localStorage.setItem('token', response.data.access_token);

    // Configura Axios para todas as requisições
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access_token

    message.success('Login realizado com sucesso!');
    router.push('/home'); // tela de perfil ou dashboard
  } catch (error) {
    console.error(error);
    message.error('Credenciais inválidas ou erro no servidor.');
  }
}


async function handleRegister() {
  try {
    const response = await axios.post('http://localhost:8000/api/register', {
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
      password_confirmation: registerForm.value.password_confirmation
    });

    message.success('Cadastro realizado com sucesso! Faça login.');
    toggleRegister();
  } catch (error: any) {
    console.error(error);
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      message.error(firstError as string);
    } else {
      message.error('Erro ao registrar usuário.');
    }
  }
}

function toggleRegister() {
  isRegistering.value = !isRegistering.value;
}
</script>


<style scoped>
/* Centralizar o conteúdo da tela */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 94vh;
  background-color: #f5f5f5;
  padding: 20px;
}

/* Ajustes no cartão */
n-card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

/* Ajustes no título do cartão */
n-card .n-card-header {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
}

/* Ajustes nos botões */
.n-button {
  font-weight: bold;
}

/* Ajustes no Divider */
n-divider {
  margin: 10px 0;
}

/* Formulário (login e registro) */
.form-column {
  width: 100%;
}

/* Responsividade: Quando a tela for pequena, ajusta a largura do cartão */
@media (max-width: 900px) {
  .login-container {
    padding: 10px;
  }

  n-card {
    width: 100%;
    padding: 20px;
  }

  n-card .n-card-header {
    font-size: 18px;
  }
}
</style>
