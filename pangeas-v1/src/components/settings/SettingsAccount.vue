<template>
  <main class="settings-page">
    <header class="settings-topbar">
      <button class="topbar-back" type="button" aria-label="Retour" @click="goBack">
        <img src="/icons/arrow-left.svg" alt="" aria-hidden="true" />
      </button>

      <div class="topbar-title">
        <picture>
          <source media="(min-width: 768px)" srcset="/logo_marron_2.png" />
          <img src="/logo_mobile_pangeas.png" alt="PANGEAS" class="settings-logo" />
        </picture>
        <h1>Paramètres</h1>
      </div>

      <nav class="desktop-nav" aria-label="Navigation principale">
        <router-link :to="{ name: 'Home' }">Explorer</router-link>
        <router-link :to="{ name: 'MonCompte' }">Favoris</router-link>
        <router-link :to="{ name: 'Recompenses' }">Récompenses</router-link>
        <router-link class="active" :to="{ name: 'Parametres' }">Paramètres</router-link>
      </nav>
    </header>

    <section class="profile-hero" aria-labelledby="settings-profile-title">
      <div class="avatar-control">
        <label class="avatar-frame" for="settings-avatar">
          <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar utilisateur" />
          <span v-else class="default-avatar" aria-hidden="true">
            <img src="/logo_mobile_pangeas.png" alt="" />
          </span>
        </label>
        <input id="settings-avatar" type="file" accept="image/jpeg,image/png,image/webp" @change="handleAvatarChange" hidden />
        <button class="avatar-edit" type="button" aria-label="Modifier l'avatar" @click="openAvatarPicker">
          <img src="/icons/cog.svg" alt="" aria-hidden="true" />
        </button>
      </div>

      <h2 id="settings-profile-title">{{ form.pseudo || 'Explorateur Pangeas' }}</h2>
      <p>{{ form.email || 'adresse@email.com' }}</p>

      <div class="profile-badges" aria-label="Statut du compte">
        <span>Explorateur</span>
        <span class="level">Niveau {{ userLevel }}</span>
      </div>

    </section>

    <div class="settings-divider" aria-hidden="true">
      <span></span>
      <img src="/icons/map.svg" alt="" />
      <span></span>
    </div>

    <section class="settings-section" aria-labelledby="credentials-title">
      <div class="section-heading">
        <img src="/icons/user.svg" alt="" aria-hidden="true" />
        <h2 id="credentials-title">Identifiants</h2>
      </div>

      <div class="settings-card credentials-card">
        <label class="field-block" for="settings-pseudo">
          <span>Pseudo</span>
          <span class="field-control">
            <input id="settings-pseudo" v-model.trim="form.pseudo" type="text" autocomplete="username" @input="markProfileModified" />
            <img src="/icons/pen.svg" alt="" aria-hidden="true" />
          </span>
        </label>

        <label class="field-block" for="settings-email">
          <span>Adresse mail</span>
          <button id="settings-email" class="field-control readonly-control" type="button" @click="openEmailModal">
            <span>{{ form.email || 'Modifier votre adresse' }}</span>
            <img src="/icons/mail.svg" alt="" aria-hidden="true" />
          </button>
        </label>

        <label class="field-block" for="settings-password">
          <span>Mot de passe</span>
          <button id="settings-password" class="field-control readonly-control" type="button" @click="openPasswordModal">
            <span>••••••••••••</span>
            <img src="/icons/eye.svg" alt="" aria-hidden="true" />
          </button>
        </label>

        <div class="credentials-actions">
          <button v-if="profileModified || avatarFile" class="save-button" type="button" @click="submitProfileUpdate">
            Enregistrer
          </button>
          <button class="logout-button" type="button" @click="handleLogout">
            <img src="/icons/log-out.svg" alt="" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </div>
    </section>

    <section class="settings-section" aria-labelledby="account-title">
      <div class="section-heading">
        <span class="heading-dot" aria-hidden="true"></span>
        <h2 id="account-title">Compte</h2>
      </div>

      <div class="settings-card account-card">
        <router-link v-if="user?.role === 'admin'" class="account-row admin-access" :to="{ name: 'AdminDashboard' }">
          <span class="row-icon admin-icon" aria-hidden="true">
            <img src="/icons/house.svg" alt="" />
          </span>
          <span class="row-copy">
            <strong>Espace administrateur</strong>
            <small>Gérer les lieux et les utilisateurs</small>
          </span>
          <span class="row-action icon-action" aria-hidden="true">
            <img src="/icons/chevron-right.svg" alt="" />
          </span>
        </router-link>

        <div class="account-row interactive-row">
          <span class="row-icon geo-icon" aria-hidden="true">⌖</span>
          <span class="row-copy">
            <strong>Géolocalisation</strong>
            <small>Autoriser l'app à utiliser votre position</small>
          </span>
          <label class="switch" aria-label="Activer la géolocalisation">
            <input v-model="geolocationEnabled" type="checkbox" />
            <span></span>
          </label>
        </div>

        <div v-if="showInstallSettingsRow" class="account-row install-row interactive-row">
          <span class="row-icon install-icon" aria-hidden="true">
            <img src="/icons/house.svg" alt="" />
          </span>
          <span class="row-copy">
            <strong>{{ installSettingsTitle }}</strong>
            <small>{{ installSettingsCopy }}</small>
            <button
                v-if="!installState.isInstalled"
                class="install-help-toggle"
                type="button"
                :aria-expanded="showSettingsIosInstructions"
                @click="toggleInstallHelp"
            >
              <span>{{ showSettingsIosInstructions ? 'Masquer les infos iOS' : 'Infos iOS' }}</span>
              <img src="/icons/chevron-right.svg" alt="" aria-hidden="true" />
            </button>
            <small v-if="showSettingsIosInstructions" class="ios-install-help">
              {{ settingsInstallHelp }}
            </small>
          </span>
          <button
              v-if="!installState.isInstalled"
              class="install-download-action"
              type="button"
              aria-label="Installer Pangeas"
              @click="handleInstallPwa"
          >
            <img src="/icons/download.svg" alt="" aria-hidden="true" />
          </button>
          <span v-else class="row-action icon-action" aria-hidden="true">
            <img src="/icons/check.svg" alt="" />
          </span>
        </div>

        <button class="account-row" type="button" @click="downloadJson">
          <span class="row-icon export-icon" aria-hidden="true">
            <img src="/icons/database.svg" alt="" />
          </span>
          <span class="row-copy">
            <strong>Exportation des données (JSON)</strong>
            <small>Télécharger une copie de vos archives</small>
          </span>
          <span class="row-action icon-action" aria-hidden="true">
            <img src="/icons/download.svg" alt="" />
          </span>
        </button>

        <button class="account-row" type="button" @click="openDeleteDataModal">
          <span class="row-icon erase-icon" aria-hidden="true">
            <img src="/icons/eraser.svg" alt="" />
          </span>
          <span class="row-copy">
            <strong>Suppression des données personnelles</strong>
            <small>Effacer votre historique d'exploration</small>
          </span>
          <span class="row-action icon-action" aria-hidden="true">
            <img src="/icons/chevron-right.svg" alt="" />
          </span>
        </button>

        <div class="danger-zone">
          <span class="row-icon danger-icon" aria-hidden="true">
            <img src="/icons/trash-2.svg" alt="" />
          </span>
          <div>
            <strong>Suppression du compte</strong>
            <p>La suppression de votre compte est définitive et irréversible. Toutes vos découvertes seront perdues.</p>
            <button type="button" @click="openDeleteAccountModal">Confirmer la suppression</button>
          </div>
        </div>
      </div>
    </section>

    <section class="settings-section" aria-labelledby="legal-title">
      <div class="section-heading">
        <img src="/icons/file-text.svg" alt="" aria-hidden="true" />
        <h2 id="legal-title">Documents légaux</h2>
      </div>

      <div class="settings-card legal-card">
        <router-link :to="{ name: 'mentions-legales' }">
          <span>Mentions légales</span>
          <img src="/icons/chevron-right.svg" alt="" aria-hidden="true" />
        </router-link>
        <router-link :to="{ name: 'CGU' }">
          <span>Conditions générales d'utilisation</span>
          <img src="/icons/chevron-right.svg" alt="" aria-hidden="true" />
        </router-link>
        <router-link :to="{ name: 'confidentialite' }">
          <span>Politique de confidentialité</span>
          <img src="/icons/chevron-right.svg" alt="" aria-hidden="true" />
        </router-link>
        <div class="support-row">
          <div>
            <strong>Contact support</strong>
            <a href="mailto:pangeas@contact.fr">pangeas@contact.fr</a>
          </div>
          <span class="support-copy-area">
            <span class="copy-feedback" :class="{ visible: supportCopied }">Copié</span>
            <button type="button" :aria-label="copyLabel" @click="copySupportEmail">
              <img :src="supportCopied ? '/icons/check.svg' : '/icons/copy.svg'" alt="" aria-hidden="true" />
            </button>
          </span>
        </div>
      </div>
    </section>

    <footer class="settings-footer">
      <strong>Pangeas</strong>
      <span>Version 2.4.1 - "The Great Wanderer"</span>
    </footer>

    <SuccessPopup v-if="showSuccessPopup" :message="successMessage" @closed="showSuccessPopup = false" />
    <ErrorPopup v-if="showErrorPopup" :message="errorMessage" @closed="showErrorPopup = false" />
    <EmailUpdateModal v-if="showEmailModal" @close="closeEmailModal" />
    <PasswordUpdateModal v-if="showPasswordModal" @close="showPasswordModal = false" />
    <DeleteAccountModal v-if="showDeleteModal" @close="showDeleteModal = false" />
    <DeleteUserDataModal v-if="showDeleteDataModal" @close="showDeleteDataModal = false" />
  </main>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index.js';
