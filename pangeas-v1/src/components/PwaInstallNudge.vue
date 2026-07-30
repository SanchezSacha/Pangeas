<template>
  <transition name="install-nudge">
    <aside v-if="isVisible" class="pwa-install-nudge" aria-live="polite">
      <button class="nudge-close" type="button" aria-label="Fermer" @click="dismiss">
        <img src="/icons/x.svg" alt="" aria-hidden="true" />
      </button>

      <span class="nudge-icon" aria-hidden="true">
        <img src="/logo_mobile_pangeas.png" alt="" />
      </span>

      <div class="nudge-copy">
        <strong>{{ title }}</strong>
        <p>{{ message }}</p>
        <ol v-if="showInstallInstructions">
          <li>Ouvrez le menu de partage.</li>
          <li>{{ installInstructionAction }}</li>
        </ol>
      </div>

      <div class="nudge-actions">
        <button class="primary-action" type="button" @click="install">
          {{ installLabel }}
        </button>
        <button class="secondary-action" type="button" @click="dismiss">
          Plus tard
        </button>
      </div>
    </aside>
  </transition>
</template>

<script>
import {
  dismissInstallNudge,
  getInstallState,
  promptPwaInstall,
  subscribeToInstallState,
} from '@/utils/pwaInstall';

export default {
  name: 'PwaInstallNudge',
  data() {
    return {
      installState: getInstallState(),
      isReadyToShow: false,
      showIosInstructions: false,
      unsubscribe: null,
      revealTimer: null,
      showManualInstructions: false,
    };
  },
  computed: {
    isVisible() {
      return this.isReadyToShow &&
          this.installState.canInstall &&
          !this.installState.wasDismissed &&
          !this.isBlockedRoute;
    },
    isBlockedRoute() {
      return this.$route.path.startsWith('/admin') ||
          ['ForgotPassword', 'ResetPassword', 'Parametres'].includes(this.$route.name);
    },
    title() {
      return this.showInstallInstructions ? 'Ajoutez Pangeas à votre écran' : 'Installez Pangeas';
    },
    message() {
      if (this.showIosInstructions) {
        return "Sur iPhone et iPad, l'installation passe par Safari.";
      }
      if (this.showManualInstructions) {
        return "Le bouton natif n'est pas disponible ici, mais vous pouvez installer l'app depuis le menu du navigateur.";
      }
      return "Retrouvez vos lieux, favoris et récompenses plus vite, même depuis votre écran d'accueil.";
    },
    installLabel() {
      return this.showInstallInstructions ? 'Compris' : 'Installer';
    },
    showInstallInstructions() {
      return this.showIosInstructions || this.showManualInstructions;
    },
    installInstructionAction() {
      return this.showIosInstructions
          ? "Choisissez \"Ajouter à l'écran d'accueil\"."
          : "Choisissez \"Installer l'application\" ou \"Ajouter à l'écran d'accueil\".";
    },
  },
  mounted() {
    this.unsubscribe = subscribeToInstallState((state) => {
      this.installState = state;
    });

    this.revealTimer = window.setTimeout(() => {
      this.isReadyToShow = true;
    }, 35000);
  },
  beforeUnmount() {
    this.unsubscribe?.();
    window.clearTimeout(this.revealTimer);
  },
  methods: {
    async install() {
      if (this.showInstallInstructions) {
        this.dismiss();
        return;
      }

      const result = await promptPwaInstall();

      if (result.outcome === 'ios-instructions') {
        this.showIosInstructions = true;
        return;
      }

      if (result.outcome === 'manual-instructions' || result.outcome === 'dismissed') {
        this.showManualInstructions = true;
        return;
      }

      if (result.outcome === 'accepted' || result.outcome === 'installed') {
        this.isReadyToShow = false;
      }
    },
    dismiss() {
      dismissInstallNudge(7);
      this.isReadyToShow = false;
    },
  },
};
</script>

<style scoped>
.pwa-install-nudge {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 1180;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  width: min(24rem, calc(100vw - 2rem));
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--color-pangeas-line) 72%, transparent);
  border-radius: 0.85rem;
  background: var(--color-pangeas-bg);
  color: var(--color-auth-text);
  box-shadow: var(--shadow-pangeas-popover);
}

.nudge-close {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  transition: background 0.2s ease, transform 0.2s ease;
}

.nudge-close:hover {
  background: rgba(68, 42, 34, 0.08);
  transform: translateY(-1px);
}

.nudge-close img {
  width: 1rem;
  height: 1rem;
}

.nudge-icon {
  display: grid;
  place-items: center;
  width: 3.65rem;
  height: 3.65rem;
  border-radius: 999px;
  background: var(--color-pangeas-primary);
  box-shadow: 0 8px 18px rgba(68, 42, 34, 0.16);
}

.nudge-icon img {
  width: 2.6rem;
  height: auto;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.nudge-copy {
  min-width: 0;
  padding-right: 1.7rem;
}

.nudge-copy strong {
  display: block;
  color: var(--color-pangeas-primary);
  font-size: 1rem;
  line-height: 1.25;
}

.nudge-copy p {
  margin: 0.25rem 0 0;
  color: var(--color-pangeas-muted);
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.35;
}

.nudge-copy ol {
  margin: 0.55rem 0 0;
  padding-left: 1rem;
  color: var(--color-pangeas-primary-soft);
  font-size: 0.78rem;
  font-weight: 800;
}

.nudge-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.55rem;
  justify-content: flex-end;
}

.nudge-actions button {
  min-height: 2.35rem;
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 900;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.primary-action {
  background: var(--color-pangeas-primary);
  color: var(--color-pangeas-bg);
}

.secondary-action {
  border: 1px solid color-mix(in srgb, var(--color-pangeas-line) 82%, transparent);
  color: var(--color-pangeas-primary);
}

.nudge-actions button:hover {
  transform: translateY(-1px);
}

.install-nudge-enter-active,
.install-nudge-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.install-nudge-enter-from,
.install-nudge-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}

@media (max-width: 767px) {
  .pwa-install-nudge {
    right: 0.75rem;
    bottom: calc(5.15rem + env(safe-area-inset-bottom));
    width: calc(100vw - 1.5rem);
  }
}
</style>
