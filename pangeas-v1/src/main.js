import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import { initializeOfflineService } from './services/offlineService';

import '@fontsource/nunito-sans/latin-400.css';
import '@fontsource/merriweather/latin-700.css';
import '@fontsource/playfair-display/latin-700.css';
import './style.css';
import './assets/tailwind.css';
import '../src/assets/css/map.css';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm("Une nouvelle version est disponible, souhaitez-vous la charger ?")) {
            updateSW();
        }
    },
    onOfflineReady() {
        console.log("L'application est prête à fonctionner hors-ligne.");
    }
});

const app = createApp(App);

const bootstrap = async () => {
    await initializeOfflineService();
    app.use(router);
    app.use(store);
    app.mount('#app');
};

bootstrap();