import axios from '@/axios';
import SuccessPopup from '../modal/SuccessPopup.vue';
import ErrorPopup from '../modal/ErrorPopup.vue';
import EmailUpdateModal from '../modal/EmailUpdateModal.vue';
import PasswordUpdateModal from '../modal/PasswordUpdateModal.vue';
import DeleteAccountModal from '../modal/DeleteAccountModal.vue';
import DeleteUserDataModal from '../modal/DeleteUserDataModal.vue';
import { getAvatarValidationError, getUploadErrorMessage, resolveAvatarUrl as buildAvatarUrl } from '@/utils/avatar';
import {
  getInstallState,
  promptPwaInstall,
  subscribeToInstallState,
} from '@/utils/pwaInstall';

export default {
  name: 'SettingsAccount',
  components: {
    SuccessPopup,
    ErrorPopup,
    EmailUpdateModal,
    PasswordUpdateModal,
    DeleteAccountModal,
    DeleteUserDataModal
  },
  data() {
    return {
      form: {
        pseudo: '',
        email: ''
      },
      avatarFile: null,
      avatarPreview: '',
      previousAvatarPreview: '',
      profileModified: false,
      geolocationEnabled: true,
      showEmailModal: false,
      showPasswordModal: false,
      showDeleteModal: false,
      showDeleteDataModal: false,
      showSuccessPopup: false,
      showErrorPopup: false,
      successMessage: '',
      errorMessage: '',
      supportCopied: false,
      installState: getInstallState(),
      unsubscribeInstallState: null,
      showSettingsIosInstructions: false
    };
  },
  computed: {
    ...mapState({
      user: state => state.user
    }),
    userLevel() {
      return this.user?.level || this.user?.niveau || 1;
    },
    copyLabel() {
      return this.supportCopied ? 'Adresse copiée' : "Copier l'adresse support";
    },
    showInstallSettingsRow() {
      return this.installState.canInstall || this.installState.isInstalled;
    },
    installSettingsTitle() {
      if (this.installState.isInstalled) return 'Pangeas est installée';
      return this.installState.isIos ? "Ajouter à l'écran d'accueil" : 'Installer Pangeas';
    },
    installSettingsCopy() {
      if (this.installState.isInstalled) return "L'application est déjà disponible comme une app.";
      if (this.installState.isIos) return 'Gardez Pangeas accessible depuis votre écran d’accueil.';
      return 'Accéder plus vite à vos lieux, favoris et récompenses.';
    },
    settingsInstallHelp() {
      if (this.installState.isIos) {
        return 'Sur iPhone : ouvrez le partage Safari, puis "Ajouter à l’écran d’accueil".';
      }
      return 'Si le bouton natif ne s’ouvre pas, utilisez le menu du navigateur puis "Installer l’application".';
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(newUser) {
        if (!newUser) return;
        this.form.pseudo = newUser.pseudo || '';
        this.form.email = newUser.email || '';
        this.avatarPreview = this.resolveAvatarUrl(newUser.avatar_url);
      }
    }
  },
  mounted() {
    this.unsubscribeInstallState = subscribeToInstallState((state) => {
      this.installState = state;
    });
  },
  beforeUnmount() {
    this.unsubscribeInstallState?.();
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
        return;
      }
      this.$router.push({ name: 'Home' });
    },
    openAvatarPicker() {
      document.getElementById('settings-avatar')?.click();
    },
    resolveAvatarUrl(avatarUrl) {
      return buildAvatarUrl(avatarUrl);
    },
    handleAvatarChange(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const validationError = getAvatarValidationError(file);
      if (validationError) {
        this.errorMessage = validationError;
        this.showErrorPopup = true;
        event.target.value = '';
        return;
      }
      this.previousAvatarPreview = this.avatarPreview;
      this.avatarFile = file;
      this.avatarPreview = URL.createObjectURL(file);
      this.submitProfileUpdate('avatar');
    },
    markProfileModified() {
      this.profileModified = true;
    },
    openEmailModal() {
      this.showEmailModal = true;
    },
    closeEmailModal() {
      this.showEmailModal = false;
      this.refreshUser();
    },
    openPasswordModal() {
      this.showPasswordModal = true;
    },
    openDeleteDataModal() {
      this.showDeleteModal = false;
      this.showDeleteDataModal = true;
    },
    openDeleteAccountModal() {
      this.showDeleteDataModal = false;
      this.showDeleteModal = true;
    },
    async refreshUser() {
      try {
        const response = await axios.get('/api/auth/me', { withCredentials: true });
        if (response.data.success && response.data.user) {
          store.commit('setUser', response.data.user);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      }
    },
    async handleLogout() {
      try {
        await axios.post('api/auth/logout', {}, { withCredentials: true });
        store.commit('logout');
        this.$router.push({ name: 'Home' });
      } catch (err) {
        console.error('Erreur lors de la déconnexion :', err);
      }
    },
    async submitProfileUpdate(updateType = 'profile') {
      const formData = new FormData();
      formData.append('pseudo', this.form.pseudo);
      formData.append('bio', this.user?.bio || '');
      if (this.avatarFile) {
        formData.append('avatar', this.avatarFile);
      }

      try {
        const response = await axios.put('/api/auth/update', formData, { withCredentials: true });
        const data = response.data;

        if (data.success) {
          store.commit('setUser', data.user);
          this.profileModified = false;
          this.avatarFile = null;
          if (data.user?.avatar_url) {
            this.avatarPreview = this.resolveAvatarUrl(data.user.avatar_url);
          }
          this.successMessage = updateType === 'avatar' ? 'Avatar mis à jour avec succès !' : 'Profil mis à jour avec succès !';
          this.showSuccessPopup = true;
          return;
        }

        this.errorMessage = data.message || 'Impossible de mettre à jour le profil.';
        this.showErrorPopup = true;
      } catch (error) {
        console.error('Erreur lors de la mise à jour :', error);
        if (updateType === 'avatar') {
          this.avatarPreview = this.previousAvatarPreview || this.resolveAvatarUrl(this.user?.avatar_url);
          this.avatarFile = null;
          const input = document.getElementById('settings-avatar');
          if (input) input.value = '';
        }
        this.errorMessage = this.extractUpdateError(error, updateType);
        this.showErrorPopup = true;
      }
    },
    extractUpdateError(error, updateType) {
      const apiMessage = getUploadErrorMessage(error, '');
      if (apiMessage) return apiMessage;
      const responseData = error.response?.data;
      const preMatch = typeof responseData === 'string' ? responseData.match(/<pre>(.*?)<\/pre>/s) : null;

      if (preMatch?.[1]) {
        const message = preMatch[1].replace(/<[^>]*>/g, '').replace(/&#39;/g, "'").trim();
        if (message.includes('ENOENT') || message.includes('no such file or directory')) {
          return "Le serveur n'arrive pas à enregistrer l'image. Le dossier d'upload avatar est probablement manquant côté API.";
        }
      }

      if (updateType === 'avatar') {
        return "L'avatar n'a pas pu être enregistré. L'image affichée a été annulée.";
      }

      return "Une erreur s'est produite pendant la mise à jour.";
    },
    async downloadJson() {
      try {
        const res = await axios.get('/api/settings/export', {
          responseType: 'blob',
          withCredentials: true
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'mes_donnees_pangeas.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Erreur export JSON :', err);
        this.errorMessage = "Erreur lors de l'export.";
        this.showErrorPopup = true;
      }
    },
    async copySupportEmail() {
      try {
        await navigator.clipboard.writeText('pangeas@contact.fr');
        this.supportCopied = true;
        window.setTimeout(() => {
          this.supportCopied = false;
        }, 1800);
      } catch (error) {
        this.errorMessage = "Impossible de copier l'adresse support.";
        this.showErrorPopup = true;
      }
    },
    async handleInstallPwa() {
      const result = await promptPwaInstall();

      if (result.outcome === 'ios-instructions' || result.outcome === 'manual-instructions' || result.outcome === 'dismissed') {
        this.errorMessage = "L'installation directe n'est pas disponible ici. Ouvrez les infos iOS ou le menu du navigateur pour l'ajouter à l'écran d'accueil.";
        this.showErrorPopup = true;
        return;
      }

      if (result.outcome === 'accepted' || result.outcome === 'installed') {
        this.successMessage = 'Pangeas est prête à être lancée comme une app.';
        this.showSuccessPopup = true;
        return;
      }

      if (result.outcome === 'unavailable') {
        this.errorMessage = "L'installation n'est pas disponible depuis ce navigateur.";
        this.showErrorPopup = true;
      }
    },
    toggleInstallHelp() {
      this.showSettingsIosInstructions = !this.showSettingsIosInstructions;
    }
  }
};
</script>

<style scoped>
.settings-page {
  --settings-bg: #fdf9f4;
  --settings-surface: #f7f3ee;
  --settings-surface-strong: #f1ede8;
  --settings-line: #d4c3be;
  --settings-muted: #665852;
  --settings-text: #1c1c19;
  --settings-primary: #442a22;
  --settings-primary-soft: #5d4037;
  --settings-pink: #e7bdb1;
  --settings-green: #adcebd;
  --settings-cream: #eee1c9;
  min-height: 100vh;
  padding: 8.25rem 1.25rem calc(6.75rem + env(safe-area-inset-bottom));
  background: var(--settings-bg);
  color: var(--settings-text);
}

.settings-topbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 7rem;
  padding: 0.9rem 1.25rem;
  background: rgba(253, 249, 244, 0.92);
  border-bottom: 1px solid rgba(212, 195, 190, 0.45);
  backdrop-filter: blur(14px);
}

