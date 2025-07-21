import { createRouter, createWebHistory } from 'vue-router';
import UserAccount from '../components/account/UserAccount.vue';
import HomeView from "../HomeView.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/mon-compte',
        name: 'MonCompte',
        component: UserAccount,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
