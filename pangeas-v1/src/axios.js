import axios from 'axios';
import router from '@/router/index.js';
import store from '@/store/index.js';

const instance = axios.create({
    withCredentials: true,
});

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            store.commit('logout');
            router.push({ name: 'Home' });
        }
        return Promise.reject(error);
    }
);

export default instance;