.topbar-back {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  border-radius: 999px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.topbar-back:hover {
  background: rgba(68, 42, 34, 0.07);
}

.topbar-back:active {
  transform: scale(0.96);
}

.topbar-back img {
  width: 1.25rem;
  height: 1.25rem;
}

.topbar-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  min-width: 0;
  text-align: center;
}

.settings-logo {
  width: 5.7rem;
  height: auto;
  opacity: 0.62;
}

.topbar-title h1 {
  margin-top: -0.25rem;
  font-size: 1.1rem;
  line-height: 1.2;
  color: var(--settings-primary);
}

.desktop-nav {
  display: none;
  margin-left: auto;
  gap: 1.6rem;
}

.desktop-nav a {
  color: var(--settings-muted);
  font-weight: 800;
  font-size: 0.84rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
}

.desktop-nav a.active {
  color: var(--settings-primary);
  border-bottom: 2px solid var(--settings-primary);
}

.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 54rem;
  margin: 0 auto;
  padding: 1.25rem 0 4rem;
  text-align: center;
}

.avatar-control {
  position: relative;
  width: 8rem;
  height: 8rem;
  margin-bottom: 1rem;
}

.avatar-frame {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 4px solid var(--settings-surface-strong);
  border-radius: 999px;
  background: var(--settings-primary-soft);
  box-shadow: 0 10px 26px rgba(68, 42, 34, 0.16);
  cursor: pointer;
}

