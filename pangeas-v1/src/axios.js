import axios from 'axios';
import router from '@/router/index.js';
import store from '@/store/index.js';

const instance = axios.create({
    withCredentials: true,
});

instance.interceptors.response.use(
    response => response,
    error => {
        const requestUrl = error.config?.url || '';
        const isSessionCheck = requestUrl.includes('/api/auth/me');
        const isAuthRoute = ['ForgotPassword', 'ResetPassword'].includes(router.currentRoute.value.name);

        if (error.response && error.response.status === 401 && !isSessionCheck && !isAuthRoute) {
            store.commit('logout');
            router.push({ name: 'Home' });
        }
        return Promise.reject(error);
    }
);

export default instance;
