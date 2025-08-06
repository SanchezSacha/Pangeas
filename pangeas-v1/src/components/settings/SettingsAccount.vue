<template>
  <div style="background-color: var(--color-beige)">
    <div class="settings-container">
      <div class="d-flex align-items-center justify-content-center gap-2 mb-4">
        <h1 class="mb-0">Paramètres</h1>
        <img src="/icons/cog.svg" alt="Paramètres" width="32" height="32" />
      </div>
      <SettingsEditInfo @logout="handleLogout"/>
      <SettingsAccountControl />
      <SettingsLegalInfo />

      <div class="app-version">
        Version de l’application : <strong>V1.11.3</strong>
      </div>
    </div>
  </div>
</template>

<script>
import SettingsEditInfo from './SettingsEditInfo.vue';
import store from "@/store/index.js";
import axios from "@/axios";
import SettingsAccountControl from "@/components/settings/SettingsAccountControl.vue";
import SettingsLegalInfo from "@/components/settings/SettingsLegalInfo.vue";

export default {
  components: {
    SettingsLegalInfo,
    SettingsAccountControl,
    SettingsEditInfo
  },
  methods: {
    async handleLogout() {
      try {
        await axios.post('api/auth/logout', {}, { withCredentials: true });
        store.commit('logout');
        this.$router.push({ name: 'Home' });
      } catch (err) {
        console.error('Erreur lors de la déconnexion :', err);
      }
    }
  }
};
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.app-version {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;
  color: var(--color-brown);
  background-color: var(--color-beige);
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--color-brown);
  font-style: italic;
}
</style>