.avatar-frame > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  background: var(--settings-primary-soft);
}

.default-avatar img {
  width: 4.85rem;
  height: auto;
  object-fit: contain;
  opacity: 0.82;
  filter: brightness(0) invert(1);
}

.avatar-edit {
  position: absolute;
  right: 0.05rem;
  bottom: 0.2rem;
  display: grid;
  place-items: center;
  width: 2.45rem;
  height: 2.45rem;
  border: 2px solid var(--settings-bg);
  border-radius: 999px;
  background: var(--settings-primary-soft);
  box-shadow: 0 4px 12px rgba(68, 42, 34, 0.18);
}

.avatar-edit img {
  width: 1.05rem;
  filter: brightness(0) invert(1);
}

.profile-hero h2 {
  max-width: 100%;
  color: var(--settings-primary);
  font-size: clamp(2rem, 8vw, 3rem);
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.profile-hero p {
  margin-top: 0.35rem;
  color: var(--settings-muted);
  font-size: 1rem;
}

.profile-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.2rem;
}

.profile-badges span {
  padding: 0.32rem 0.9rem;
  border-radius: 999px;
  background: var(--settings-cream);
  color: var(--settings-muted);
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
}

.profile-badges .level {
  background: var(--settings-green);
  color: #18362a;
}

