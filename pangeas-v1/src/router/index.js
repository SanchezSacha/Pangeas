import { createRouter, createWebHistory } from 'vue-router';
import store from '../../src/store/index.js';
import axios from '@/axios.js';
import UserAccount from '../components/account/UserAccount.vue';
import PlaceDetail from "../components/map/PlaceDetail.vue";
import SettingsAccount from '../components/settings/SettingsAccount.vue';
import CGU from '../components/legal/CGU.vue';
import Confidentialite from '../components/legal/PolConf.vue';
import MentionsLegales from '../components/legal/MentionsLegales.vue';
import HomeView from "../HomeView.vue";
import ForgotPassword from "../components/auth/ForgotPassword.vue";
import ResetPassword from "../components/auth/ResetPassword.vue";
import RewardsView from "../components/rewards/RewardsView.vue";

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
        path: '/recompenses',
        name: 'Recompenses',
        component: RewardsView,
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
        component: CGU,
    },
    {
        path: '/confidentialite',
        name : 'confidentialite',
        component: Confidentialite,
        meta: { requiresAuth: true }
    },
    {
        path: '/mentions-legales',
        name: 'mentions-legales',
        component: MentionsLegales,
        meta: { requiresAuth: true }
    },
    {
        path: '/mot-de-passe-oublie',
        name: 'ForgotPassword',
        component: ForgotPassword
    },
    {
        path: '/reset-password/:token?',
        name: 'ResetPassword',
        component: ResetPassword
    },
//////////////////////////////////////////////////// ADMIN ROUTES//////////////////////////////////////////////////////////////////////
    {
        path: '/admin',
        component: () => import('@/layout/AdminLayout.vue'),
        meta: { requiresAdmin: true },
        children: [
            {
                path: '',
                redirect: 'dashboard',
                meta: { requiresAdmin: true }
            },
            {
                path: 'dashboard',
                name: 'AdminDashboard',
                component: () => import('@/admin/AdminDashboard.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'users',
                name: 'AdminUsers',
                component: () => import('@/admin/AdminUsers.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: '/admin/users/:id',
                name: 'UserDetails',
                component: () => import('@/admin/UserAdminDetails.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: '/admin/users/:id/edit',
                name: 'UpdateUsersAdmin',
                component: () => import('@/admin/UpdateUsersAdmin.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'places',
                name: 'AdminPlaces',
                component: () => import('@/admin/AdminPlaces.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'rewards',
                name: 'AdminRewards',
                component: () => import('@/admin/AdminRewards.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: '/admin/places/:id',
                name: 'AdminPlacesDetails',
                component: () => import('@/admin/AdminPlacesDetails.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: '/admin/places/:id/edit',
                name: 'AdminPlaceEdit',
                component: () => import('@/admin/AdminPlaceEdit.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: '/admin/places/add',
                name: 'AddPlaceAdmin',
                component: () => import('@/admin/AddPlaceAdmin.vue'),
                meta: { requiresAdmin: true }
            },
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0, left: 0 };
    }
});

async function resolveCurrentUser() {
    if (store.state.user) {
        return store.state.user;
    }

    try {
        const response = await axios.get('/api/auth/me', { withCredentials: true });
        if (response.data.success && response.data.user) {
            store.commit('setUser', response.data.user);
            return response.data.user;
        }
    } catch (error) {
        return null;
    }

    return null;
}

router.beforeEach(async (to, from, next) => {
    let user = store.state.user;

    if (to.query.token && to.name !== 'ResetPassword') {
        return next({
            name: 'ResetPassword',
            query: { token: to.query.token }
        });
    }

    if (to.meta.requiresAuth || to.meta.requiresAdmin) {
        user = await resolveCurrentUser();
    }

    if (to.meta.requiresAdmin) {
        if (!store.state.isOnline) {
            return next({ path: '/' });
        }
        if (!user || user.role !== 'admin') {
            return next({ path: '/' });
        }
    }
    if (to.meta.requiresAuth) {
        if (!user) {
            return next({ name: 'Home' });
        }
    }
    next();
});

export default router;
