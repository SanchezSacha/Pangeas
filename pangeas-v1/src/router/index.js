import { createRouter, createWebHistory } from 'vue-router';
import UserAccount from '../components/account/UserAccount.vue';
import PlaceDetail from "../components/Map/PlaceDetail.vue";
import SettingsAccount from '../components/settings/SettingsAccount.vue';
import CGU from '../components/legal/CGU.vue';
import Confidentialite from '../components/legal/PolConf.vue';
import MentionsLegales from '../components/legal/MentionsLegales.vue';
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
    },
    {
        path: '/parametres',
        name: 'Parametres',
        component: SettingsAccount,
        meta: { requiresAuth: true }
    },
    {
        path: '/lieux/:id',
        name: 'PlaceDetail',
        component: PlaceDetail,
    },
    {
        path: '/cgu',
        name : 'CGU',
        component: CGU
    },
    {
        path: '/confidentialite',
        name : 'confidentialite',
        component: Confidentialite
    },
    {
        path: '/mentions-legales',
        name: 'mentions-legales',
        component: MentionsLegales
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