.settings-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 54rem;
  margin: 0 auto 3.25rem;
  opacity: 0.38;
}

.settings-divider span {
  flex: 1;
  height: 1px;
  background: var(--settings-line);
}

.settings-divider img {
  width: 1.35rem;
  opacity: 0.75;
}

.settings-section {
  max-width: 54rem;
  margin: 0 auto 2.75rem;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.25rem 0.2rem;
}

.section-heading img {
  width: 1.35rem;
  height: 1.35rem;
  filter: brightness(0) saturate(100%) invert(16%) sepia(26%) saturate(832%) hue-rotate(333deg) brightness(96%) contrast(92%);
}

.section-heading h2 {
  color: var(--settings-primary);
  font-size: 1.28rem;
}

.heading-dot,
.document-icon {
  display: grid;
  place-items: center;
  width: 1.35rem;
  height: 1.35rem;
  color: var(--settings-primary);
  font-weight: 900;
}

.heading-dot::before {
  content: "";
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
  background: var(--settings-primary);
  box-shadow: 0.45rem 0.45rem 0 -0.18rem var(--settings-pink);
}

.settings-card {
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.6rem;
  background: var(--settings-surface);
  box-shadow: 0 8px 30px rgba(68, 42, 34, 0.055);
}

.credentials-card {
  display: grid;
  gap: 1rem;
  padding: 1.35rem;
}

