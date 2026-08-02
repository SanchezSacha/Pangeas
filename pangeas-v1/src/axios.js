import axios from 'axios';
import router from '@/router/index.js';
import store from '@/store/index.js';

const instance = axios.create({
    withCredentials: true,
});

const SAFE_METHODS = new Set(['get', 'head', 'options']);
let csrfToken = null;
let csrfTokenPromise = null;

const loadCsrfToken = async () => {
    if (csrfToken) return csrfToken;
    if (!csrfTokenPromise) {
        csrfTokenPromise = instance.get('/api/auth/csrf')
            .then(response => {
                csrfToken = response.data.csrfToken;
                return csrfToken;
            })
            .finally(() => {
                csrfTokenPromise = null;
            });
    }
    return csrfTokenPromise;
};

instance.interceptors.request.use(async config => {
    const method = String(config.method || 'get').toLowerCase();
    if (!SAFE_METHODS.has(method)) {
        config.headers.set('X-CSRF-Token', await loadCsrfToken());
    }
    return config;
});

instance.interceptors.response.use(
    response => {
        const requestUrl = response.config?.url || '';
        if (requestUrl.includes('/api/auth/connexion') || requestUrl.includes('/api/auth/logout')) {
            csrfToken = null;
        }
        return response;
    },
    async error => {
        const requestUrl = error.config?.url || '';
        const isSessionCheck = requestUrl.includes('/api/auth/me');
        const isAuthRoute = ['ForgotPassword', 'ResetPassword'].includes(router.currentRoute.value.name);

        if (error.response && error.response.status === 401 && !isSessionCheck && !isAuthRoute) {
            store.commit('logout');
            router.push({ name: 'Home' });
        }

        const isCsrfFailure = error.response?.status === 403 &&
            String(error.response?.data?.message || '').includes('CSRF');
        if (isCsrfFailure && !error.config?._csrfRetry) {
            csrfToken = null;
            error.config._csrfRetry = true;
            error.config.headers.set('X-CSRF-Token', await loadCsrfToken());
            return instance.request(error.config);
        }
        return Promise.reject(error);
    }
);

export default instance;
