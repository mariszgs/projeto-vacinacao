<template>
  <div class="login-container">
    <n-card title="Login" style="max-width: 400px; width: 100%; margin: 0;" class="form-card">
      <!-- Formulário de Login -->
      <div v-if="!isRegistering" class="form-column">
        <n-form :model="form" @submit="handleLogin">
          <n-form-item label="Usuário">
            <n-input v-model:value="form.username" placeholder="Digite seu nome de usuário" />
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
          <n-form-item label="Usuário">
            <n-input v-model:value="registerForm.username" placeholder="Escolha um nome de usuário" />
          </n-form-item>
          <n-form-item label="Senha">
            <n-input type="password" v-model:value="registerForm.password" placeholder="Escolha uma senha" />
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
import { NCard, NForm, NFormItem, NInput, NButton, NDivider } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
  username: '',
  password: ''
});

const isRegistering = ref(false);

const registerForm = ref({
  name: '',
  username: '',
  password: ''
});

function handleLogin() {
  console.log('Login com', form.value);
  
  // Simulação de login bem-sucedido, redireciona para o Dashboard
  // Aqui você pode substituir pelo seu processo de autenticação real
  if (form.value.username && form.value.password) {
    router.push('/home');
  }
}

function handleRegister() {
  console.log('Registro com', registerForm.value);

  // Simulação de registro bem-sucedido, redireciona para o Dashboard
  // Aqui você pode substituir pelo seu processo de registro real
  if (registerForm.value.username && registerForm.value.password && registerForm.value.name) {
    router.push('/home');
  }
}

function toggleRegister() {
  isRegistering.value = !isRegistering.value; // Alterna entre o login e o registro
}
</script>

<style scoped>
/* Centralizar o conteúdo da tela */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
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