.field-block {
  display: grid;
  gap: 0.45rem;
  color: var(--settings-muted);
  font-weight: 700;
}

.field-control {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 3rem;
  border: 1px solid rgba(212, 195, 190, 0.95);
  border-bottom-width: 2px;
  border-radius: 0.5rem 0.5rem 0 0;
  background: rgba(241, 237, 232, 0.76);
  color: var(--settings-text);
}

.field-control input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 0.75rem 1rem;
  color: inherit;
  font: inherit;
  font-weight: 700;
}

.field-control img {
  width: 1.15rem;
  margin: 0 0.9rem;
  opacity: 0.55;
}

.readonly-control {
  justify-content: space-between;
  padding: 0;
  text-align: left;
}

.readonly-control span {
  min-width: 0;
  padding: 0.75rem 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.credentials-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.6rem;
}

.save-button,
.logout-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.65rem 1.35rem;
  border-radius: 999px;
  font-weight: 900;
}

.save-button {
  background: var(--settings-primary);
  color: #fff;
}

.logout-button {
  border: 2px solid var(--settings-primary-soft);
  color: var(--settings-primary-soft);
}

.logout-button img {
  width: 1rem;
  margin-right: 0.55rem;
}

.account-card {
  padding: 1.35rem;
}

.admin-access {
  display: none;
}

.account-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.95rem 0.6rem;
  border-radius: 0.45rem;
  color: var(--settings-text);
  text-align: left;
  transition: background 0.2s ease, transform 0.2s ease;
}

button.account-row {
  border-top: 1px solid rgba(212, 195, 190, 0.45);
}

button.account-row:hover {
  background: rgba(255, 255, 255, 0.36);
  transform: translateX(0.18rem);
}

