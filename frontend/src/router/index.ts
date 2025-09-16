import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import Home from '../pages/Home.vue';
import PetsList from '../pages/Pets/List.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
  },
  {
    path: '/',
    component: DefaultLayout,  // layout pai para as rotas autenticadas
    children: [
      {
        path: 'home',
        name: 'home',
        component: Home,
      },
      {
        path: 'pets',
        name: 'pets-list',
        component: PetsList,
      },
      // Aqui você pode adicionar outras rotas da área logada
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
