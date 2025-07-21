import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';

import './style.css';
import '../src/assets/css/map.css';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const app = createApp(App);
app.use(router);
app.use(store);
app.mount('#app');