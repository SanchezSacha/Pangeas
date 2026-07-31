import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import { initializeOfflineService } from './services/offlineService';

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

const refreshExternalFonts = () => {
    const currentLink = document.querySelector('link[data-reload-online="fonts"]');
    if (!currentLink) return;

    const refreshedLink = currentLink.cloneNode(true);
    refreshedLink.addEventListener('load', () => {
        currentLink.remove();
        [
            '400 1rem "Nunito Sans"',
            '700 1rem "Merriweather"',
            '700 1rem "Playfair Display"',
        ].forEach(font => document.fonts?.load(font).catch(() => {}));
    }, { once: true });
    refreshedLink.addEventListener('error', () => refreshedLink.remove(), { once: true });
    currentLink.after(refreshedLink);
};

const bootstrap = async () => {
    await initializeOfflineService();
    window.addEventListener('online', refreshExternalFonts);
    app.use(router);
    app.use(store);
    app.mount('#app');
};

bootstrap();