.interactive-row:hover {
  background: rgba(255, 255, 255, 0.36);
  transform: translateX(0.18rem);
}

button.account-row:active {
  transform: translateX(0.18rem) scale(0.99);
}

.row-icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  font-size: 1.25rem;
  font-weight: 900;
}

.row-icon img,
.icon-action img,
.legal-card > a img,
.support-row button img {
  width: 1.2rem;
  height: 1.2rem;
  filter: brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(991%) hue-rotate(333deg) brightness(90%) contrast(86%);
}

.geo-icon {
  background: #f1c2b5;
  color: var(--settings-primary);
}

.admin-icon {
  background: var(--settings-primary);
}

.admin-icon img {
  filter: brightness(0) invert(1);
}

.export-icon {
  background: var(--settings-cream);
  color: var(--settings-muted);
}

.install-icon {
  background: var(--settings-green);
  color: var(--settings-primary);
}

.install-icon img {
  width: 1.25rem;
  height: 1.25rem;
  filter: brightness(0) saturate(100%) invert(16%) sepia(26%) saturate(832%) hue-rotate(333deg) brightness(96%) contrast(92%);
}

.install-row {
  border-top: 1px solid rgba(212, 195, 190, 0.45);
}

.install-download-action {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  transition: background 0.2s ease, transform 0.2s ease;
}

.install-download-action:hover {
  background: rgba(93, 64, 55, 0.08);
  transform: translateY(-1px);
}

.install-download-action img {
  width: 1.2rem;
  height: 1.2rem;
  filter: brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(991%) hue-rotate(333deg) brightness(90%) contrast(86%);
}

.install-help-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  width: fit-content;
  margin-top: 0.42rem;
  padding: 0;
  color: var(--settings-primary-soft);
  font-size: 0.76rem;
  font-weight: 900;
  text-align: left;
}

.install-help-toggle img {
  width: 0.95rem;
  height: 0.95rem;
  filter: brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(991%) hue-rotate(333deg) brightness(90%) contrast(86%);
  transition: transform 0.2s ease;
}

.install-help-toggle[aria-expanded="true"] img {
  transform: rotate(90deg);
}

.ios-install-help {
  margin-top: 0.45rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid rgba(212, 195, 190, 0.55);
  border-radius: 0.45rem;
  background: rgba(253, 249, 244, 0.72);
  color: var(--settings-primary-soft) !important;
}

.erase-icon {
  background: #e6e2dd;
  color: var(--settings-muted);
}

.row-copy {
  display: grid;
  min-width: 0;
}

.row-copy strong {
  color: #504441;
  font-size: 1rem;
  line-height: 1.35;
}

.row-copy small {
  color: var(--settings-muted);
  font-size: 0.78rem;
  line-height: 1.35;
}

.row-action {
  color: var(--settings-muted);
  font-size: 1.8rem;
  font-weight: 900;
}

.icon-action {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  transition: background 0.2s ease, transform 0.2s ease;
}

button.account-row:hover .icon-action {
  background: rgba(93, 64, 55, 0.08);
}

.interactive-row:hover .install-download-action,
.interactive-row:hover .switch span {
  background: rgba(93, 64, 55, 0.08);
}

.interactive-row:hover .switch input:checked + span {
  background: var(--settings-primary-soft);
}

.interactive-row:hover .install-download-action img {
  transform: translateY(-1px);
}

.icon-action img,
.legal-card > a img {
  transition: transform 0.2s ease;
}

button.account-row:hover .icon-action img,
.legal-card > a:hover img {
  transform: translateX(0.12rem);
}

.switch {
  position: relative;
  width: 2.85rem;
  height: 1.72rem;
  flex: 0 0 auto;
}

.switch input {
  position: absolute;
  opacity: 0;
}

.switch span {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #e6e2dd;
  transition: background 0.2s ease;
}

.switch span::before {
  content: "";
  position: absolute;
  top: 0.22rem;
  left: 0.22rem;
  width: 1.28rem;
  height: 1.28rem;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(68, 42, 34, 0.2);
  transition: transform 0.2s ease;
}

.switch input:checked + span {
  background: var(--settings-primary-soft);
}

.switch input:checked + span::before {
  transform: translateX(1.12rem);
}

