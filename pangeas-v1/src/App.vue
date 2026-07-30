<template>
  <div class="container-fluid p-0 app-shell" :class="{ 'has-mobile-bottom-nav': showMobileBottomNav }">
    <Sidebar v-if="showSidebar" @open-register="showRegisterModal" @open-login="showLoginModal"/>
    <router-view :places="places" />
    <PwaInstallNudge />
    <MobileBottomNav v-if="showMobileBottomNav" @open-login="showLoginModal" @open-register="showRegisterModal"/>
    <transition name="fade">
      <div class="modal-overlay" v-if="showRegistration">
        <div class="modal-content registration-modal">
          <button class="close-modal" @click="animateClose('registration', $event)">×</button>
          <Registration v-if="showRegistration" @open-login="showLoginModal" @close="showRegistration = false"/>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div class="modal-overlay" v-if="showLogin">
        <div class="modal-content login-modal">
          <button class="close-modal" @click="animateClose('login', $event)">×</button>
          <Connexion
              @open-register-from-login="() => {
              showLogin = false;
              showRegistration = true;
            }"
              @close-login="showLogin = false"
          />
        </div>
      </div>
    </transition>
  </div>
</template>


<script>
import axios from '@/axios.js';
import Sidebar from "./components/Sidebar.vue";
import MobileBottomNav from "./components/MobileBottomNav.vue";
import Registration from "./components/modal/Registration.vue";
import Connexion from "./components/modal/Connexion.vue";
import PwaInstallNudge from "./components/PwaInstallNudge.vue";
import store from './store';

export default {
  name: 'App',
  components: {
    Sidebar,
    MobileBottomNav,
    Registration,
    Connexion,
    PwaInstallNudge
  },
  data() {
    return {
      places: [],
      showRegistration: false,
      showLogin: false,
    };
  },
  computed: {
    isAuthRoute() {
      return ['ForgotPassword', 'ResetPassword'].includes(this.$route.name);
    },
    showSidebar() {
      return !this.$route.path.startsWith('/admin') &&
          !this.isAuthRoute &&
          !['Parametres', 'MonCompte', 'PlaceDetail'].includes(this.$route.name);
    },
    showMobileBottomNav() {
      return !this.$route.path.startsWith('/admin') && !this.isAuthRoute;
    }
  },
  watch: {
    '$route.name': {
      immediate: true,
      handler() {
        if (this.isAuthRoute) {
          this.showLogin = false;
          this.showRegistration = false;
        }
      }
    }
  },
  methods: {
    showRegisterModal() {
      this.showRegistration = true;
    },
    showLoginModal() {
      this.showRegistration = false;
      this.showLogin = true;
    },
    animateClose(modalType, event) {
      const btn = event.currentTarget;
      btn.classList.add('closing-animation');

      setTimeout(() => {
        if (modalType === 'registration') this.showRegistration = false;
        if (modalType === 'login') this.showLogin = false;
        btn.classList.remove('closing-animation');
      }, 400);
    }
  },
  async mounted() {
    try {
      const res = await axios.get('/api/places');
      this.places = res.data;

      const resUser = await axios.get('/api/auth/me', { withCredentials: true });
      if (resUser.data.success && resUser.data.user) {
        store.commit('setUser', resUser.data.user);
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err.message);
    }
  }
};
</script>

<style scoped>
.app-shell.has-mobile-bottom-nav {
  min-height: 100vh;
}

@media (max-width: 767px) {
  .app-shell.has-mobile-bottom-nav {
    padding-bottom: calc(4.4rem + env(safe-area-inset-bottom));
  }
}

@keyframes pop-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

.closing-animation {
  animation: pop-out 0.4s forwards;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  z-index: 1200;
}

.modal-content {
  background: var(--color-beige);
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  max-width: 45%;
  max-height: 90vh;
  overflow-y: auto;
}

.registration-modal {
  width: min(100%, 760px);
  max-width: min(760px, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  padding: 0;
  overflow: hidden auto;
  background: #fdf9f4;
  border-radius: 18px;
  box-shadow: 0 22px 70px rgba(33, 26, 22, 0.24);
}

.login-modal {
  width: min(100%, 540px);
  max-width: min(540px, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  padding: 0;
  overflow: hidden auto;
  background: #fdf9f4;
  border: 1px solid rgba(212, 195, 190, 0.55);
  border-radius: 18px;
  box-shadow: 0 22px 70px rgba(33, 26, 22, 0.18);
}

.close-modal {
  position: absolute;
  top: 1px;
  right: 16px;
  font-size: 50px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-brown);
  z-index: 2;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* RESPONSIVE */

@media (max-width: 768px) {
  .modal-overlay {
    align-items: stretch;
    padding: 0;
  }

  .modal-content {
    width: 90%;
    padding: 1.5rem;
    max-width: none;
  }

  .registration-modal {
    width: 100%;
    max-width: none;
    min-height: 100dvh;
    max-height: 100dvh;
    padding: 0;
    border-radius: 0;
  }

  .login-modal {
    width: 100%;
    max-width: none;
    min-height: 100dvh;
    max-height: 100dvh;
    padding: 0;
    border-radius: 0;
  }

  .registration-modal .close-modal,
  .login-modal .close-modal {
    top: 0.35rem;
    right: 0.9rem;
    font-size: 2.35rem;
  }
}

</style>
