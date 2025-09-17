import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import Home from '../pages/Home.vue';
import PetsList from '../pages/Pets/List.vue';
import PetsCreate from '../pages/Pets/Create.vue'; 
import PetsView from '../pages/Pets/View.vue';
import PetsEdit from '../pages/Pets/Edit.vue';
import Profile from '../pages/Profile.vue';
import Schedule from '../pages/Schedule.vue';
import Vaccines from '../pages/Vaccines.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: 'home',
        name: 'home',
        component: Home
      },
      {
        path: 'pets',
        name: 'pets-list',
        component: PetsList
      },
      {
        path: 'pets/create',
        name: 'pets-create',
        component: PetsCreate
      },
      {
       path: '/pets/:id',
       name: 'pet-view',
       component: PetsView
      },
      {
        path: '/pets/edit/:id',
        name: 'pet-edit',
        component: PetsEdit
      },
      {
        path: 'profile',
        name: 'profile',
        component: Profile
      },
      {
        path: 'schedule/:id',
        name: 'schedule',
        component: Schedule
      },
      {
        path: 'vaccines',
        name: 'vaccines',
        component: Vaccines
      }

    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
