import { createRouter, createWebHistory } from 'vue-router';
import store from '../../src/store/index.js';
import axios from '@/axios.js';
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
        component: () => import('../components/account/UserAccount.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/proposer-un-lieu',
        name: 'ProposerLieu',
        component: () => import('../components/submissions/PlaceSubmissionForm.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/mes-propositions',
        name: 'MesPropositions',
        component: () => import('../components/submissions/PlaceSubmissionHistory.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/mes-propositions/:id/modifier',
        name: 'ModifierProposition',
        component: () => import('../components/submissions/PlaceSubmissionForm.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/account/place-submissions/:id',
        redirect: to => ({ name: 'MesPropositions', query: { open: to.params.id } }),
        meta: { requiresAuth: true }
    },
    {
        path: '/parametres',
        name: 'Parametres',
        component: () => import('../components/settings/SettingsAccount.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/recompenses',
        name: 'Recompenses',
        component: () => import('../components/rewards/RewardsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/lieux/:id',
        name: 'PlaceDetail',
        component: () => import('../components/map/PlaceDetail.vue'),
    },
    {
        path: '/places/:id',
        redirect: to => ({ name: 'PlaceDetail', params: { id: to.params.id } })
    },
    {
        path: '/cgu',
        name : 'CGU',
        component: () => import('../components/legal/CGU.vue'),
    },
    {
        path: '/confidentialite',
        name : 'confidentialite',
        component: () => import('../components/legal/PolConf.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/mentions-legales',
        name: 'mentions-legales',
        component: () => import('../components/legal/MentionsLegales.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/mot-de-passe-oublie',
        name: 'ForgotPassword',
        component: () => import('../components/auth/ForgotPassword.vue')
    },
    {
        path: '/reset-password/:token?',
        name: 'ResetPassword',
        component: () => import('../components/auth/ResetPassword.vue')
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
                path: 'place-submissions',
                name: 'AdminPlaceSubmissions',
                component: () => import('@/admin/AdminPlaceSubmissions.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'place-submissions/:id',
                name: 'AdminPlaceSubmissionDetails',
                component: () => import('@/admin/AdminPlaceSubmissionDetails.vue'),
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
