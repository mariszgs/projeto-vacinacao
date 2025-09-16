<template>
  <n-card title="Login" style="max-width: 400px; margin: 0 auto;">
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
    
    <!-- Formulário de Registro -->
    <div v-if="isRegistering">
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
  isRegistering.value = !isRegistering.value;
}
</script>

<style scoped>
/* Estilos adicionais para o Login */
</style>