.danger-zone {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 2px solid rgba(186, 26, 26, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 218, 214, 0.22);
  color: #93000a;
}

.danger-icon {
  background: #ffdad6;
  color: #ba1a1a;
}

.danger-icon img {
  filter: brightness(0) saturate(100%) invert(17%) sepia(98%) saturate(2930%) hue-rotate(347deg) brightness(91%) contrast(91%);
}

.danger-zone strong {
  display: block;
  color: #ba1a1a;
}

.danger-zone p {
  margin: 0.25rem 0 1rem;
  font-size: 0.82rem;
  line-height: 1.35;
}

.danger-zone button {
  min-height: 2.65rem;
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  background: #ba1a1a;
  color: #fff;
  font-weight: 900;
}

.legal-card {
  overflow: hidden;
}

.legal-card > a,
.support-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.3rem;
  padding: 1rem 1.35rem;
  color: #504441;
  text-decoration: none;
}

.legal-card > a,
.support-row {
  transition: background 0.2s ease, padding-left 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.legal-card > a:hover,
.support-row:hover {
  padding-left: 1.6rem;
  background: rgba(255, 255, 255, 0.34);
  color: var(--settings-primary);
}

.legal-card > a + a,
.support-row {
  border-top: 1px solid rgba(212, 195, 190, 0.45);
}

.support-row {
  position: relative;
  background: rgba(255, 255, 255, 0.24);
}

.support-row div {
  display: grid;
  gap: 0.1rem;
}

.support-row strong {
  color: var(--settings-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.support-row a {
  color: var(--settings-primary);
  font-weight: 700;
  text-decoration: none;
}

.support-copy-area {
  position: relative;
  display: inline-grid;
  place-items: center;
}

.support-row button {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  color: var(--settings-primary);
  font-size: 1.45rem;
  font-weight: 900;
  transition: background 0.2s ease, transform 0.2s ease;
}

.support-row button:hover {
  background: rgba(93, 64, 55, 0.08);
  transform: translateY(-1px);
}

.support-row:hover button {
  background: rgba(93, 64, 55, 0.08);
}

.copy-feedback {
  position: absolute;
  right: 0;
  bottom: calc(100% + 0.35rem);
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: var(--settings-primary);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 900;
  opacity: 0;
  transform: translateY(0.25rem);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.copy-feedback.visible {
  opacity: 1;
  transform: translateY(0);
}

.settings-footer {
  display: grid;
  gap: 0.3rem;
  justify-items: center;
  max-width: 54rem;
  margin: 3.25rem auto 0;
  color: rgba(68, 42, 34, 0.36);
  text-align: center;
}

.settings-footer strong {
  font-family: var(--font-logo);
  font-size: 1.55rem;
}

.settings-footer span {
  font-family: var(--font-title);
  font-size: 0.8rem;
  font-style: italic;
}

@media (min-width: 768px) {
  .settings-page {
    padding: 8.75rem 4rem 4rem;
  }

  .settings-topbar {
    padding-inline: 4rem;
  }

  .desktop-nav {
    display: flex;
  }

  .settings-logo {
    width: 10.25rem;
    opacity: 0.86;
  }

  .topbar-title h1 {
    margin-top: 0.15rem;
  }

  .credentials-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .credentials-card .field-block:last-of-type,
  .credentials-actions {
    grid-column: 1 / -1;
  }
}

@media (max-width: 767px) {
  .admin-access {
    display: grid;
    margin-bottom: 0.45rem;
    border: 1px solid rgba(93, 64, 55, 0.2);
    background: rgba(238, 225, 201, 0.5);
    text-decoration: none;
  }

  .admin-access:hover,
  .admin-access:focus-visible {
    background: rgba(238, 225, 201, 0.82);
    text-decoration: none;
    transform: translateX(0.18rem);
  }
}

@media (max-width: 420px) {
  .settings-page {
    padding-inline: 1rem;
  }

  .credentials-card,
  .account-card {
    padding: 1rem;
  }

  .account-row,
  .danger-zone {
    gap: 0.75rem;
  }

  .row-icon {
    width: 2.75rem;
    height: 2.75rem;
  }

  .danger-zone button,
  .save-button,
  .logout-button {
    width: 100%;
  }
}
</style>
